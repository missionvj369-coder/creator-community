// Capability Matching Engine
// Matches project requirements with human and device capabilities
// Implements the Lowest-Feasible-Resource Principle

import {
  ExecutionPath,
  ExecutionApproach,
  ResourceLevel,
  SecurityImplications,
  PrivacyImplications,
  HumanCapabilityProfile,
  HumanCapabilityLevel,
  DeviceProfile,
} from '../types';

export interface ProjectRequirements {
  coreFunctionality: string[];
  performance: 'minimal' | 'standard' | 'high';
  dataSensitivity: 'public' | 'internal' | 'sensitive' | 'critical';
  offlineCapable: boolean;
  realTimeRequired: boolean;
  scalability: 'single-user' | 'small-group' | 'community' | 'large-scale';
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export class CapabilityMatcher {
  match(
    requirements: ProjectRequirements,
    humanProfile: HumanCapabilityProfile,
    deviceProfile: DeviceProfile
  ): ExecutionPath[] {
    const paths: ExecutionPath[] = [];

    // Generate paths from lowest to highest resource requirement
    // Level 0: Browser-only
    if (this.canUseBrowserOnly(requirements, deviceProfile)) {
      paths.push(this.createBrowserOnlyPath(requirements, humanProfile, deviceProfile));
    }

    // Level 1: Local lightweight tools
    if (this.canUseLocalTools(requirements, deviceProfile)) {
      paths.push(this.createLocalToolsPath(requirements, humanProfile, deviceProfile));
    }

    // Level 2: Lightweight models
    if (this.canUseLightweightModel(requirements, deviceProfile)) {
      paths.push(this.createLightweightModelPath(requirements, humanProfile, deviceProfile));
    }

    // Level 3: Hybrid local + remote
    if (this.canUseHybrid(requirements, deviceProfile)) {
      paths.push(this.createHybridPath(requirements, humanProfile, deviceProfile));
    }

    // Level 4: GPU accelerated
    if (this.canUseGPUAcceleration(requirements, deviceProfile)) {
      paths.push(this.createGPUAcceleratedPath(requirements, humanProfile, deviceProfile));
    }

    // Level 5: High-performance local
    if (this.canUseHighPerformanceLocal(requirements, deviceProfile)) {
      paths.push(this.createHighPerformancePath(requirements, humanProfile, deviceProfile));
    }

    // Level 6: Distributed/cloud
    if (this.canUseDistributed(requirements, deviceProfile)) {
      paths.push(this.createDistributedPath(requirements, humanProfile, deviceProfile));
    }

    // Sort by feasibility (highest first)
    return paths.sort((a, b) => b.feasibility - a.feasibility);
  }

  private canUseBrowserOnly(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // Browser-only works for:
    // - Low complexity
    // - Public/internal data
    // - Small to medium scale
    // - No real-time requirements or simple real-time
    return (
      requirements.estimatedComplexity === 'low' &&
      (requirements.dataSensitivity === 'public' || requirements.dataSensitivity === 'internal') &&
      (requirements.scalability === 'single-user' || requirements.scalability === 'small-group') &&
      device.runtimeCapabilities.browser &&
      device.acceleration.webGL // Some acceleration available
    );
  }

  private canUseLocalTools(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // Local tools work for:
    // - Low to medium complexity
    // - Any data sensitivity (stays local)
    // - Offline capable
    return (
      requirements.estimatedComplexity !== 'high' &&
      device.runtimeCapabilities.node &&
      device.ramAvailable >= 2048 // 2GB minimum
    );
  }

  private canUseLightweightModel(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // Lightweight models work for:
    // - Medium complexity
    // - Requires local LLM capability or wasm
    return (
      requirements.estimatedComplexity === 'medium' &&
      (device.runtimeCapabilities.localLLM || device.acceleration.wasm) &&
      device.ramAvailable >= 4096 // 4GB minimum
    );
  }

  private canUseHybrid(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // Hybrid works for:
    // - Medium to high complexity
    // - Requires some cloud/remote capability
    // - Has network connectivity
    return (
      requirements.estimatedComplexity !== 'low' &&
      device.network.type !== 'unknown' &&
      !!device.network.offlineCapable
    );
  }

  private canUseGPUAcceleration(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // GPU acceleration works for:
    // - High complexity
    // - Has GPU available
    return (
      requirements.estimatedComplexity === 'high' &&
      !!device.gpu &&
      !!device.vram &&
      device.vram >= 2048 // 2GB VRAM minimum
    );
  }

  private canUseHighPerformanceLocal(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // High-performance local works for:
    // - High complexity
    // - Lots of RAM
    // - No GPU but strong CPU
    return (
      requirements.estimatedComplexity === 'high' &&
      device.ramAvailable >= 16384 && // 16GB minimum
      device.cpuCores >= 8
    );
  }

  private canUseDistributed(requirements: ProjectRequirements, device: DeviceProfile): boolean {
    // Distributed/cloud works for:
    // - Any complexity
    // - Large scale
    // - Has network
    return (
      requirements.scalability === 'large-scale' ||
      requirements.estimatedComplexity === 'high'
    );
  }

  private createBrowserOnlyPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'browser-only');
    
