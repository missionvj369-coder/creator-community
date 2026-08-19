// Reality Verification Engine - Capability Analyzer
// Analyzes what can be executed based on real device capabilities

import { RealDeviceProfile, CapabilityAnalysis, CapabilityRequirement, CapabilityCheck, ExecutionPath, ExecutionPathType, DetectionStatus } from './types';
import { RealityDetector } from './detector';

export class CapabilityAnalyzer {
  constructor(private detector: RealityDetector) {}

  async analyzeCapabilities(requirements: CapabilityRequirement[]): Promise<CapabilityAnalysis> {
    this.detector.log({ level: 'info', category: 'capability', message: 'Starting capability analysis...' });

    const device = await this.detector.detectDevice();
    const checks = await this.evaluateRequirements(device, requirements);
    
    const viablePaths = this.determineViablePaths(device, checks);
    const blockedPaths = this.determineBlockedPaths(device, checks);
    const recommendedPath = this.selectRecommendedPath(viablePaths);
    const fallbackPaths = this.determineFallbackPaths(recommendedPath, viablePaths);
    const blockingIssues = this.identifyBlockingIssues(checks, blockedPaths);

    const analysis: CapabilityAnalysis = {
      device,
      requirements,
      checks,
      canRun: viablePaths.length > 0,
      viablePaths,
      blockedPaths,
      resourceStatus: this.assessResourceStatus(device),
      recommendedPath,
      fallbackPaths,
      blockingIssues,
      confidence: this.calculateAnalysisConfidence(device, checks),
    };

    this.detector.log({ 
      level: 'info', 
      category: 'capability', 
      message: `Capability analysis complete. Can run: ${analysis.canRun}. Recommended path: ${recommendedPath?.type || 'none'}` 
    });

    return analysis;
  }

  // ============================================================================
  // REQUIREMENT EVALUATION
  // ============================================================================

  private async evaluateRequirements(device: RealDeviceProfile, requirements: CapabilityRequirement[]): Promise<CapabilityCheck[]> {
    const checks: CapabilityCheck[] = [];

    for (const req of requirements) {
      const check = await this.evaluateRequirement(device, req);
      checks.push(check);
      
      this.detector.log({
        level: check.available ? 'info' : 'warn',
        category: 'capability',
        message: `${req.type}: ${check.available ? 'PASS' : 'FAIL'} - ${check.message}`,
        data: { requirement: req, actual: check.actual }
      });
    }

    return checks;
  }

  private async evaluateRequirement(device: RealDeviceProfile, req: CapabilityRequirement): Promise<CapabilityCheck> {
    let actual: any;
    let available: boolean;
    let status: DetectionStatus;
    let message: string;

    switch (req.type) {
      case 'cpu':
        actual = device.cpu;
        available = device.cpu.status === 'detected';
        status = device.cpu.status;
        message = available 
          ? `CPU: ${device.cpu.model} (${device.cpu.cores} cores)`
          : `CPU not detected`;
        break;

      case 'ram':
        actual = device.ram;
        available = device.ram.status === 'detected' && device.ram.availableMB >= (req.minimum as number);
        status = device.ram.status;
        message = available
          ? `RAM: ${device.ram.availableMB}MB available (need ${req.minimum}MB)`
          : `Insufficient RAM: ${device.ram.availableMB}MB available, need ${req.minimum}MB`;
        break;

      case 'gpu':
        actual = device.gpu;
        available = device.gpu.status === 'detected' && device.gpu.capabilities.length > 0;
        status = device.gpu.status;
        message = available
          ? `GPU: ${device.gpu.model || 'detected'}`
          : `GPU not detected or not capable`;
        break;

      case 'storage':
        actual = device.storage;
        available = device.storage.status === 'detected' && device.storage.availableMB >= (req.minimum as number);
        status = device.storage.status;
        message = available
          ? `Storage: ${device.storage.availableMB}MB available (need ${req.minimum}MB)`
          : `Insufficient storage: ${device.storage.availableMB}MB available, need ${req.minimum}MB`;
        break;

      case 'runtime':
        actual = device.runtimes;
        const runtimeName = req.minimum as string;
        available = this.checkRuntimeAvailable(device.runtimes, runtimeName);
        status = available ? 'detected' : 'not_detected';
        message = available
          ? `Runtime ${runtimeName} available`
          : `Runtime ${runtimeName} not available`;
        break;

      case 'model':
        actual = device.models;
        const modelName = req.minimum as string;
        const model = device.models.find(m => m.name === modelName);
        available = model ? model.available : false;
        status = model ? model.status : 'not_detected';
        message = available
          ? `Model ${modelName} available`
          : `Model ${modelName} not available`;
        break;

      case 'codec':
        actual = device.ffmpeg;
        const codec = req.minimum as string;
        available = device.ffmpeg.status === 'detected' && device.ffmpeg.capabilities.codecs.includes(codec);
        status = device.ffmpeg.status;
        message = available
          ? `Codec ${codec} supported`
          : `Codec ${codec} not supported`;
        break;

      default:
        actual = null;
        available = false;
        status = 'unknown';
        message = `Unknown requirement type: ${req.type}`;
    }

    return {
      requirement: req,
      available,
      actual,
      status,
      message,
    };
  }

