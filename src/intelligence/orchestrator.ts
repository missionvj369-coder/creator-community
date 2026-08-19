// INTELLIGENCE ORCHESTRATOR - Coordinates all intelligences

import { 
  Intention,
  ObservedIntention,
  Understanding,
  HumanContext,
  PossibilitySet,
  GeneratedPossibility,
  ProjectConcept,
  SystemsAnalysis,
  ImpactAnalysis,
  EvolutionAnalysis,
  CreationAnalysis
} from './types';

import { Observer } from './observer';
import { UnderstandingEngine } from './understanding';
import { EmpathyEngine } from './empathy';
import { PossibilityEngine } from './possibility';
import { ChallengeEngine } from './challenge';
import { Creator } from './creator';
import { SystemsEngine } from './systems';
import { ImpactEngine } from './impact';
import { EvolutionEngine } from './evolution';
import { Guardian } from '../guardian/guardian';

import { Capability, HumanCapabilityProfile, DeviceProfile } from '../types';

export class IntelligenceOrchestrator {
  private observer: Observer;
  private understandingEngine: UnderstandingEngine;
  private empathyEngine: EmpathyEngine;
  private possibilityEngine: PossibilityEngine;
  private challengeEngine: ChallengeEngine;
  private creator: Creator;
  private systemsEngine: SystemsEngine;
  private impactEngine: ImpactEngine;
  private evolutionEngine: EvolutionEngine;
  private guardian: Guardian;
  
  constructor(
    capabilities: Capability[],
    _humanProfile: HumanCapabilityProfile,
    _deviceProfile: DeviceProfile
  ) {
    this.observer = new Observer();
    this.understandingEngine = new UnderstandingEngine();
    this.empathyEngine = new EmpathyEngine();
    this.possibilityEngine = new PossibilityEngine(capabilities);
    this.challengeEngine = new ChallengeEngine();
    this.creator = new Creator();
    this.systemsEngine = new SystemsEngine();
    this.impactEngine = new ImpactEngine();
    this.evolutionEngine = new EvolutionEngine();
    this.guardian = new Guardian();
  }
  
  async analyzeCreation(intention: Intention): Promise<CreationAnalysis> {
    const startTime = Date.now();
    const unknowns: string[] = [];
    const assumptions: string[] = [];
    const evidence: string[] = [];
    const blockingFactors: string[] = [];
    const recommendations: string[] = [];
    
    // Stage 1: OBSERVE - Extract facts from intention
    console.log('🔍 Stage 1: Observing intention...');
    const observedIntention = this.observer.observe(intention);
    unknowns.push(...observedIntention.unknowns);
    assumptions.push(...observedIntention.assumptions);
    evidence.push(...observedIntention.facts);
    
    // Stage 2: UNDERSTAND - Transform into structured problem
    console.log('🧠 Stage 2: Understanding the problem...');
    const understanding = this.understandingEngine.understand(observedIntention);
    unknowns.push(...understanding.risks);
    evidence.push(...understanding.successConditions);
    
    // Stage 3: EMPATHIZE - Model human perspective
    console.log('❤️ Stage 3: Modeling human context...');
    const humanProfile = {} as HumanCapabilityProfile; // Would be passed in real implementation
    const deviceProfile = {} as DeviceProfile; // Would be passed in real implementation
    const humanContext = this.empathyEngine.modelHumanContext(
      observedIntention,
      understanding,
      humanProfile,
      deviceProfile
    ) as any; // Type assertion to handle HumanContext vs HumanCapabilityProfile difference
    unknowns.push(...humanContext.unknown);
    
    // Stage 4: GENERATE POSSIBILITIES - Create multiple solutions
    console.log('💡 Stage 4: Generating possibilities...');
    const capabilities: Capability[] = []; // Would be fetched from world in real implementation
    const possibilities = this.possibilityEngine.generatePossibilities(
      understanding,
      capabilities,
      humanContext,
      deviceProfile
    );
    
    // Stage 4.5: CHALLENGE - Test and strengthen possibilities
    console.log('⚔️  Stage 4.5: Challenging possibilities...');
    const challengeResults = this.challengeEngine.challengeAll(possibilities);
    const recommendedPossibility = this.challengeEngine.selectStrongestPossibility(
      possibilities,
      challengeResults
    );
    
    // Stage 5: CREATE - Transform into project concept
    let projectConcept: ProjectConcept | null = null;
    if (recommendedPossibility) {
      console.log('🛠️ Stage 5: Creating project concept...');
      projectConcept = this.creator.createProjectConcept(
        recommendedPossibility,
        understanding,
        humanContext
      );
      assumptions.push(...projectConcept.assumptions);
      unknowns.push(...projectConcept.unknowns);
    }
    
    // Stage 6: SYSTEMS ANALYSIS - Evaluate real-world effects
    let systemsAnalysis: SystemsAnalysis | null = null;
    if (projectConcept) {
      console.log('🌐 Stage 6: Analyzing systems...');
      systemsAnalysis = this.systemsEngine.analyzeSystems(projectConcept);
      blockingFactors.push(...systemsAnalysis.failureModes
        .filter(fm => fm.impact === 'critical')
        .map(fm => fm.name));
    }
    
    // Stage 7: IMPACT ANALYSIS - Evaluate effects across dimensions
    let impactAnalysis: ImpactAnalysis | null = null;
    if (projectConcept) {
      console.log('📊 Stage 7: Analyzing impact...');
      impactAnalysis = this.impactEngine.analyzeImpact(projectConcept);
      
      if (impactAnalysis.overallNegative > 0.7) {
        blockingFactors.push('High negative impact identified');
      }
    }
    
    // Stage 8: GUARDIAN - Constitutional check
    console.log('🛡️ Stage 8: Running constitutional checks...');
    const guardianInput = {
      name: projectConcept?.objective || 'Unknown project',
      description: projectConcept?.proposedSolution || '',
      source: 'intelligence-orchestrator',
      sourceUrl: '',
      capabilityType: 'project',
      classificationConfidence: 'HIGH',
    } as any;
    
    const guardianAnalysis = this.guardian.evaluate(guardianInput);
    
    // Guardian returns status, not approved/violations
    if (guardianAnalysis.status === 'REJECT') {
      blockingFactors.push(...guardianAnalysis.reasons);
      recommendations.push(guardianAnalysis.recommendedAction);
    } else if (guardianAnalysis.status === 'REVIEW') {
      recommendations.push(...guardianAnalysis.warnings);
      recommendations.push(guardianAnalysis.recommendedAction);
    }
    
    // Stage 9: EVOLUTION - Compare and improve
    console.log('🧬 Stage 9: Analyzing evolution...');
    const evolutionAnalysis = this.evolutionEngine.evolve(
      possibilities,
      [] // No past experiences in initial implementation
    );
    
    if (evolutionAnalysis.shouldEvolve) {
      recommendations.push(`Evolution recommended: ${evolutionAnalysis.reasoning}`);
    }
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence({
      observedConfidence: observedIntention.confidence,
      understandingConfidence: understanding.confidence,
      humanContextConfidence: humanContext.confidence,
      possibilitiesDiversity: possibilities.diversityScore,
      projectConceptConfidence: projectConcept?.confidence || 0,
      systemsConfidence: systemsAnalysis?.confidence || 0,
      impactConfidence: impactAnalysis?.confidence || 0,
      guardianConfidence: guardianAnalysis.trustLevel,
      evolutionConfidence: evolutionAnalysis.confidence,
    });
    
    // Determine if we can proceed
    const canProceed = blockingFactors.length === 0 && guardianAnalysis.status === 'ACCEPT';
    
    // Generate final recommendations
    if (recommendedPossibility) {
      recommendations.push(`Recommended approach: ${recommendedPossibility.name}`);
      recommendations.push(`Category: ${recommendedPossibility.category}`);
      recommendations.push(`Estimated complexity: ${recommendedPossibility.estimatedComplexity}`);
      recommendations.push(`Estimated cost: ${recommendedPossibility.estimatedCost}`);
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Analysis complete!');
    
    return {
      intention,
      observedIntention,
      understanding,
      humanContext,
      availableCapabilities: capabilities,
      possibilities,
      systemsAnalysis: systemsAnalysis!,
      impactAnalysis: impactAnalysis!,
      guardianAnalysis,
      recommendedPossibility,
      projectConcept,
      evolutionAnalysis,
      confidence,
      unknowns,
      assumptions,
      evidence,
      canProceed,
      blockingFactors,
      recommendations,
      timestamp: new Date(),
      processingTime,
    };
  }
  
  private selectRecommendedPossibility(possibilities: PossibilitySet): GeneratedPossibility | null {
    if (possibilities.possibilities.length === 0) return null;
    
    // Score each possibility
    const scored = possibilities.possibilities.map(p => ({
      possibility: p,
      score: this.calculateRecommendationScore(p),
    }));
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].possibility;
  }
  
