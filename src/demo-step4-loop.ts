// STEP 4 DEMO: The Living Creation Loop
// Human intention → understanding → possibility → challenge → system analysis → impact → Guardian → project

import { IntelligenceOrchestrator } from './intelligence/orchestrator';
import { Capability } from './types';

// Mock capabilities for demo
const mockCapabilities: Capability[] = [
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

async function runStep4Demo() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         STEP 4: THE LIVING CREATION LOOP                      ║');
  console.log('║                                                                ║');
  console.log('║  Human intention → understanding → possibility → challenge     ║');
  console.log('║  → system analysis → impact → Guardian → project               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const orchestrator = new IntelligenceOrchestrator(
    mockCapabilities,
    {} as any, // Would be real human profile
    {} as any  // Would be real device profile
  );

  // Test Case 1: Simple web form
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Simple Web Form with Local Storage');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const intention1 = {
    raw: 'I want to create a simple web form that saves data locally',
    context: {
      constraints: ['beginner-friendly', 'free solution'],
      resources: ['browser', 'basic computer'],
      timeline: '1 week',
    },
  };

  try {
    const result1 = await orchestrator.analyzeCreation(intention1);
    displayResults(result1);
  } catch (error) {
    console.error('Error in analysis:', error);
  }

  // Test Case 2: Community food waste system
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Community Food Waste Reduction System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const intention2 = {
    raw: 'Build a system to reduce food waste in my community by connecting people with excess food to those who need it',
    context: {
      constraints: ['privacy', 'reliability', 'scalable'],
      resources: ['computer', 'internet', 'some technical skills'],
      timeline: '3 months',
    },
  };

  try {
    const result2 = await orchestrator.analyzeCreation(intention2);
    displayResults(result2);
  } catch (error) {
    console.error('Error in analysis:', error);
  }

  // Test Case 3: Real-time AI video creation
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Real-time AI Video Creation System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const intention3 = {
    raw: 'Create a real-time AI video creation system that can generate and edit videos using AI models',
    context: {
      constraints: ['GPU required', 'high cost', 'complex infrastructure'],
      resources: ['powerful computer', 'GPU', 'cloud budget', 'expert team'],
      timeline: '12 months',
    },
  };

  try {
    const result3 = await orchestrator.analyzeCreation(intention3);
    displayResults(result3);
  } catch (error) {
    console.error('Error in analysis:', error);
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ STEP 4 DEMO COMPLETE                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

function displayResults(result: any) {
  console.log('📊 ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('🎯 OBSERVED INTENTION:');
  console.log(`   Explicit Request: ${result.observedIntention.explicitRequest}`);
  console.log(`   Confidence: ${(result.observedIntention.confidence * 100).toFixed(0)}%`);
  console.log(`   Facts: ${result.observedIntention.facts.length}`);
  console.log(`   Assumptions: ${result.observedIntention.assumptions.length}`);
  console.log(`   Unknowns: ${result.observedIntention.unknowns.length}\n`);
  
  console.log('🧠 UNDERSTANDING:');
  console.log(`   Root Need: ${result.understanding.rootNeed}`);
  console.log(`   Confidence: ${(result.understanding.confidence * 100).toFixed(0)}%`);
  console.log(`   Sub-problems: ${result.understanding.subProblems.length}`);
  console.log(`   Risks: ${result.understanding.risks.length}\n`);
  
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
  
  if (result.recommendedPossibility) {
    console.log(`\n✅ RECOMMENDED: ${result.recommendedPossibility.name}`);
    console.log(`   ${result.recommendedPossibility.reasoning}`);
  }
  
  console.log('\n🛡️ GUARDIAN CHECK:');
  console.log(`   Status: ${result.guardianAnalysis.status}`);
  console.log(`   Trust Level: ${(result.guardianAnalysis.trustLevel * 100).toFixed(0)}%`);
  if (result.guardianAnalysis.reasons.length > 0) {
    console.log(`   Concerns: ${result.guardianAnalysis.reasons.join(', ')}`);
  }
  
  console.log('\n📈 OVERALL ASSESSMENT:');
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`   Can Proceed: ${result.canProceed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Processing Time: ${result.processingTime}ms`);
  
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

// Run the demo
runStep4Demo().catch(console.error);