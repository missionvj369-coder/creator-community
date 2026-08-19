// Brain Orchestrator - Coordinates the Ten Intelligences
// Processes human intentions through the complete intelligence pipeline

import { Observer } from '../intelligence/observer';
import { UnderstandingEngine } from '../intelligence/understanding';
import { EmpathyEngine } from '../intelligence/empathy';
import { PossibilityEngine } from '../intelligence/possibility';
import { Creator } from '../intelligence/creator';
import { SystemsEngine } from '../intelligence/systems';
import { ImpactEngine } from '../intelligence/impact';
import { EvolutionEngine } from '../intelligence/evolution';
import { Guardian } from '../guardian/guardian';

import type {
  Intention,
  ObservedIntention,
  Understanding,
  HumanContext,
  PossibilitySet,
  ProjectConcept,
  SystemsAnalysis,
  ImpactAnalysis,
  EvolutionAnalysis,
  CreationAnalysis,
  GeneratedPossibility
} from '../intelligence/types';

import type { Capability, DeviceProfile, HumanCapabilityProfile } from '../types';

import { GuardianInput, GuardianResult } from '../guardian/types';
import { MemoryManager, MemoryStore, createMemoryManager, FileMemoryStore } from '../memory';

export interface OrchestratorConfig {
  enableObserver?: boolean;
  enableGuardian?: boolean;
  enableEvolution?: boolean;
  enableMemory?: boolean;
  capabilities: Capability[];
  deviceProfile: DeviceProfile;
  humanProfile: HumanCapabilityProfile;
  memoryStore?: MemoryStore;
}

export class BrainOrchestrator {
  private config: OrchestratorConfig;
  
  // Intelligence engines
  private observer: Observer;
  private understanding: UnderstandingEngine;
  private empathy: EmpathyEngine;
  private possibility: PossibilityEngine;
  private creator: Creator;
  private systems: SystemsEngine;
  private impact: ImpactEngine;
  private evolution: EvolutionEngine;
  private guardian: Guardian;
  
  // Memory
  private memory: MemoryManager | null = null;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    
    // Initialize all intelligence engines
    this.observer = new Observer();
    this.understanding = new UnderstandingEngine();
    this.empathy = new EmpathyEngine();
    this.possibility = new PossibilityEngine(config.capabilities);
    this.creator = new Creator();
    this.systems = new SystemsEngine();
    this.impact = new ImpactEngine();
    this.evolution = new EvolutionEngine();
    this.guardian = new Guardian();
    