  private checkRuntimeAvailable(runtimes: any, runtimeName: string): boolean {
    switch (runtimeName) {
      case 'node':
        return runtimes.node;
      case 'python':
        return runtimes.python;
      case 'docker':
        return runtimes.docker;
      case 'browser':
        return runtimes.browser;
      default:
        return false;
    }
  }

  // ============================================================================
  // PATH DETERMINATION
  // ============================================================================

  private determineViablePaths(device: RealDeviceProfile, checks: CapabilityCheck[]): ExecutionPath[] {
    const paths: ExecutionPath[] = [];

    // GPU Path
    if (device.gpu.status === 'detected' && device.gpu.capabilities.length > 0) {
      const gpuCheck = checks.find(c => c.requirement.type === 'gpu');
      if (gpuCheck?.available) {
        paths.push(this.createExecutionPath('gpu', device, checks));
      }
    }

    // Local CPU Path
    if (device.runtimes.node || device.runtimes.python) {
      const cpuCheck = checks.find(c => c.requirement.type === 'cpu');
      const ramCheck = checks.find(c => c.requirement.type === 'ram');
      
      if (cpuCheck?.available && ramCheck?.available) {
        paths.push(this.createExecutionPath('local_cpu', device, checks));
      }
    }

    // Local Lightweight Path
    if (device.runtimes.node || device.runtimes.python) {
      paths.push(this.createExecutionPath('local_lightweight', device, checks));
    }

    // API/Cloud Path (always available if we have network)
    if (device.runtimes.node || device.runtimes.python) {
      paths.push(this.createExecutionPath('api_cloud', device, checks));
    }

    // Hybrid Path
    if (paths.length >= 2) {
      paths.push(this.createExecutionPath('hybrid', device, checks));
    }

    return paths.filter(p => p.available);
  }

  private determineBlockedPaths(device: RealDeviceProfile, checks: CapabilityCheck[]): ExecutionPath[] {
    const allPaths: ExecutionPath[] = [
      this.createExecutionPath('local', device, checks),
      this.createExecutionPath('gpu', device, checks),
      this.createExecutionPath('local_cpu', device, checks),
      this.createExecutionPath('local_lightweight', device, checks),
      this.createExecutionPath('api_cloud', device, checks),
      this.createExecutionPath('hybrid', device, checks),
    ];

    return allPaths.filter(p => !p.available);
  }

