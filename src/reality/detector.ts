// Reality Verification Engine - Runtime Detector
// Collects REAL hardware/software information from the current machine

import { RealDeviceProfile, DetectionStatus, CPUInfo, RAMInfo, GPUInfo, StorageInfo, OSInfo, PythonInfo, FFmpegInfo, RuntimeInfo, ModelInfo, RealityLogEvent } from './types';

export class RealityDetector {
  private logs: RealityLogEvent[] = [];
  private maxLogs = 1000;

  // Public logging interface
  log(event: Omit<RealityLogEvent, 'timestamp'>): void {
    const fullEvent: RealityLogEvent = {
      ...event,
      timestamp: new Date(),
    };
    this.logs.push(fullEvent);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Also output to console with prefix
    const prefix = `[${event.category.toUpperCase()}]`;
    console.log(`${prefix} ${event.message}`);
  }

  getLogs(): RealityLogEvent[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  // ============================================================================
  // MAIN DETECTION METHOD
  // ============================================================================

  async detectDevice(): Promise<RealDeviceProfile> {
    this.log({ level: 'info', category: 'detection', message: 'Starting device detection...' });

    const [cpu, ram, gpu, storage, os, python, ffmpeg, runtimes, models] = await Promise.all([
      this.detectCPU(),
      this.detectRAM(),
      this.detectGPU(),
      this.detectStorage(),
      this.detectOS(),
      this.detectPython(),
      this.detectFFmpeg(),
      this.detectRuntimes(),
      this.detectModels(),
    ]);

    const profile: RealDeviceProfile = {
      timestamp: new Date(),
      cpu,
      ram,
      gpu,
      storage,
      os,
      python,
      ffmpeg,
      runtimes,
      models,
      canRunLocal: this.assessLocalCapability(runtimes, models),
      canRunGPU: gpu.status === 'detected' && gpu.capabilities.length > 0,
      canRunCPU: runtimes.node || runtimes.python,
      confidence: this.calculateConfidence(cpu, ram, gpu, storage, os, runtimes),
      raw: {
        cpu: cpu,
        memory: ram,
        gpu: gpu,
        disk: storage,
      },
    };

    this.log({ level: 'info', category: 'detection', message: `Device detection complete. Confidence: ${(profile.confidence * 100).toFixed(0)}%` });
    
    return profile;
  }

  // ============================================================================
  // CPU DETECTION
  // ============================================================================

  private async detectCPU(): Promise<CPUInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting CPU...' });

    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const os = require('os');
        const cpus = os.cpus();
        const model = cpus[0]?.model || 'unknown';
        const cores = cpus.length;
        const threads = cores * (cpus[0]?.times ? 2 : 1);

        this.log({ level: 'info', category: 'detection', message: `CPU detected: ${model} (${cores} cores)`, data: { model, cores, threads } });

        return {
          model,
          cores,
          threads,
          architecture: process.arch || os.arch() || 'unknown',
          status: 'detected',
          source: 'node-os-module',
        };
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `CPU detection failed: ${error}`, data: { error } });
    }

    return {
      model: 'unknown',
      cores: 1,
      threads: 2,
      architecture: 'unknown',
      status: 'unknown',
      source: 'fallback-defaults',
    };
  }

  // ============================================================================
  // RAM DETECTION
  // ============================================================================

  private async detectRAM(): Promise<RAMInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting RAM...' });

    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const os = require('os');
        const totalMB = Math.floor(os.totalmem() / 1024 / 1024);
        const availableMB = Math.floor(os.freemem() / 1024 / 1024);

        this.log({ level: 'info', category: 'detection', message: `RAM detected: ${totalMB}MB total, ${availableMB}MB available`, data: { totalMB, availableMB } });

        return {
          totalMB,
          availableMB,
          status: 'detected',
          source: 'node-os-module',
        };
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `RAM detection failed: ${error}`, data: { error } });
    }

    return {
      totalMB: 0,
      availableMB: 0,
      status: 'unknown',
      source: 'fallback-defaults',
    };
  }

  // ============================================================================
  // GPU DETECTION
  // ============================================================================

  private async detectGPU(): Promise<GPUInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting GPU...' });

    const capabilities: string[] = [];

    try {
      // Try to get GPU info from Node.js
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Check for NVIDIA GPU
        try {
          const { execSync } = require('child_process');
          
          // Try nvidia-smi
          try {
            const nvidiaSmi = execSync('nvidia-smi --query-gpu=index,name,memory.total,memory.free,driver_version --format=csv,noheader,nounits', {
              encoding: 'utf8',
              stdio: ['pipe', 'pipe', 'pipe'],
            });
            
            const lines = nvidiaSmi.trim().split('\n');
            if (lines.length > 0 && lines[0]) {
              const parts = lines[0].split(', ');
              if (parts.length >= 4) {
                const model = parts[1]?.trim() || 'unknown';
                const vramMB = parseInt(parts[2]?.trim() || '0', 10);
                const driverVersion = parts[3]?.trim() || 'unknown';

                capabilities.push('nvidia', 'cuda', 'cudnn');

                this.log({ level: 'info', category: 'detection', message: `NVIDIA GPU detected: ${model} (${vramMB}MB VRAM)`, data: { model, vramMB, driverVersion } });

                return {
                  vendor: 'NVIDIA',
                  model,
                  vramMB,
                  driverVersion,
                  status: 'detected',
                  source: 'nvidia-smi',
                  capabilities,
                };
              }
            }
          } catch {
            // nvidia-smi not available
          }

          // Try lspci for Linux
          try {
            const lspci = execSync('lspci | grep -i vga', { encoding: 'utf8' });
            const gpuLine = lspci.split('\n')[0];
            if (gpuLine) {
              const model = gpuLine.split(':').pop()?.trim() || 'unknown';
              
              capabilities.push('pci-detected');

              this.log({ level: 'info', category: 'detection', message: `GPU detected via lspci: ${model}`, data: { model } });

              return {
                vendor: null,
                model,
                vramMB: null,
                driverVersion: null,
                status: 'detected',
                source: 'lspci',
                capabilities,
              };
            }
          } catch {
            // lspci not available
          }
        } catch {
          // Cannot execute commands
        }
      }

      // Check for WebGL/WebGPU in browser
      if (typeof navigator !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const model = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            
            capabilities.push('webgl');

            this.log({ level: 'info', category: 'detection', message: `GPU detected via WebGL: ${model}`, data: { vendor, model } });

            return {
              vendor,
              model,
              vramMB: null,
              driverVersion: null,
              status: 'detected',
              source: 'webgl',
              capabilities,
            };
          }
        }

        // Check for WebGPU
        if ('gpu' in navigator) {
          capabilities.push('webgpu');
          this.log({ level: 'info', category: 'detection', message: 'WebGPU detected' });

          return {
            vendor: null,
            model: 'WebGPU',
            vramMB: null,
            driverVersion: null,
            status: 'detected',
            source: 'webgpu',
            capabilities,
          };
        }
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `GPU detection error: ${error}`, data: { error } });
    }

    this.log({ level: 'info', category: 'detection', message: 'No GPU detected' });

    return {
      vendor: null,
      model: null,
      vramMB: null,
      driverVersion: null,
      status: 'not_detected',
      source: 'no-detection-method-available',
      capabilities: [],
    };
  }

  // ============================================================================
  // STORAGE DETECTION
  // ============================================================================

  private async detectStorage(): Promise<StorageInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting storage...' });

    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const fs = require('fs');
        const path = require('path');
        
        // Get current drive stats
        const currentDir = process.cwd();
        const stats = fs.statfsSync(currentDir);
        
        const totalMB = Math.floor((stats.blocks * stats.bsize) / 1024 / 1024);
        const availableMB = Math.floor((stats.bfree * stats.bsize) / 1024 / 1024);

        this.log({ level: 'info', category: 'detection', message: `Storage detected: ${totalMB}MB total, ${availableMB}MB available`, data: { totalMB, availableMB } });

        return {
          totalMB,
          availableMB,
          status: 'detected',
          source: 'node-fs-statfs',
        };
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `Storage detection failed: ${error}`, data: { error } });
    }

    return {
      totalMB: 0,
      availableMB: 0,
      status: 'unknown',
      source: 'fallback-defaults',
    };
  }

  // ============================================================================
  // OS DETECTION
  // ============================================================================

  private async detectOS(): Promise<OSInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting operating system...' });

    try {
      if (typeof process !== 'undefined' && process.platform) {
        const platform = process.platform;
        let name = 'unknown';
        let version = 'unknown';

        switch (platform) {
          case 'win32':
            name = 'Windows';
            try {
              const { execSync } = require('child_process');
              version = execSync('ver', { encoding: 'utf8' }).trim();
            } catch {
              version = process.release?.name || 'unknown';
            }
            break;
          case 'darwin':
            name = 'macOS';
            try {
              const { execSync } = require('child_process');
              version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
            } catch {
              version = 'unknown';
            }
            break;
          case 'linux':
            name = 'Linux';
            try {
              const { execSync } = require('child_process');
              version = execSync('uname -r', { encoding: 'utf8' }).trim();
            } catch {
              version = 'unknown';
            }
            break;
          default:
            name = platform;
        }

        this.log({ level: 'info', category: 'detection', message: `OS detected: ${name} ${version}`, data: { name, version, platform } });

        return {
          name,
          version,
          platform,
          status: 'detected',
          source: 'node-process-platform',
        };
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `OS detection failed: ${error}`, data: { error } });
    }

    return {
      name: 'unknown',
      version: 'unknown',
      platform: 'unknown',
      status: 'unknown',
      source: 'fallback-defaults',
    };
  }

  // ============================================================================
  // PYTHON DETECTION
  // ============================================================================

  private async detectPython(): Promise<PythonInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting Python...' });

    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const { execSync } = require('child_process');

        // Try python3 first, then python
        const commands = ['python3 --version', 'python --version'];
        
        for (const cmd of commands) {
          try {
            const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            const versionMatch = output.match(/Python (\d+\.\d+\.\d+)/);
            if (versionMatch) {
              const version = versionMatch[1];
              const path = cmd.split(' ')[0];

              this.log({ level: 'info', category: 'detection', message: `Python detected: ${version}`, data: { version, path } });

              return {
                version,
                path,
                status: 'detected',
                source: 'execSync',
              };
            }
          } catch {
            // Try next command
          }
        }
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `Python detection failed: ${error}`, data: { error } });
    }

    this.log({ level: 'info', category: 'detection', message: 'Python not detected' });

    return {
      version: null,
      path: null,
      status: 'not_detected',
      source: 'no-python-found',
    };
  }

  // ============================================================================
  // FFMPEG DETECTION
  // ============================================================================

  private async detectFFmpeg(): Promise<FFmpegInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting FFmpeg...' });

    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const { execSync } = require('child_process');

        try {
          const output = execSync('ffmpeg -version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
          const lines = output.split('\n');
          const versionLine = lines[0];
          const versionMatch = versionLine.match(/ffmpeg version (\S+)/);
          
          const version = versionMatch ? versionMatch[1] : 'unknown';
          
          // Check capabilities
          const hasVideo = output.includes('--enable-libx264') || output.includes('--enable-encoder=libx264');
          const hasAudio = output.includes('--enable-libmp3lame') || output.includes('--enable-encoder=libmp3lame');
          
          // Extract codecs
          const codecs: string[] = [];
          if (output.includes('libx264')) codecs.push('h264');
          if (output.includes('libx265')) codecs.push('h265');
          if (output.includes('libvpx')) codecs.push('vp8');
          if (output.includes('libvpx-vp9')) codecs.push('vp9');
          if (output.includes('aac')) codecs.push('aac');
          if (output.includes('mp3')) codecs.push('mp3');

          this.log({ level: 'info', category: 'detection', message: `FFmpeg detected: ${version}`, data: { version, hasVideo, hasAudio, codecs } });

          return {
            version,
            path: 'ffmpeg',
            status: 'detected',
            source: 'execSync',
            capabilities: {
              video: hasVideo,
              audio: hasAudio,
              codecs,
            },
          };
        } catch {
          // FFmpeg not found
        }
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'detection', message: `FFmpeg detection failed: ${error}`, data: { error } });
    }

    this.log({ level: 'info', category: 'detection', message: 'FFmpeg not detected' });

    return {
      version: null,
      path: null,
      status: 'not_detected',
      source: 'no-ffmpeg-found',
      capabilities: {
        video: false,
        audio: false,
        codecs: [],
      },
    };
  }

  // ============================================================================
  // RUNTIME DETECTION
  // ============================================================================

  private async detectRuntimes(): Promise<RuntimeInfo> {
    this.log({ level: 'info', category: 'detection', message: 'Detecting runtimes...' });

    const info: RuntimeInfo = {
      node: false,
      nodeVersion: null,
      python: false,
      pythonVersion: null,
      docker: false,
      browser: false,
      localLLM: false,
      localLLMTools: [],
      status: 'unknown',
      source: 'multi-method',
    };

    try {
      // Node.js
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        info.node = true;
        info.nodeVersion = process.versions.node;
        this.log({ level: 'info', category: 'detection', message: `Node.js detected: ${info.nodeVersion}` });
      }

      // Browser
      if (typeof window !== 'undefined') {
        info.browser = true;
        this.log({ level: 'info', category: 'detection', message: 'Browser environment detected' });
      }

      // Python
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const { execSync } = require('child_process');
        const commands = ['python3 --version', 'python --version'];
        
        for (const cmd of commands) {
          try {
            const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            const versionMatch = output.match(/Python (\d+\.\d+\.\d+)/);
            if (versionMatch) {
              info.python = true;
              info.pythonVersion = versionMatch[1];
              this.log({ level: 'info', category: 'detection', message: `Python detected: ${info.pythonVersion}` });
              break;
            }
          } catch {
            // Try next
          }
        }
      }

      // Docker
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = require('child_process');
          execSync('docker --version', { stdio: ['pipe', 'pipe', 'pipe'] });
          info.docker = true;
          this.log({ level: 'info', category: 'detection', message: 'Docker detected' });
        } catch {
          // Docker not available
        }
      }

      // Local LLM tools
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = require('child_process');
          const llmTools = ['ollama', 'llama.cpp', 'lm-studio'];
          
          for (const tool of llmTools) {
            try {
              execSync(`${tool} --version`, { stdio: ['pipe', 'pipe', 'pipe'] });
              info.localLLMTools.push(tool);
              info.localLLM = true;
              this.log({ level: 'info', category: 'detection', message: `Local LLM tool detected: ${tool}` });
            } catch {
              // Tool not available
            }
          }
        } catch {
          // Cannot execute commands
        }
      }

      // Determine overall status
      if (info.node || info.python) {
        info.status = 'detected';
      } else {
        info.status = 'not_detected';
      }
    } catch (error) {
      this.log({ level: 'error', category: 'detection', message: `Runtime detection failed: ${error}`, data: { error } });
      info.status = 'unknown';
    }

    return info;
  }

  // ============================================================================
  // MODEL DETECTION
  // ============================================================================

  private async detectModels(): Promise<ModelInfo[]> {
    this.log({ level: 'info', category: 'model', message: 'Detecting available models...' });

    const models: ModelInfo[] = [];

    try {
      // Check Ollama models
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = require('child_process');
          
          try {
            const output = execSync('ollama list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            const lines = output.split('\n').slice(1); // Skip header
            
            for (const line of lines) {
              if (!line.trim()) continue;
              
              const parts = line.split(/\s+/);
              if (parts.length >= 3) {
                const name = parts[0];
                const size = parts[2];
                
                models.push({
                  name,
                  source: 'ollama',
                  runtime: 'ollama',
                  local: true,
                  installed: true,
                  available: true,
                  estimatedVRAMMB: null,
                  estimatedRAMMB: null,
                  compatible: null,
                  reason: null,
                  status: 'detected',
                });

                this.log({ level: 'info', category: 'model', message: `Model detected: ${name} (${size})`, data: { name, size } });
              }
            }
          } catch {
            // Ollama not running or no models
          }
        } catch {
          // Cannot execute commands
        }
      }
    } catch (error) {
      this.log({ level: 'warn', category: 'model', message: `Model detection failed: ${error}`, data: { error } });
    }

    if (models.length === 0) {
      this.log({ level: 'info', category: 'model', message: 'No models detected' });
    }

    return models;
  }

  // ============================================================================
  // ASSESSMENT HELPERS
  // ============================================================================

  private assessLocalCapability(runtimes: RuntimeInfo, models: ModelInfo[]): boolean {
    // Can run locally if we have a runtime and optionally models
    const hasRuntime = runtimes.node || runtimes.python;
    const hasLocalModels = models.some(m => m.local && m.available);
    
    return hasRuntime; // Models are optional
  }

  private calculateConfidence(
    cpu: CPUInfo,
    ram: RAMInfo,
    gpu: GPUInfo,
    storage: StorageInfo,
    os: OSInfo,
    runtimes: RuntimeInfo
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for each detected component
    if (cpu.status === 'detected') confidence += 0.1;
    if (ram.status === 'detected') confidence += 0.1;
    if (gpu.status === 'detected') confidence += 0.1;
    if (storage.status === 'detected') confidence += 0.1;
    if (os.status === 'detected') confidence += 0.1;
    if (runtimes.node) confidence += 0.1;
    if (runtimes.python) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}