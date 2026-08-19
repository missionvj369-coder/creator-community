// System Diagnostics Service - Real-time hardware and software detection
// Uses Node.js OS APIs and system commands for accurate system profiling

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SystemInfo {
  cpu: CPUInfo;
  memory: MemoryInfo;
  gpu: GPUInfo[];
  storage: StorageInfo[];
  network: NetworkInfo;
  os: OSInfo;
  runtime: RuntimeInfo;
  tools: ToolInfo[];
}

export interface CPUInfo {
  model: string;
  cores: number;
  threads: number;
  speed: number; // MHz
  architecture: string;
}

export interface MemoryInfo {
  total: number; // MB
  available: number; // MB
  used: number; // MB
}

export interface GPUInfo {
  name: string;
  vendor: string;
  vram: number; // MB
  driverVersion: string;
}

export interface StorageInfo {
  device: string;
  mountpoint: string;
  filesystem: string;
  total: number; // MB
  available: number; // MB
  used: number; // MB
}

export interface NetworkInfo {
  interfaces: NetworkInterface[];
  primary: string;
}

export interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'cellular' | 'unknown';
  speed: number; // Mbps
  ip: string;
}

export interface OSInfo {
  platform: string;
  release: string;
  version: string;
  hostname: string;
}

export interface RuntimeInfo {
  node: boolean;
  nodeVersion?: string;
  python: boolean;
  pythonVersion?: string;
  docker: boolean;
  dockerVersion?: string;
  git: boolean;
  gitVersion?: string;
  browsers: string[];
}

export interface ToolInfo {
  name: string;
  command: string;
  installed: boolean;
  version?: string;
  path?: string;
  category: 'ai' | 'development' | 'database' | 'container' | 'other';
}

export class SystemDiagnostics {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTimeout = 5000; // 5 seconds

  async getSystemInfo(): Promise<SystemInfo> {
    return {
      cpu: await this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      gpu: await this.getGPUInfo(),
      storage: await this.getStorageInfo(),
      network: await this.getNetworkInfo(),
      os: await this.getOSInfo(),
      runtime: await this.getRuntimeInfo(),
      tools: await this.getInstalledTools(),
    };
  }

  async getCPUInfo(): Promise<CPUInfo> {
    const cached = this.getCache('cpu');
    if (cached) return cached as CPUInfo;

    let cpuInfo: CPUInfo = {
      model: 'unknown',
      cores: os.cpus().length,
      threads: os.cpus().length,
      speed: 0,
      architecture: os.arch(),
    };

    try {
      if (os.platform() === 'win32') {
        // Windows CPU detection
        try {
          const output = execSync('wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed /format:csv', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
          });
          const lines = output.trim().split('\n').filter((l) => l.trim());
          if (lines.length > 1) {
            const data = lines[1].split(',');
            cpuInfo.model = data[1]?.trim() || 'unknown';
            cpuInfo.cores = parseInt(data[2]?.trim() || String(cpuInfo.cores));
            cpuInfo.threads = parseInt(data[3]?.trim() || String(cpuInfo.threads));
            cpuInfo.speed = parseInt(data[4]?.trim() || '0');
          }
        } catch {
          // Fallback to os.cpus()
          cpuInfo.model = os.cpus()[0]?.model || 'unknown';
          cpuInfo.speed = Math.round((os.cpus()[0]?.speed || 0));
        }
      } else if (os.platform() === 'darwin') {
        // macOS CPU detection
        try {
          const output = execSync('sysctl -n machdep.cpu.brand_string', { encoding: 'utf8' });
          cpuInfo.model = output.trim();
        } catch {
          cpuInfo.model = os.cpus()[0]?.model || 'unknown';
        }
        try {
          const cores = execSync('sysctl -n hw.physicalcpu', { encoding: 'utf8' });
          cpuInfo.cores = parseInt(cores.trim());
        } catch {
          // Keep default
        }
        try {
          const threads = execSync('sysctl -n hw.logicalcpu', { encoding: 'utf8' });
          cpuInfo.threads = parseInt(threads.trim());
        } catch {
          // Keep default
        }
      } else {
        // Linux CPU detection
        try {
          const model = execSync('cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2', {
            encoding: 'utf8',
          });
          cpuInfo.model = model.trim();
        } catch {
          cpuInfo.model = os.cpus()[0]?.model || 'unknown';
        }
        try {
          const cores = execSync('nproc', { encoding: 'utf8' });
          cpuInfo.cores = parseInt(cores.trim());
        } catch {
          // Keep default
        }
      }
    } catch (error) {
      console.warn('CPU detection error:', error);
    }

