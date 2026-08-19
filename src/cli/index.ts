// CLI Interface for Living Creation Intelligence
// Interactive command-line interface for processing human intentions

import * as readline from 'readline';
import { BrainOrchestrator, createOrchestrator, OrchestratorConfig } from '../brain/orchestrator';
import { CapabilityRegistry, capabilityRegistry } from '../capabilities/registry';
import { CapabilityMatcher, createMatcher } from '../capabilities/matcher';
import { DeviceProfiler } from '../device/profiler';
import { HumanProfiler } from '../human/profiler';
import { DiscoveryManager } from '../world/discovery';
import { DiscoveryCache } from '../world/cache';
import type { Intention, Capability, DeviceProfile, HumanCapabilityProfile } from '../types';

export interface CLIConfig {
  enableColors?: boolean;
  enableInteractive?: boolean;
  autoProfile?: boolean;
  loadCapabilities?: boolean;
}

export class LivingCreationCLI {
  private orchestrator: BrainOrchestrator | null = null;
  private registry: CapabilityRegistry;
  private matcher: CapabilityMatcher;
  private deviceProfiler: DeviceProfiler;
  private humanProfiler: HumanProfiler;
  private discovery: DiscoveryManager;
  private config: CLIConfig;
  private deviceProfile: DeviceProfile | null = null;
  private humanProfile: HumanCapabilityProfile | null = null;

  constructor(config: CLIConfig = {}) {
    this.config = {
      enableColors: true,
      enableInteractive: true,
      autoProfile: true,
      loadCapabilities: true,
      ...config,
    };

    this.registry = capabilityRegistry;
    this.matcher = createMatcher(this.registry);
    this.deviceProfiler = new DeviceProfiler();
    this.humanProfiler = new HumanProfiler();
    this.discovery = new DiscoveryManager(new DiscoveryCache());
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Living Creation Intelligence...\n');

    // Auto-profile device and human if enabled
    if (this.config.autoProfile) {
      await this.profileUser();
    }

    // Load capabilities if enabled
    if (this.config.loadCapabilities) {
      await this.loadCapabilities();
    }

    // Initialize orchestrator
    this.initializeOrchestrator();

    console.log('✅ Initialization complete!\n');
  }

  async run(): Promise<void> {
    if (this.config.enableInteractive) {
      await this.interactiveMode();
    } else {
      await this.singleMode();
    }
  }

  private async profileUser(): Promise<void> {
    console.log('📊 Profiling your device and capabilities...\n');

    // Profile device
    this.deviceProfile = await this.deviceProfiler.profile();
    console.log('💻 Device Profile:');
    console.log(`   OS: ${this.deviceProfile.os} ${this.deviceProfile.architecture}`);
    console.log(`   CPU: ${this.deviceProfile.cpu} (${this.deviceProfile.cpuCores} cores)`);
    console.log(`   RAM: ${this.deviceProfile.ramTotal} MB total, ${this.deviceProfile.ramAvailable} MB available`);
    if (this.deviceProfile.gpu) {
      console.log(`   GPU: ${this.deviceProfile.gpu}`);
    }
    console.log(`   Network: ${this.deviceProfile.network.type} (${this.deviceProfile.network.estimatedBandwidth || 'unknown'} Mbps)\n`);

    // Profile human
    this.humanProfile = this.humanProfiler.getProfile();
    console.log('👤 Human Profile:');
    console.log(`   Level: ${this.humanProfile.level}`);
    console.log(`   Technical Experience: ${this.humanProfile.technicalExperience}/10`);
    console.log(`   Programming Experience: ${this.humanProfile.programmingExperience}/10`);
    console.log(`   AI Familiarity: ${this.humanProfile.aiFamiliarity}/10`);
    console.log(`   Desired Guidance: ${this.humanProfile.desiredGuidance}`);
    console.log(`   Control Preference: ${this.humanProfile.desiredControl}\n`);
  }
  
  private initializeOrchestrator(): void {
    if (!this.deviceProfile || !this.humanProfile) {
      throw new Error('Device and human profiles must be set before initializing orchestrator');
    }

    const config: OrchestratorConfig = {
      capabilities: this.registry.getAll(),
      deviceProfile: this.deviceProfile,
      humanProfile: this.humanProfile,
      enableGuardian: true,
      enableEvolution: true,
    };

    this.orchestrator = createOrchestrator(config);
  }

  private async loadCapabilities(): Promise<void> {
    console.log('🔍 Loading capabilities...\n');

    // Load mock capabilities for demo
    const mockCapabilities = this.getMockCapabilities();
    mockCapabilities.forEach(cap => this.registry.register(cap));

    console.log(`   Loaded ${this.registry.count} capabilities\n`);
  }