    // Initialize memory if enabled
    if (config.enableMemory !== false) {
      const store = config.memoryStore || new FileMemoryStore();
      this.memory = createMemoryManager(store);
    }
  }

  async initialize(): Promise<void> {
    // Initialize the brain orchestrator
    // Load capabilities, validate profiles, etc.
    if (this.memory) {
      await this.memory.initialize();
    }
  }

  async processIntention(intention: Intention): Promise<CreationAnalysis> {
    const startTime = Date.now();
    
    // Stage 1: OBSERVER - Extract facts and signals
    const observedIntention = this.observer.observe(intention);
    
    // Stage 2: UNDERSTANDING - Transform into structured problem
    const understanding = this.understanding.understand(observedIntention);
    
    // Stage 3: EMPATHY - Model human perspective
    const humanContext = this.empathy.modelHumanContext(
      observedIntention,
      understanding,
      this.config.humanProfile,
      this.config.deviceProfile
    );
    
    // Stage 4: POSSIBILITY - Generate multiple solutions
    const possibilities = this.possibility.generatePossibilities(
      understanding,
      this.config.capabilities,
      humanContext,
      this.config.deviceProfile
    );
    
    // Stage 5: CREATOR - Transform best possibility into project concept
    const recommendedPossibility = this.selectBestPossibility(possibilities);
    const projectConcept = recommendedPossibility 
      ? this.creator.createProjectConcept(recommendedPossibility, understanding, humanContext)
      : null;
    
    // Stage 6: SYSTEMS - Analyze real-world effects
    const systemsAnalysis = projectConcept 
      ? this.systems.analyzeSystems(projectConcept)
      : this.createEmptySystemsAnalysis();
    
    // Stage 7: IMPACT - Evaluate across dimensions
    const impactAnalysis = projectConcept
      ? this.impact.analyzeImpact(projectConcept)
      : this.createEmptyImpactAnalysis();
    
    // Stage 8: GUARDIAN - Constitutional checks (if enabled)
    let guardianAnalysis: GuardianResult;
    if (this.config.enableGuardian !== false && recommendedPossibility) {
      guardianAnalysis = this.runGuardianChecks(recommendedPossibility, projectConcept!);
    } else {
      guardianAnalysis = this.createEmptyGuardianAnalysis();
    }
    
    // Stage 9: EVOLUTION - Compare and improve (if enabled)
    const evolutionAnalysis = this.evolution.evolve(possibilities, []);
    
    // Stage 10: WORLD - Capability provider (already integrated via capabilities)
    
    // Stage 11: MEMORY - Record experience and learn (if enabled)
    if (this.memory) {
      const memorySuggestions = await this.memory.getImprovementSuggestions(intention.raw);
      if (memorySuggestions.length > 0) {
        evolutionAnalysis.reasoning += `\nMemory insights: ${memorySuggestions.join('; ')}`;
      }
    }
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence({
      observed: observedIntention.confidence,
      understanding: understanding.confidence,
      humanContext: humanContext.confidence,
      possibilities: possibilities.diversityScore,
      projectConcept: projectConcept?.confidence || 0,
      systems: systemsAnalysis.confidence,
      impact: impactAnalysis.confidence,
      guardian: guardianAnalysis.evidence.trustLevel as number,
      evolution: evolutionAnalysis.confidence,
    });
    
    // Extract unknowns and assumptions
    const unknowns = [
      ...observedIntention.unknowns,
      ...humanContext.unknown,
      ...(projectConcept?.unknowns || []),
    ];
    
    const assumptions = [
      ...observedIntention.assumptions,
      ...(projectConcept?.assumptions || []),
    ];
    
    const evidence = [
      ...understanding.successConditions,
      ...(projectConcept?.evidence || []),
    ];
    
    // Determine if we can proceed
    const blockingFactors = this.identifyBlockingFactors(
      guardianAnalysis,
      evolutionAnalysis,
      possibilities
    );
    
    const canProceed = blockingFactors.length === 0;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      recommendedPossibility,
      projectConcept,
      evolutionAnalysis,
      humanContext
    );
    
    const processingTime = Date.now() - startTime;
    
    // Record experience in memory
    if (this.memory) {
      const result = {
        intention,
        observedIntention,
        understanding,
        humanContext,
        availableCapabilities: this.config.capabilities,
        possibilities,
        systemsAnalysis,
        impactAnalysis,
        guardianAnalysis,
        recommendedPossibility,
        projectConcept,
        evolutionAnalysis,
        confidence,
        unknowns: [...new Set(unknowns)],
        assumptions: [...new Set(assumptions)],
        evidence: [...new Set(evidence)],
        canProceed,
        blockingFactors,
        recommendations,
        timestamp: new Date(),
        processingTime,
      };
      await this.memory.recordExperience(result, intention);
    }
    
    return {
      intention,
      observedIntention,
      understanding,
      humanContext,
      availableCapabilities: this.config.capabilities,
      possibilities,
      systemsAnalysis,
      impactAnalysis,
      guardianAnalysis,
      recommendedPossibility,
      projectConcept,
      evolutionAnalysis,
      confidence,
      unknowns: [...new Set(unknowns)],
      assumptions: [...new Set(assumptions)],
      evidence: [...new Set(evidence)],
      canProceed,
      blockingFactors,
      recommendations,
      timestamp: new Date(),
      processingTime,
    };
  }

  private selectBestPossibility(possibilities: PossibilitySet): GeneratedPossibility | null {
    if (possibilities.possibilities.length === 0) return null;
    
    // Select based on highest overall score
    return possibilities.possibilities.reduce((best: GeneratedPossibility, current: GeneratedPossibility) => {
      const bestScore = this.calculatePossibilityScore(best);
      const currentScore = this.calculatePossibilityScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculatePossibilityScore(possibility: GeneratedPossibility): number {
    const scores = possibility.scores;
    return (
      scores.feasibility * 0.2 +
      scores.safety * 0.15 +
      scores.privacy * 0.1 +
      scores.security * 0.1 +
      scores.cost * 0.1 +
      scores.resourceFit * 0.1 +
      scores.humanFit * 0.1 +
      scores.impact * 0.1 +
      scores.maturity * 0.05
    );
  }

  private runGuardianChecks(possibility: GeneratedPossibility, projectConcept: ProjectConcept): GuardianResult {
    const input: GuardianInput = {
      name: possibility.name,
      description: possibility.description,
      source: 'living-creation-intelligence',
      sourceUrl: '',
      repositoryUrl: '',
      license: 'MIT', // Default to MIT for generated solutions
      language: 'TypeScript',
      openIssues: 0,
      securityProfile: undefined,
      privacyProfile: undefined,
      topics: [],
    };

    return this.guardian.evaluate(input);
  }

  private createEmptySystemsAnalysis(): SystemsAnalysis {
    return {
      inputs: [],
      processes: [],
      outputs: [],
      feedbackLoops: [],
      dependencies: [],
      firstOrderEffects: [],
      secondOrderEffects: [],
      thirdOrderEffects: [],
      unintendedConsequences: [],
      failureModes: [],
      scalability: {
        currentCapacity: 'unknown',
        maxCapacity: 'unknown',
        scalingLimitations: [],
        scalingCost: 'medium',
        bottlenecks: [],
      },
      maintenance: {
        requiredMaintenance: [],
        maintenanceFrequency: 'weekly',
        maintenanceComplexity: 'medium',
        longTermViability: 0.5,
      },
      resourceConsumption: {
        compute: 'unknown',
        storage: 'unknown',
        network: 'unknown',
        energy: 'medium',
        sustainability: 0.5,
      },
      confidence: 0,
    };
  }

  private createEmptyImpactAnalysis(): ImpactAnalysis {
    return {
      dimensions: [],
      overallPositive: 0,
      overallNegative: 0,
      overallUncertainty: 0,
      summary: 'No project concept generated',
      confidence: 0,
    };
  }

  private createEmptyGuardianAnalysis(): GuardianResult {
    return {
      status: 'REVIEW',
      trustLevel: 0.5,
      licenseStatus: 'UNKNOWN',
      securityRisk: 'MEDIUM',
      privacyRisk: 'MEDIUM',
      executionRisk: 'MEDIUM',
      dependencyRisk: 'MEDIUM',
      reasons: [],
      warnings: ['No capability to evaluate'],
      evidence: {},
      recommendedAction: 'No evaluation performed',
      evaluatedAt: new Date(),
    };
  }

  private calculateOverallConfidence(metrics: {
    observed: number;
    understanding: number;
    humanContext: number;
    possibilities: number;
    projectConcept: number;
    systems: number;
    impact: number;
    guardian: number;
    evolution: number;
  }): number {
    const weights = {
      observed: 0.1,
      understanding: 0.15,
      humanContext: 0.1,
      possibilities: 0.15,
      projectConcept: 0.15,
      systems: 0.1,
      impact: 0.1,
      guardian: 0.08,
      evolution: 0.07,
    };

    const weightedSum = 
      metrics.observed * weights.observed +
      metrics.understanding * weights.understanding +
      metrics.humanContext * weights.humanContext +
      metrics.possibilities * weights.possibilities +
      metrics.projectConcept * weights.projectConcept +
      metrics.systems * weights.systems +
      metrics.impact * weights.impact +
      metrics.guardian * weights.guardian +
      metrics.evolution * weights.evolution;

    return Math.min(1, Math.max(0, weightedSum));
  }

  private identifyBlockingFactors(
    guardian: GuardianResult,
    evolution: EvolutionAnalysis,
    possibilities: PossibilitySet
  ): string[] {
    const blockingFactors: string[] = [];

    // Guardian blocks
    if (guardian.status === 'REJECT') {
      blockingFactors.push('Guardian rejected: ' + guardian.warnings.join(', '));
    }

    // Critical improvements needed
    const criticalImprovements = evolution.improvements.filter(i => i.impact === 'critical');
    if (criticalImprovements.length > 0) {
      blockingFactors.push(`Critical improvements needed: ${criticalImprovements.map(i => i.description).join(', ')}`);
    }

    // No viable possibilities
    if (possibilities.possibilities.length === 0) {
      blockingFactors.push('No viable possibilities generated');
    }

    return blockingFactors;
  }

  private generateRecommendations(
    possibility: GeneratedPossibility | null,
    projectConcept: ProjectConcept | null,
    evolution: EvolutionAnalysis,
    humanContext: HumanContext
  ): string[] {
    const recommendations: string[] = [];

    if (possibility) {
      recommendations.push(`Recommended approach: ${possibility.name}`);
      recommendations.push(`Reasoning: ${possibility.reasoning}`);
      
      if (possibility.scores.privacy < 0.8) {
        recommendations.push('Consider privacy-enhancing modifications');
      }
      
      if (humanContext.desiredGuidance === 'detailed') {
        recommendations.push('Follow implementation stages sequentially with detailed guidance');
      }
    }

    if (evolution.shouldEvolve && evolution.evolutionPriority === 'high') {
      recommendations.push('High-priority improvements identified - review evolution analysis');
    }
    
    // Add top improvements
    const criticalImprovements = evolution.improvements.filter(i => i.impact === 'critical' || i.impact === 'high');
    if (criticalImprovements.length > 0) {
      recommendations.push(`Top priority: ${criticalImprovements[0].description}`);
    }

    if (projectConcept) {
      recommendations.push(`Estimated implementation time: ${projectConcept.humanSkillRequirements.timeToImplement}`);
      recommendations.push(`Learning curve: ${projectConcept.humanSkillRequirements.learningCurve}`);
    }

    return recommendations;
  }

  getStatus(): string {
    return 'Brain Orchestrator V0.2 - Full implementation with all 10 intelligences';
  }
}

export function createOrchestrator(config: OrchestratorConfig): BrainOrchestrator {
  return new BrainOrchestrator(config);
}