  private createExecutionPath(type: ExecutionPathType, device: RealDeviceProfile, checks: CapabilityCheck[]): ExecutionPath {
    let available = false;
    let status: DetectionStatus = 'unknown';
    let reason: string | null = null;
    const blockingIssues: string[] = [];

    switch (type) {
      case 'gpu':
        available = device.gpu.status === 'detected' && device.gpu.capabilities.length > 0;
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'No capable GPU detected';
        if (!available) blockingIssues.push('No GPU available');
        break;

      case 'local_cpu':
        const cpuCheck = checks.find(c => c.requirement.type === 'cpu');
        const ramCheck = checks.find(c => c.requirement.type === 'ram');
        available = (cpuCheck?.available || false) && (ramCheck?.available || false);
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'Insufficient CPU or RAM';
        if (!cpuCheck?.available) blockingIssues.push('CPU not available');
        if (!ramCheck?.available) blockingIssues.push('Insufficient RAM');
        break;

      case 'local_lightweight':
        available = device.runtimes.node || device.runtimes.python;
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'No runtime available';
        if (!available) blockingIssues.push('No runtime (Node.js/Python) available');
        break;

      case 'api_cloud':
        available = device.runtimes.node || device.runtimes.python;
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'No runtime for API calls';
        if (!available) blockingIssues.push('No runtime for API calls');
        break;

      case 'hybrid':
        available = (device.gpu.status === 'detected' || device.runtimes.node || device.runtimes.python);
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'Insufficient resources for hybrid execution';
        if (!available) blockingIssues.push('Insufficient resources for hybrid execution');
        break;

      case 'local':
      default:
        available = device.canRunLocal;
        status = available ? 'detected' : 'not_detected';
        reason = available ? null : 'Cannot run locally';
        if (!available) blockingIssues.push('Local execution not possible');
    }

    return {
      type,
      available,
      status,
      capabilities: {
        videoGeneration: type === 'gpu' || type === 'local_cpu',
        videoEditing: type === 'gpu' || type === 'local_cpu',
        audioGeneration: type === 'gpu' || type === 'local_cpu' || type === 'api_cloud',
        musicGeneration: type === 'gpu' || type === 'api_cloud',
        voiceGeneration: type === 'gpu' || type === 'local_cpu' || type === 'api_cloud',
        imageGeneration: type === 'gpu' || type === 'local_cpu' || type === 'api_cloud',
      },
      requirements: {
        gpuRequired: type === 'gpu',
        minRAMMB: type === 'gpu' ? 8192 : type === 'local_cpu' ? 4096 : 2048,
        minStorageMB: 1024,
        models: [],
        runtimes: device.runtimes.node ? ['node'] : device.runtimes.python ? ['python'] : [],
      },
      estimatedPerformance: {
        resolution: type === 'gpu' ? '1920x1080' : type === 'local_cpu' ? '1280x720' : '640x480',
        fps: type === 'gpu' ? 30 : type === 'local_cpu' ? 15 : 10,
        maxDuration: type === 'gpu' ? 300 : type === 'local_cpu' ? 60 : 30,
        quality: type === 'gpu' ? 'high' : type === 'local_cpu' ? 'medium' : 'low',
      },
      reason,
      blockingIssues,
      fallbackTo: this.determineFallback(type),
    };
  }

  private determineFallback(type: ExecutionPathType): ExecutionPathType | null {
    switch (type) {
      case 'gpu':
        return 'local_cpu';
      case 'local':
        return 'local_lightweight';
      case 'local_cpu':
        return 'local_lightweight';
      case 'local_lightweight':
        return 'api_cloud';
      case 'hybrid':
        return 'api_cloud';
      default:
        return null;
    }
  }

  // ============================================================================
  // PATH SELECTION
  // ============================================================================

  private selectRecommendedPath(viablePaths: ExecutionPath[]): ExecutionPath | null {
    if (viablePaths.length === 0) return null;

    // Priority order: gpu > local_cpu > hybrid > local_lightweight > api_cloud
    const priority = ['gpu', 'local_cpu', 'hybrid', 'local_lightweight', 'api_cloud'];
    
    for (const type of priority) {
      const path = viablePaths.find(p => p.type === type);
      if (path) return path;
    }

    return viablePaths[0];
  }

  private determineFallbackPaths(recommended: ExecutionPath | null, viable: ExecutionPath[]): ExecutionPath[] {
    if (!recommended) return viable;
    
    return viable.filter(p => p.type !== recommended.type);
  }

  // ============================================================================
  // RESOURCE ASSESSMENT
  // ============================================================================

  private assessResourceStatus(device: RealDeviceProfile) {
    return {
      cpu: device.cpu.status === 'detected' ? 'sufficient' : 'unknown',
      ram: device.ram.status === 'detected' && device.ram.availableMB >= 4096 ? 'sufficient' : 'insufficient',
      gpu: device.gpu.status === 'detected' ? 'sufficient' : 'unavailable',
      storage: device.storage.status === 'detected' && device.storage.availableMB >= 1024 ? 'sufficient' : 'insufficient',
    };
  }

  private identifyBlockingIssues(checks: CapabilityCheck[], blockedPaths: ExecutionPath[]): string[] {
    const issues: string[] = [];

    // Add issues from failed checks
    for (const check of checks) {
      if (!check.available) {
        issues.push(check.message);
      }
    }

    // Add issues from blocked paths
    for (const path of blockedPaths) {
      for (const issue of path.blockingIssues) {
        if (!issues.includes(issue)) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  // ============================================================================
  // CONFIDENCE CALCULATION
  // ============================================================================

  private calculateAnalysisConfidence(device: RealDeviceProfile, checks: CapabilityCheck[]): number {
    let confidence = device.confidence;

    // Reduce confidence for failed checks
    const failedChecks = checks.filter(c => !c.available).length;
    confidence -= failedChecks * 0.05;

    return Math.max(0, Math.min(1, confidence));
  }
}