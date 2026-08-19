// Test script for System Diagnostics Service
// Run with: node test-system-diagnostics.js

import { execSync } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

async function testSystemDiagnostics() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         SYSTEM DIAGNOSTICS TEST                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('🔍 Gathering system information...\n');

    // CPU Info
    console.log('💻 CPU INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    const cpus = os.cpus();
    console.log(`   Model: ${cpus[0]?.model || 'unknown'}`);
    console.log(`   Cores: ${cpus.length}`);
    console.log(`   Threads: ${cpus.length}`);
    console.log(`   Speed: ${cpus[0]?.speed || 0} MHz`);
    console.log(`   Architecture: ${os.arch()}\n`);

    // Memory Info
    console.log('💾 MEMORY INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    const totalMem = Math.round(os.totalmem() / 1024 / 1024);
    const freeMem = Math.round(os.freemem() / 1024 / 1024);
    const usedMem = totalMem - freeMem;
    console.log(`   Total: ${totalMem} MB (${(totalMem / 1024).toFixed(2)} GB)`);
    console.log(`   Available: ${freeMem} MB (${(freeMem / 1024).toFixed(2)} GB)`);
    console.log(`   Used: ${usedMem} MB (${(usedMem / 1024).toFixed(2)} GB)`);
    console.log(`   Usage: ${((usedMem / totalMem) * 100).toFixed(1)}%\n`);

    // GPU Info
    console.log('🖥️  GPU INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    let gpuCount = 0;
    if (os.platform() === 'win32') {
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
            gpuCount++;
            const vram = Math.round((parseInt(data[2]?.trim() || '0') / 1024 / 1024));
            console.log(`   GPU ${gpuCount}: ${name}`);
            console.log(`   VRAM: ${vram} MB (${(vram / 1024).toFixed(2)} GB)`);
            console.log(`   Driver: ${data[3]?.trim() || 'unknown'}\n`);
          }
        }
      } catch {
        console.log('   No GPUs detected (wmic failed)\n');
      }
    } else {
      console.log('   GPU detection only available on Windows in this test\n');
    }
    if (gpuCount === 0) console.log('   No GPUs detected\n');

    // Storage Info
    console.log('💿 STORAGE INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    if (os.platform() === 'win32') {
      try {
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
            const totalMB = Math.round(size / 1024 / 1024);
            const freeMB = Math.round(free / 1024 / 1024);
            const usedMB = totalMB - freeMB;
            console.log(`   Drive ${device}:`);
            console.log(`   Total: ${totalMB} MB (${(totalMB / 1024).toFixed(2)} GB)`);
            console.log(`   Available: ${freeMB} MB (${(freeMB / 1024).toFixed(2)} GB)`);
            console.log(`   Used: ${usedMB} MB (${(usedMB / 1024).toFixed(2)} GB)`);
            console.log(`   Usage: ${((usedMB / totalMB) * 100).toFixed(1)}%\n`);
          }
        }
      } catch {
        console.log('   Storage detection failed\n');
      }
    }

    // Network Info
    console.log('🌐 NETWORK INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    const networkInterfaces = os.networkInterfaces();
    let primaryInterface = 'unknown';
    for (const [name, addrs] of Object.entries(networkInterfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (!addr.internal && addr.family === 'IPv4') {
          console.log(`   - ${name}: ${addr.address}`);
          if (primaryInterface === 'unknown') primaryInterface = name;
        }
      }
    }
    console.log(`   Primary: ${primaryInterface}\n`);

    // OS Info
    console.log('🖥️  OS INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   Platform: ${os.platform()}`);
    console.log(`   Release: ${os.release()}`);
    console.log(`   Version: ${os.version()}`);
    console.log(`   Hostname: ${os.hostname()}\n`);

    // Runtime Info
    console.log('⚙️  RUNTIME INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   Node.js: ✅ Installed (v${process.versions.node})`);
    
    // Check Python
    let pythonVersion = null;
    try {
      const output = execSync('python --version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      pythonVersion = output.trim();
    } catch {
      try {
        const output = execSync('python3 --version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        pythonVersion = output.trim();
      } catch {
        pythonVersion = null;
      }
    }
    console.log(`   Python: ${pythonVersion ? '✅ Installed' : '❌ Not found'}${pythonVersion ? ` (${pythonVersion})` : ''}`);

    // Check Docker
    let dockerVersion = null;
    try {
      const output = execSync('docker --version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      dockerVersion = output.trim();
    } catch {
      dockerVersion = null;
    }
    console.log(`   Docker: ${dockerVersion ? '✅ Installed' : '❌ Not found'}${dockerVersion ? ` (${dockerVersion})` : ''}`);

    // Check Git
    let gitVersion = null;
    try {
      const output = execSync('git --version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      gitVersion = output.trim();
    } catch {
      gitVersion = null;
    }
    console.log(`   Git: ${gitVersion ? '✅ Installed' : '❌ Not found'}${gitVersion ? ` (${gitVersion})` : ''}\n`);

    // Check for common tools
    console.log('🔧 COMMON TOOLS CHECK:');
    console.log('───────────────────────────────────────────────────────────────');
    const tools = [
      { name: 'Ollama', cmd: 'ollama' },
      { name: 'npm', cmd: 'npm' },
      { name: 'yarn', cmd: 'yarn' },
      { name: 'pnpm', cmd: 'pnpm' },
      { name: 'PostgreSQL', cmd: 'psql' },
      { name: 'MySQL', cmd: 'mysql' },
      { name: 'MongoDB', cmd: 'mongosh' },
      { name: 'Redis', cmd: 'redis-cli' },
      { name: 'FFmpeg', cmd: 'ffmpeg' },
    ];

    for (const tool of tools) {
      try {
        execSync(`${tool.cmd} --version`, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 2000 });
        console.log(`   ✅ ${tool.name}`);
      } catch {
        console.log(`   ❌ ${tool.name}`);
      }
    }

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ SYSTEM DIAGNOSTICS COMPLETE                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Summary
    console.log(`📊 Summary:`);
    console.log(`   CPU: ${cpus[0]?.model || 'unknown'}`);
    console.log(`   Cores: ${cpus.length}`);
    console.log(`   RAM: ${totalMem} MB (${(totalMem / 1024).toFixed(2)} GB)`);
    console.log(`   Available RAM: ${freeMem} MB (${(freeMem / 1024).toFixed(2)} GB)`);
    console.log(`   GPUs: ${gpuCount}`);
    console.log(`   Network interfaces: ${Object.keys(networkInterfaces).length}\n`);

  } catch (error) {
    console.error('❌ Error running system diagnostics:', error);
    process.exit(1);
  }
}

// Run the test
testSystemDiagnostics();