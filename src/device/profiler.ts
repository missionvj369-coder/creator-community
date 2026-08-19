// Device Intelligence - Lightweight, local-first device profiling
// Non-invasive, privacy-respecting, minimal data collection
// Uses SystemDiagnostics for real-time hardware detection

import { DeviceProfile, NetworkProfile, AccelerationSupport, RuntimeCapabilities } from '../types';
import { systemDiagnostics, SystemInfo } from './system-diagnostics';

export class DeviceProfiler {
  private systemInfo: SystemInfo | null = null;

  async profile(): Promise<DeviceProfile> {
    // Get real system information
    this.systemInfo = await systemDiagnostics.getSystemInfo();

    const profile: DeviceProfile = {
      os: this.detectOS(),
      architecture: this.detectArchitecture(),
      cpu: this.detectCPU(),
      cpuCores: this.detectCPUCores(),
      cpuThreads: this.detectCPUThreads(),
      ramTotal: this.detectRAMTotal(),
      ramAvailable: this.detectRAMAvailable(),
      gpu: this.detectGPU(),
      gpuVendor: this.detectGPUVendor(),
      vram: this.detectVRAM(),
      storageTotal: this.detectStorageTotal(),
      storageAvailable: this.detectStorageAvailable(),
      network: this.detectNetwork(),
      acceleration: this.detectAcceleration(),
      runtimeCapabilities: this.detectRuntimeCapabilities(),
      detectedCapabilities: this.detectCapabilities(),
      confidence: this.calculateConfidence(),
      timestamp: new Date(),
    };

    return profile;
  }

  private detectOS(): string {
    if (!this.systemInfo) return 'unknown';
    const platformMap: Record<string, string> = {
      'win32': 'Windows',
      'darwin': 'macOS',
      'linux': 'Linux',
      'android': 'Android',
      'ios': 'iOS',
    };
    return platformMap[this.systemInfo.os.platform] || this.systemInfo.os.platform;
  }

  private detectArchitecture(): string {
    if (!this.systemInfo) return 'unknown';
    return this.systemInfo.os.platform === 'win32' ? 'x64' : this.systemInfo.cpu.architecture;
  }

  private detectCPU(): string {
    if (!this.systemInfo) return 'unknown';
    return this.systemInfo.cpu.model;
  }

  private detectCPUCores(): number {
    if (!this.systemInfo) return 1;
    return this.systemInfo.cpu.cores;
  }

  private detectCPUThreads(): number {
    if (!this.systemInfo) return 2;
    return this.systemInfo.cpu.threads;
  }

  private detectRAMTotal(): number {
    if (!this.systemInfo) return 4096;
    return this.systemInfo.memory.total;
  }

  private detectRAMAvailable(): number {
    if (!this.systemInfo) return 2048;
    return this.systemInfo.memory.available;
  }

  private detectGPU(): string | undefined {
    if (!this.systemInfo || this.systemInfo.gpu.length === 0) return undefined;
    return this.systemInfo.gpu[0].name;
  }

  private detectGPUVendor(): string | undefined {
    if (!this.systemInfo || this.systemInfo.gpu.length === 0) return undefined;
    return this.systemInfo.gpu[0].vendor;
  }

  private detectVRAM(): number | undefined {
    if (!this.systemInfo || this.systemInfo.gpu.length === 0) return undefined;
    return this.systemInfo.gpu[0].vram || undefined;
  }

  private detectStorageTotal(): number {
    if (!this.systemInfo || this.systemInfo.storage.length === 0) return 50000;
    return this.systemInfo.storage[0].total;
  }

  private detectStorageAvailable(): number {
    if (!this.systemInfo || this.systemInfo.storage.length === 0) return 25000;
    return this.systemInfo.storage[0].available;
  }

  private detectNetwork(): NetworkProfile {
    if (!this.systemInfo) {
      return {
        type: 'unknown',
        offlineCapable: true,
      };
    }

    const primary = this.systemInfo.network.interfaces.find(i => i.type !== 'unknown');
    if (!primary) {
      return {
        type: 'unknown',
        offlineCapable: true,
      };
    }

    return {
      type: primary.type,
      estimatedBandwidth: primary.speed || undefined,
      latency: 0, // Would need additional detection
      offlineCapable: true,
    };
  }

  private detectAcceleration(): AccelerationSupport {
    const support: AccelerationSupport = {
      webGL: false,
      webGPU: false,
      wasm: false,
      simd: false,
      localModels: false,
      containerSupport: false,
    };

    if (typeof navigator !== 'undefined') {
      // WebGL detection
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        support.webGL = !!gl;
      } catch {
        // WebGL not available
      }

      // WebGPU detection
      if ('gpu' in navigator) {
        support.webGPU = true;
      }

      // WebAssembly detection
      support.wasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';

      // SIMD detection (requires WebAssembly)
      if (support.wasm) {
        try {
          const simdModule = new WebAssembly.Module(
            new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])
          );
          support.simd = true;
        } catch {
          support.simd = false;
        }
      }
    }

    // Container detection from system info
    if (this.systemInfo) {
      support.containerSupport = this.systemInfo.runtime.docker;
      support.localModels = this.systemInfo.runtime.node && this.systemInfo.tools.some(t => 
        t.category === 'ai' && t.installed
      );
    }

    return support;
  }

  private detectRuntimeCapabilities(): RuntimeCapabilities {
    if (!this.systemInfo) {
      return {
        node: false,
        python: false,
        browser: false,
        docker: false,
        localLLM: false,
      };
    }

    const runtime = this.systemInfo.runtime;
    return {
      node: runtime.node,
      python: runtime.python,
      browser: typeof window !== 'undefined',
      docker: runtime.docker,
      localLLM: this.systemInfo.tools.some(t => 
        t.category === 'ai' && t.installed
      ),
    };
  }

  private detectCapabilities(): string[] {
    const capabilities: string[] = [];

    // Browser capabilities
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) capabilities.push('service-worker');
      if ('geolocation' in navigator) capabilities.push('geolocation');
      if ('notifications' in window) capabilities.push('notifications');
      if ('indexedDB' in window) capabilities.push('indexeddb');
      if ('webWorker' in window) capabilities.push('web-worker');
      if ('sharedArrayBuffer' in window) capabilities.push('shared-array-buffer');
    }

    // Node.js capabilities
    if (typeof process !== 'undefined') {
      capabilities.push('node-runtime');
      try {
        const fs = require('fs');
        capabilities.push('filesystem');
      } catch {
        // No filesystem access
      }
    }

    // Add capabilities based on installed tools
    if (this.systemInfo) {
      if (this.systemInfo.runtime.docker) capabilities.push('docker');
      if (this.systemInfo.runtime.git) capabilities.push('git');
      if (this.systemInfo.tools.some(t => t.category === 'ai' && t.installed)) {
        capabilities.push('local-ai');
      }
    }

    return capabilities;
  }

  private calculateConfidence(): number {
    let confidence = 0.5; // Base confidence

    if (this.systemInfo) {
      confidence += 0.3; // We have real system data
      if (this.systemInfo.gpu.length > 0) confidence += 0.1;
      if (this.systemInfo.runtime.node) confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}