    return {
      id: 'browser-only',
      name: 'Browser-First',
      description: 'Runs entirely in the browser using web technologies',
      resourceLevel: {
        ram: 512,
        storage: 100,
        cpu: 'Any modern CPU',
        network: 'Optional',
        estimatedCost: 'free',
        complexity: 'low',
      },
      capabilities: ['HTML', 'CSS', 'JavaScript', 'Web APIs'],
      approach: 'browser-only',
      feasibility,
      reasoning: this.generateReasoning('browser-only', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'low',
        concerns: ['Limited system access', 'Sandboxed environment'],
        mitigations: ['Browser security model', 'No local file system access'],
        requiresSandbox: false,
        requiresApproval: false,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: false,
        dataTypes: ['User input only'],
        retention: 'Session only',
        sharing: [],
        concerns: [],
      },
    };
  }

  private createLocalToolsPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'local-tools');
    
    return {
      id: 'local-tools',
      name: 'Local Tools',
      description: 'Uses lightweight local tools and libraries',
      resourceLevel: {
        ram: 2048,
        storage: 500,
        cpu: 'Modern multi-core CPU',
        network: 'Optional',
        estimatedCost: 'free',
        complexity: 'low',
      },
      capabilities: ['Node.js', 'npm packages', 'Local file system'],
      approach: 'local-tools',
      feasibility,
      reasoning: this.generateReasoning('local-tools', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'low',
        concerns: ['Local file system access', 'Package dependencies'],
        mitigations: ['Sandboxed execution', 'Dependency scanning', 'Least privilege'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: false,
        dataTypes: ['All data stays local'],
        retention: 'User controlled',
        sharing: [],
        concerns: [],
      },
    };
  }

  private createLightweightModelPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'lightweight-model');
    
    return {
      id: 'lightweight-model',
      name: 'Lightweight Local Model',
      description: 'Uses small local AI models (e.g., quantized LLMs)',
      resourceLevel: {
        ram: 4096,
        storage: 2000,
        cpu: 'Modern multi-core CPU',
        network: 'Not required',
        estimatedCost: 'free',
        complexity: 'medium',
      },
      capabilities: ['Local LLM', 'WASM', 'Model inference'],
      approach: 'lightweight-model',
      feasibility,
      reasoning: this.generateReasoning('lightweight-model', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'low',
        concerns: ['Model execution', 'Local resource usage'],
        mitigations: ['Sandboxed inference', 'Resource limits', 'No external calls'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: false,
        dataTypes: ['All processing local'],
        retention: 'User controlled',
        sharing: [],
        concerns: [],
      },
    };
  }

  private createHybridPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'hybrid-local-remote');
    
    return {
      id: 'hybrid-local-remote',
      name: 'Hybrid Local + Remote',
      description: 'Combines local processing with remote services',
      resourceLevel: {
        ram: 2048,
        storage: 500,
        cpu: 'Modern CPU',
        network: 'Required (intermittent OK)',
        estimatedCost: 'freemium',
        complexity: 'medium',
      },
      capabilities: ['Local processing', 'Remote APIs', 'Data synchronization'],
      approach: 'hybrid-local-remote',
      feasibility,
      reasoning: this.generateReasoning('hybrid-local-remote', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'medium',
        concerns: ['Data transmission', 'Remote service trust', 'API keys'],
        mitigations: ['Encryption in transit', 'Minimal data sharing', 'Credential isolation', 'Provider verification'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: true,
        dataTypes: ['Sensitive data local', 'Non-sensitive data remote'],
        retention: 'User controlled local, provider policy remote',
        sharing: ['Remote service provider'],
        concerns: ['Data in transit', 'Provider data policies'],
      },
    };
  }

  private createGPUAcceleratedPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'gpu-accelerated');
    
    return {
      id: 'gpu-accelerated',
      name: 'GPU Accelerated',
      description: 'Uses GPU for accelerated processing',
      resourceLevel: {
        ram: 8192,
        storage: 5000,
        cpu: 'Modern multi-core CPU',
        gpu: device.gpu,
        network: 'Optional',
        estimatedCost: 'free',
        complexity: 'high',
      },
      capabilities: ['GPU compute', 'WebGL/WebGPU', 'Parallel processing'],
      approach: 'gpu-accelerated',
      feasibility,
      reasoning: this.generateReasoning('gpu-accelerated', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'medium',
        concerns: ['GPU resource access', 'Compute shader execution'],
        mitigations: ['GPU sandboxing', 'Resource limits', 'Timeout controls'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: false,
        dataTypes: ['All processing local'],
        retention: 'User controlled',
        sharing: [],
        concerns: [],
      },
    };
  }

  private createHighPerformancePath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'high-performance-local');
    
    return {
      id: 'high-performance-local',
      name: 'High-Performance Local',
      description: 'Uses full local resources for demanding tasks',
      resourceLevel: {
        ram: 16384,
        storage: 10000,
        cpu: 'High-core-count CPU',
        network: 'Optional',
        estimatedCost: 'free',
        complexity: 'high',
      },
      capabilities: ['Multi-threading', 'Local databases', 'Advanced libraries'],
      approach: 'high-performance-local',
      feasibility,
      reasoning: this.generateReasoning('high-performance-local', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'medium',
        concerns: ['High resource usage', 'Complex dependencies'],
        mitigations: ['Sandboxed execution', 'Dependency scanning', 'Resource monitoring'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: true,
        dataRemote: false,
        dataTypes: ['All processing local'],
        retention: 'User controlled',
        sharing: [],
        concerns: [],
      },
    };
  }

  private createDistributedPath(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): ExecutionPath {
    const feasibility = this.calculateFeasibility(requirements, human, device, 'distributed-cloud');
    
    return {
      id: 'distributed-cloud',
      name: 'Distributed Cloud',
      description: 'Uses cloud infrastructure for large-scale deployment',
      resourceLevel: {
        ram: 2048,
        storage: 1000,
        cpu: 'Standard',
        network: 'Required (reliable)',
        estimatedCost: 'paid',
        complexity: 'high',
      },
      capabilities: ['Cloud services', 'Distributed processing', 'Auto-scaling'],
      approach: 'distributed-cloud',
      feasibility,
      reasoning: this.generateReasoning('distributed-cloud', feasibility, requirements, human, device),
      securityImplications: {
        riskLevel: 'high',
        concerns: ['Data in cloud', 'Multi-tenant environment', 'Provider trust', 'Compliance'],
        mitigations: ['End-to-end encryption', 'Provider vetting', 'Data minimization', 'Audit logging'],
        requiresSandbox: true,
        requiresApproval: true,
      },
      privacyImplications: {
        dataLocal: false,
        dataRemote: true,
        dataTypes: ['All data remote'],
        retention: 'Provider policy',
        sharing: ['Cloud provider', 'Potential third parties'],
        concerns: ['Data sovereignty', 'Provider policies', 'Jurisdiction'],
      },
    };
  }

  private calculateFeasibility(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile,
    approach: ExecutionApproach
  ): number {
    let score = 0.5; // Base score

    // Device capability match (0-0.3)
    const deviceScore = this.assessDeviceCapability(requirements, device, approach);
    score += deviceScore * 0.3;

    // Human capability match (0-0.3)
    const humanScore = this.assessHumanCapability(requirements, human, approach);
    score += humanScore * 0.3;

    // Resource availability (0-0.2)
    const resourceScore = this.assessResourceAvailability(requirements, device, approach);
    score += resourceScore * 0.2;

    // Security/privacy alignment (0-0.2)
    const securityScore = this.assessSecurityAlignment(requirements, approach);
    score += securityScore * 0.2;

    return Math.min(1.0, Math.max(0.0, score));
  }

  private assessDeviceCapability(
    requirements: ProjectRequirements,
    device: DeviceProfile,
    approach: ExecutionApproach
  ): number {
    let score = 0.5;

    switch (approach) {
      case 'browser-only':
        if (device.runtimeCapabilities.browser) score += 0.3;
        if (device.acceleration.webGL) score += 0.2;
        break;
      case 'local-tools':
        if (device.runtimeCapabilities.node) score += 0.3;
        if (device.ramAvailable >= 2048) score += 0.2;
        break;
      case 'lightweight-model':
        if (device.runtimeCapabilities.localLLM) score += 0.3;
        if (device.ramAvailable >= 4096) score += 0.2;
        break;
      case 'hybrid-local-remote':
        if (device.network.type !== 'unknown') score += 0.3;
        if (device.network.estimatedBandwidth && device.network.estimatedBandwidth > 1) score += 0.2;
        break;
      case 'gpu-accelerated':
        if (device.gpu && device.vram && device.vram >= 2048) score += 0.5;
        break;
      case 'high-performance-local':
        if (device.ramAvailable >= 16384) score += 0.3;
        if (device.cpuCores >= 8) score += 0.2;
        break;
      case 'distributed-cloud':
        if (device.network.type !== 'unknown') score += 0.5;
        break;
    }

    return Math.min(1.0, score);
  }

  private assessHumanCapability(
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    approach: ExecutionApproach
  ): number {
    let score = 0.5;

    // Adjust based on approach complexity
    const approachComplexity: Record<ExecutionApproach, number> = {
      'browser-only': 1,
      'local-tools': 2,
      'lightweight-model': 3,
      'hybrid-local-remote': 4,
      'gpu-accelerated': 5,
      'high-performance-local': 5,
      'distributed-cloud': 6,
    };

    const complexity = approachComplexity[approach];
    const humanLevel = this.getHumanLevelNumber(human.level);

    // Human should be at least at the approach complexity level
    if (humanLevel >= complexity) {
      score += 0.3;
    } else if (humanLevel === complexity - 1) {
      score += 0.1;
    }

    // Adjust for desired guidance
    if (human.desiredGuidance === 'detailed' && complexity <= 2) {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  private assessResourceAvailability(
    requirements: ProjectRequirements,
    device: DeviceProfile,
    approach: ExecutionApproach
  ): number {
    // Simplified resource check
    const ramRequirements: Record<ExecutionApproach, number> = {
      'browser-only': 512,
      'local-tools': 2048,
      'lightweight-model': 4096,
      'hybrid-local-remote': 2048,
      'gpu-accelerated': 8192,
      'high-performance-local': 16384,
      'distributed-cloud': 2048,
    };

    const requiredRam = ramRequirements[approach];
    if (device.ramAvailable >= requiredRam) {
      return 1.0;
    } else if (device.ramAvailable >= requiredRam * 0.5) {
      return 0.5;
    }
    return 0.0;
  }

  private assessSecurityAlignment(
    requirements: ProjectRequirements,
    approach: ExecutionApproach
  ): number {
    // Higher score for approaches that keep data local when sensitivity is high
    if (requirements.dataSensitivity === 'critical' || requirements.dataSensitivity === 'sensitive') {
      if (approach === 'browser-only' || approach === 'local-tools' || approach === 'lightweight-model') {
        return 1.0;
      } else if (approach === 'hybrid-local-remote') {
        return 0.5;
      } else {
        return 0.2;
      }
    }
    return 0.8; // Default good score
  }

  private getHumanLevelNumber(level: HumanCapabilityLevel): number {
    const levels: Record<HumanCapabilityLevel, number> = {
      'beginner': 1,
      'guided': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5,
    };
    return levels[level];
  }

  private generateReasoning(
    approach: ExecutionApproach,
    feasibility: number,
    requirements: ProjectRequirements,
    human: HumanCapabilityProfile,
    device: DeviceProfile
  ): string {
    const reasons: string[] = [];

    if (feasibility >= 0.8) {
      reasons.push('Excellent match for current capabilities');
    } else if (feasibility >= 0.6) {
      reasons.push('Good match with minor considerations');
    } else if (feasibility >= 0.4) {
      reasons.push('Feasible but requires careful setup');
    } else {
      reasons.push('Possible but challenging given current constraints');
    }

    if (device.ramAvailable < 2048) {
      reasons.push('Low RAM device - browser-first approach recommended');
    }

    if (human.level === 'beginner') {
      reasons.push('Simplified interface and guided workflow available');
    }

    if (requirements.dataSensitivity === 'critical') {
      reasons.push('Local-only execution to protect sensitive data');
    }

    return reasons.join('. ') + '.';
  }
}