  private async interactiveMode(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         LIVING CREATION INTELLIGENCE - Interactive Mode       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('Commands:');
    console.log('  intention <text>  - Process a human intention');
    console.log('  profile           - Re-profile device and human');
    console.log('  capabilities      - List available capabilities');
    console.log('  stats             - Show registry statistics');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit the program\n');

    const prompt = (query: string) => {
      return new Promise<string>((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer);
        });
      });
    };

    while (true) {
      const input = await prompt('🧠 LCI> ');
      const trimmed = input.trim();

      if (trimmed === 'exit' || trimmed === 'quit') {
        console.log('\n👋 Goodbye!\n');
        break;
      }

      if (trimmed === 'help') {
        this.showHelp();
        continue;
      }

      if (trimmed === 'profile') {
        await this.profileUser();
        this.initializeOrchestrator();
        continue;
      }

      if (trimmed === 'capabilities') {
        this.listCapabilities();
        continue;
      }

      if (trimmed === 'stats') {
        this.showStats();
        continue;
      }

      if (trimmed.startsWith('intention ')) {
        const intentionText = trimmed.slice(11);
        await this.processIntention(intentionText);
        continue;
      }

      console.log('❌ Unknown command. Type "help" for available commands.\n');
    }

    rl.close();
  }

  private async singleMode(): Promise<void> {
    console.log('🧠 Living Creation Intelligence - Single Intention Mode\n');
    console.log('Enter your intention (what you want to create):\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const intentionText = await new Promise<string>((resolve) => {
      rl.question('> ', (answer) => {
        resolve(answer);
        rl.close();
      });
    });

    await this.processIntention(intentionText);
  }

  private async processIntention(text: string): Promise<void> {
    if (!this.orchestrator) {
      console.log('❌ Orchestrator not initialized. Please run profile first.\n');
      return;
    }

    console.log(`\n💭 Processing intention: "${text}"\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();

    try {
      const intention: Intention = { raw: text };
      const result = await this.orchestrator.processIntention(intention);
      const processingTime = Date.now() - startTime;

      this.displayResults(result, processingTime);
    } catch (error) {
      console.error('❌ Error processing intention:', error);
      console.log('\n');
    }
  }

  private displayResults(result: any, processingTime: number): void {
    console.log('📊 CREATION ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Observed Intention
    console.log('🎯 OBSERVED INTENTION:');
    console.log(`   Explicit Request: ${result.observedIntention.explicitRequest}`);
    console.log(`   Confidence: ${(result.observedIntention.confidence * 100).toFixed(0)}%`);
    console.log(`   Facts: ${result.observedIntention.facts.length}`);
    console.log(`   Assumptions: ${result.observedIntention.assumptions.length}`);
    console.log(`   Unknowns: ${result.observedIntention.unknowns.length}\n`);

    // Understanding
    console.log('🧠 UNDERSTANDING:');
    console.log(`   Root Need: ${result.understanding.rootNeed}`);
    console.log(`   Confidence: ${(result.understanding.confidence * 100).toFixed(0)}%`);
    console.log(`   Sub-problems: ${result.understanding.subProblems.length}`);
    console.log(`   Risks: ${result.understanding.risks.length}\n`);

    // Possibilities
    console.log('💡 POSSIBILITIES GENERATED:');
    console.log(`   Total: ${result.possibilities.possibilities.length}`);
    console.log(`   Diversity Score: ${(result.possibilities.diversityScore * 100).toFixed(0)}%`);
    console.log(`   Coverage Score: ${(result.possibilities.coverageScore * 100).toFixed(0)}%`);
    
    result.possibilities.possibilities.forEach((p: any, i: number) => {
      console.log(`\n   [${i + 1}] ${p.name}`);
      console.log(`       Category: ${p.category}`);
      console.log(`       Complexity: ${p.estimatedComplexity}`);
      console.log(`       Cost: ${p.estimatedCost}`);
      console.log(`       Feasibility: ${(p.scores.feasibility * 100).toFixed(0)}%`);
    });

    // Recommended
    if (result.recommendedPossibility) {
      console.log(`\n✅ RECOMMENDED: ${result.recommendedPossibility.name}`);
      console.log(`   ${result.recommendedPossibility.reasoning}`);
    }

    // Guardian
    console.log('\n🛡️ GUARDIAN CHECK:');
    console.log(`   Status: ${result.guardianAnalysis.status}`);
    console.log(`   Trust Level: ${(result.guardianAnalysis.trustLevel * 100).toFixed(0)}%`);
    if (result.guardianAnalysis.reasons.length > 0) {
      console.log(`   Concerns: ${result.guardianAnalysis.reasons.join(', ')}`);
    }

    // Overall
    console.log('\n📈 OVERALL ASSESSMENT:');
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`   Can Proceed: ${result.canProceed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Processing Time: ${processingTime}ms`);

    if (result.blockingFactors.length > 0) {
      console.log('\n🚫 BLOCKING FACTORS:');
      result.blockingFactors.forEach((factor: string) => {
        console.log(`   • ${factor}`);
      });
    }

    if (result.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      result.recommendations.forEach((rec: string) => {
        console.log(`   • ${rec}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
  }

  private showHelp(): void {
    console.log('\n📖 AVAILABLE COMMANDS:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  intention <text>  - Process a human intention');
    console.log('  profile           - Re-profile device and human');
    console.log('  capabilities      - List available capabilities');
    console.log('  stats             - Show registry statistics');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit the program');
    console.log('───────────────────────────────────────────────────────────────\n');
  }

  private listCapabilities(): void {
    const capabilities = this.registry.getAll();
    console.log(`\n📦 AVAILABLE CAPABILITIES (${capabilities.length}):\n`);
    
    capabilities.forEach((cap, i) => {
      console.log(`  [${i + 1}] ${cap.name}`);
      console.log(`       Type: ${cap.type}`);
      console.log(`       Capabilities: ${cap.capabilities.slice(0, 3).join(', ')}`);
      console.log(`       Cost: ${cap.cost.type}`);
      console.log(`       Platforms: ${cap.compatibility.platforms.join(', ')}\n`);
    });
  }

  private showStats(): void {
    const stats = this.registry.getStats();
    console.log('\n📊 REGISTRY STATISTICS:\n');
    console.log(`  Total Capabilities: ${stats.totalCapabilities}`);
    console.log(`  By Type:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });
    console.log(`  By License:`);
    Object.entries(stats.byLicense).forEach(([license, count]) => {
      console.log(`    ${license}: ${count}`);
    });
    console.log(`  Last Updated: ${stats.lastUpdated.toLocaleString()}\n`);
  }

  private getMockCapabilities(): Capability[] {
    return [
      {
        id: 'cap-1',
        name: 'Web Form Builder',
        description: 'Create web forms with validation',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['form-creation', 'validation', 'data-collection'],
        limitations: ['requires modern browser'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['web', 'desktop'],
          requirements: ['modern browser'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
      {
        id: 'cap-2',
        name: 'Local Storage',
        description: 'Store data locally in browser',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['local-storage', 'data-persistence', 'offline-support'],
        limitations: ['limited storage capacity'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['web', 'desktop'],
          requirements: ['modern browser'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
      {
        id: 'cap-3',
        name: 'Voice Input',
        description: 'Convert speech to text',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['speech-recognition', 'voice-commands', 'transcription'],
        limitations: ['requires microphone', 'accuracy varies'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['web', 'desktop', 'mobile'],
          requirements: ['microphone', 'modern browser'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
      {
        id: 'cap-4',
        name: 'Database',
        description: 'Store and query structured data',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['data-storage', 'querying', 'relationships', 'indexing'],
        limitations: ['requires setup', 'performance depends on size'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['web', 'desktop', 'server'],
          requirements: ['runtime environment'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
      {
        id: 'cap-5',
        name: 'Matching Algorithm',
        description: 'Match items based on criteria',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['matching', 'scoring', 'filtering', 'ranking'],
        limitations: ['algorithm quality depends on criteria'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['web', 'desktop', 'server'],
          requirements: ['runtime environment'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
      {
        id: 'cap-6',
        name: 'GPU Acceleration',
        description: 'Use GPU for parallel processing',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['gpu-compute', 'parallel-processing', 'video-processing'],
        limitations: ['requires compatible GPU', 'driver support needed'],
        cost: {
          type: 'free',
          details: 'No cost',
        },
        compatibility: {
          platforms: ['desktop', 'server'],
          requirements: ['compatible GPU', 'GPU drivers'],
        },
        provenance: {
          attribution: 'LCI',
          originalAuthor: 'LCI Team',
          verified: true,
        },
        status: 'active',
      },
    ];
  }
}

// Export CLI runner
export async function runCLI(config?: CLIConfig): Promise<void> {
  const cli = new LivingCreationCLI(config);
  await cli.initialize();
  await cli.run();
}