    this.setCache('cpu', cpuInfo);
    return cpuInfo;
  }

  async getMemoryInfo(): Promise<MemoryInfo> {
    const cached = this.getCache('memory');
    if (cached) return cached as MemoryInfo;

    const total = Math.round((os.totalmem() / 1024 / 1024));
    const available = Math.round((os.freemem() / 1024 / 1024));
    const used = total - available;

    const memoryInfo: MemoryInfo = { total, available, used };
    this.setCache('memory', memoryInfo);
    return memoryInfo;
  }

  async getGPUInfo(): Promise<GPUInfo[]> {
    const cached = this.getCache('gpu');
    if (cached) return cached as GPUInfo[];

    const gpus: GPUInfo[] = [];

    try {
      if (os.platform() === 'win32') {
        // Windows GPU detection using wmic
        try {
          const output = execSync('wmic path win32_VideoController get Name,AdapterRAM,DriverVersion /format:csv', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
          });
          const lines = output.trim().split('\n').filter((l) => l.trim());
          for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(',');
            const name = data[1]?.trim();
            if (name) {
              gpus.push({
                name,
                vendor: this.extractVendor(name),
                vram: Math.round((parseInt(data[2]?.trim() || '0') / 1024 / 1024)),
                driverVersion: data[3]?.trim() || 'unknown',
              });
            }
          }
        } catch {
          // wmic failed
        }
      } else if (os.platform() === 'darwin') {
        // macOS GPU detection
        try {
          const output = execSync('system_profiler SPDisplaysDataType -json', { encoding: 'utf8' });
          const data = JSON.parse(output);
          const gpus_data = data.SPDisplaysDataType || [];
          for (const gpu of gpus_data) {
            gpus.push({
              name: gpu._name || 'unknown',
              vendor: gpu.sppci_vendor || 'unknown',
              vram: this.parseVRAM(gpu.spdisplays_vram || '0 MB'),
              driverVersion: gpu.sppci_version || 'unknown',
            });
          }
        } catch {
          // system_profiler failed
        }
      } else {
        // Linux GPU detection
        try {
          const output = execSync('lspci | grep -i vga', { encoding: 'utf8' });
          const lines = output.trim().split('\n');
          for (const line of lines) {
            const match = line.match(/\[(.+?)\]/);
            gpus.push({
              name: line.split(':').pop()?.trim() || 'unknown',
              vendor: this.extractVendor(line),
              vram: 0, // Would need additional command to get VRAM
              driverVersion: 'unknown',
            });
          }
        } catch {
          // lspci failed
        }
      }
    } catch (error) {
      console.warn('GPU detection error:', error);
    }

    this.setCache('gpu', gpus);
    return gpus;
  }

  async getStorageInfo(): Promise<StorageInfo[]> {
    const cached = this.getCache('storage');
    if (cached) return cached as StorageInfo[];

    const storage: StorageInfo[] = [];

    try {
      if (os.platform() === 'win32') {
        const output = execSync('wmic logicaldisk get DeviceID,Size,FreeSpace,FileSystem /format:csv', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        const lines = output.trim().split('\n').filter((l) => l.trim());
        for (let i = 1; i < lines.length; i++) {
          const data = lines[i].split(',');
          const device = data[1]?.trim();
          const size = parseInt(data[2]?.trim() || '0');
          const free = parseInt(data[3]?.trim() || '0');
          if (device && size > 0) {
            storage.push({
              device,
              mountpoint: device,
              filesystem: data[4]?.trim() || 'unknown',
              total: Math.round(size / 1024 / 1024),
              available: Math.round(free / 1024 / 1024),
              used: Math.round((size - free) / 1024 / 1024),
            });
          }
        }
      } else {
        // Unix-like systems
        const output = execSync('df -k', { encoding: 'utf8' });
        const lines = output.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(/\s+/);
          if (parts.length >= 6) {
            const device = parts[0];
            const total = parseInt(parts[1]);
            const used = parseInt(parts[2]);
            const available = parseInt(parts[3]);
            const mountpoint = parts[5];
            if (total > 0 && !device.includes('tmpfs') && !device.includes('devtmpfs')) {
              storage.push({
                device,
                mountpoint,
                filesystem: 'unknown',
                total: Math.round(total / 1024),
                available: Math.round(available / 1024),
                used: Math.round(used / 1024),
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('Storage detection error:', error);
    }

    this.setCache('storage', storage);
    return storage;
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    const cached = this.getCache('network');
    if (cached) return cached as NetworkInfo;

    const interfaces: NetworkInterface[] = [];
    let primary = 'unknown';

    try {
      const networkInterfaces = os.networkInterfaces();
      for (const [name, addrs] of Object.entries(networkInterfaces)) {
        if (!addrs) continue;
        for (const addr of addrs) {
          if (!addr.internal && addr.family === 'IPv4') {
            const type = this.detectNetworkType(name);
            interfaces.push({
              name,
              type,
              speed: 0, // Would need additional detection
              ip: addr.address,
            });
            if (type !== 'unknown') primary = name;
          }
        }
      }
    } catch (error) {
      console.warn('Network detection error:', error);
    }

    const networkInfo: NetworkInfo = { interfaces, primary };
    this.setCache('network', networkInfo);
    return networkInfo;
  }

  async getOSInfo(): Promise<OSInfo> {
    return {
      platform: os.platform(),
      release: os.release(),
      version: os.version(),
      hostname: os.hostname(),
    };
  }

  async getRuntimeInfo(): Promise<RuntimeInfo> {
    const runtime: RuntimeInfo = {
      node: false,
      python: false,
      docker: false,
      git: false,
      browsers: [],
    };

    // Node.js
    if (process.versions && process.versions.node) {
      runtime.node = true;
      runtime.nodeVersion = process.versions.node;
    }

    // Python
    try {
      const pythonVersion = await this.detectCommandVersion(['python', 'python3'], '--version');
      if (pythonVersion) {
        runtime.python = true;
        runtime.pythonVersion = pythonVersion;
      }
    } catch {
      // Python not available
    }

    // Docker
    try {
      const dockerVersion = await this.detectCommandVersion(['docker'], '--version');
      if (dockerVersion) {
        runtime.docker = true;
        runtime.dockerVersion = dockerVersion;
      }
    } catch {
      // Docker not available
    }

    // Git
    try {
      const gitVersion = await this.detectCommandVersion(['git'], '--version');
      if (gitVersion) {
        runtime.git = true;
        runtime.gitVersion = gitVersion;
      }
    } catch {
      // Git not available
    }

    // Browsers
    runtime.browsers = await this.detectBrowsers();

    return runtime;
  }

  async getInstalledTools(): Promise<ToolInfo[]> {
    const tools: ToolInfo[] = [
      // AI Tools
      { name: 'Ollama', command: 'ollama', installed: false, category: 'ai' },
      { name: 'LM Studio', command: 'lm-studio', installed: false, category: 'ai' },
      { name: 'llama.cpp', command: 'llama.cpp', installed: false, category: 'ai' },
      { name: 'Stable Diffusion', command: 'stable-diffusion', installed: false, category: 'ai' },
      // Development Tools
      { name: 'Node.js', command: 'node', installed: false, category: 'development' },
      { name: 'npm', command: 'npm', installed: false, category: 'development' },
      { name: 'yarn', command: 'yarn', installed: false, category: 'development' },
      { name: 'pnpm', command: 'pnpm', installed: false, category: 'development' },
      { name: 'Python', command: 'python', installed: false, category: 'development' },
      { name: 'Python3', command: 'python3', installed: false, category: 'development' },
      { name: 'Git', command: 'git', installed: false, category: 'development' },
      { name: 'Docker', command: 'docker', installed: false, category: 'container' },
      { name: 'Docker Compose', command: 'docker-compose', installed: false, category: 'container' },
      // Databases
      { name: 'PostgreSQL', command: 'psql', installed: false, category: 'database' },
      { name: 'MySQL', command: 'mysql', installed: false, category: 'database' },
      { name: 'MongoDB', command: 'mongosh', installed: false, category: 'database' },
      { name: 'Redis', command: 'redis-cli', installed: false, category: 'database' },
      // Other
      { name: 'FFmpeg', command: 'ffmpeg', installed: false, category: 'other' },
      { name: 'ImageMagick', command: 'convert', installed: false, category: 'other' },
    ];

    for (const tool of tools) {
      try {
        const version = await this.detectCommandVersion([tool.command], '--version');
        if (version) {
          tool.installed = true;
          tool.version = version;
          // Try to find the full path
          try {
            const whichCmd = os.platform() === 'win32' ? 'where' : 'which';
            const pathOutput = execSync(`${whichCmd} ${tool.command}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            tool.path = pathOutput.trim().split('\n')[0];
          } catch {
            // Path detection failed
          }
        }
      } catch {
        // Tool not available
      }
    }

    return tools;
  }

  // Helper methods

  private async detectCommandVersion(commands: string[], versionFlag: string): Promise<string | null> {
    for (const cmd of commands) {
      try {
        const output = execSync(`${cmd} ${versionFlag}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 2000,
        });
        // Extract version number
        const match = output.match(/(\d+\.\d+\.\d+)/);
        if (match) return match[1];
        return output.trim().substring(0, 50);
      } catch {
        continue;
      }
    }
    return null;
  }

  private async detectBrowsers(): Promise<string[]> {
    const browsers: string[] = [];

    if (os.platform() === 'win32') {
      const browserPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
        'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ];
      for (const browserPath of browserPaths) {
        if (fs.existsSync(browserPath)) {
          const name = path.basename(browserPath, path.extname(browserPath));
          browsers.push(name);
        }
      }
    } else if (os.platform() === 'darwin') {
      const browserPaths = [
        '/Applications/Google Chrome.app',
        '/Applications/Firefox.app',
        '/Applications/Safari.app',
        '/Applications/Microsoft Edge.app',
      ];
      for (const browserPath of browserPaths) {
        if (fs.existsSync(browserPath)) {
          const name = path.basename(browserPath, '.app');
          browsers.push(name);
        }
      }
    } else {
      // Linux
      const browserCommands = ['google-chrome', 'firefox', 'chromium-browser', 'chromium'];
      for (const cmd of browserCommands) {
        try {
          execSync(`which ${cmd}`, { stdio: 'ignore' });
          browsers.push(cmd);
        } catch {
          // Not found
        }
      }
    }

    return browsers;
  }

  private detectNetworkType(interfaceName: string): NetworkInterface['type'] {
    const name = interfaceName.toLowerCase();
    if (name.includes('wifi') || name.includes('wireless') || name.includes('wlan')) return 'wifi';
    if (name.includes('ethernet') || name.includes('eth') || name.includes('enp')) return 'ethernet';
    if (name.includes('cellular') || name.includes('wwan') || name.includes('ppp')) return 'cellular';
    return 'unknown';
  }

  private extractVendor(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nvidia')) return 'NVIDIA';
    if (lowerName.includes('amd') || lowerName.includes('radeon')) return 'AMD';
    if (lowerName.includes('intel')) return 'Intel';
    if (lowerName.includes('apple')) return 'Apple';
    if (lowerName.includes('qualcomm')) return 'Qualcomm';
    return 'unknown';
  }

  private parseVRAM(vramStr: string): number {
    const match = vramStr.match(/(\d+)\s*(MB|GB|TB)/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'GB') return value * 1024;
    if (unit === 'TB') return value * 1024 * 1024;
    return value;
  }

  // Cache management

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const systemDiagnostics = new SystemDiagnostics();