  private calculateRecommendationScore(possibility: GeneratedPossibility): number {
    const scores = possibility.scores;
    
    // Weighted scoring
    let score = 0;
    score += scores.feasibility * 0.2;
    score += scores.safety * 0.15;
    score += scores.privacy * 0.1;
    score += scores.security * 0.1;
    score += scores.cost * 0.1;
    score += scores.resourceFit * 0.1;
    score += scores.humanFit * 0.1;
    score += scores.impact * 0.15;
    
    // Bonus for maturity and evidence
    score += scores.maturity * 0.05;
    score += scores.evidenceQuality * 0.05;
    
    // Penalize high innovation (more risk)
    score -= possibility.innovation * 0.05;
    
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateOverallConfidence(metrics: {
    observedConfidence: number;
    understandingConfidence: number;
    humanContextConfidence: number;
    possibilitiesDiversity: number;
    projectConceptConfidence: number;
    systemsConfidence: number;
    impactConfidence: number;
    guardianConfidence: number;
    evolutionConfidence: number;
  }): number {
    const weights = {
      observed: 0.1,
      understanding: 0.15,
      humanContext: 0.1,
      possibilities: 0.1,
      projectConcept: 0.15,
      systems: 0.1,
      impact: 0.1,
      guardian: 0.1,
      evolution: 0.1,
    };
    
    const confidence = 
      metrics.observedConfidence * weights.observed +
      metrics.understandingConfidence * weights.understanding +
      metrics.humanContextConfidence * weights.humanContext +
      metrics.possibilitiesDiversity * weights.possibilities +
      metrics.projectConceptConfidence * weights.projectConcept +
      metrics.systemsConfidence * weights.systems +
      metrics.impactConfidence * weights.impact +
      metrics.guardianConfidence * weights.guardian +
      metrics.evolutionConfidence * weights.evolution;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  // Convenience method for simple analysis
  async quickAnalysis(goal: string, context?: string): Promise<CreationAnalysis> {
    const intention = {
      raw: `${goal}${context ? ` - ${context}` : ''}`,
      goal,
      context: context || '',
      explicitRequirements: [],
      implicitGoals: [],
      constraints: [],
      availableResources: [],
      stakeholders: [],
      timeline: 'flexible',
      successCriteria: [],
    } as any;
    
    return this.analyzeCreation(intention);
  }
}