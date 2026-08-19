// CHALLENGE ENGINE - Tests and strengthens possibilities before commitment

import { 
  Understanding,
  HumanContext,
  GeneratedPossibility,
  PossibilitySet,
  ProjectConcept,
  ChallengeResult,
  ChallengeDimension
} from './types';

export class ChallengeEngine {
  
  challenge(possibility: GeneratedPossibility): ChallengeResult {
    console.log(`   ⚔️  Challenging: ${possibility.name}`);
    
    const dimensions: ChallengeDimension[] = [
      this.challengeFeasibility(possibility),
      this.challengeAssumptions(possibility),
      this.challengeRisks(possibility),
      this.challengeAlternatives(possibility),
      this.challengeEdgeCases(possibility),
      this.challengeFailureModes(possibility),
      this.challengeResourceConstraints(possibility),
      this.challengeHumanFactors(possibility),
    ];
    
    const weaknesses = dimensions
      .filter(d => d.severity === 'high' || d.severity === 'critical')
      .map(d => d.finding);
    
    const strengths = dimensions
      .filter(d => d.severity === 'low' || d.severity === 'none')
      .map(d => d.finding);
    
    const overallStrength = this.calculateStrength(dimensions);
    const canProceed = overallStrength > 0.5 && weaknesses.length === 0;
    
    return {
      possibilityId: possibility.id,
      dimensions,
      weaknesses,
      strengths,
      overallStrength,
      canProceed,
      recommendedActions: this.generateActions(dimensions),
      timestamp: new Date(),
    };
  }
  
  private challengeFeasibility(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check if feasibility score is backed by evidence
    if (possibility.scores.feasibility > 0.8 && !possibility.reasoning) {
      issues.push('High feasibility claim without supporting reasoning');
    }
    
    // Check resource requirements match complexity
    if (possibility.estimatedComplexity === 'high' && possibility.resourceRequirements.length < 3) {
      issues.push('High complexity but insufficient resource requirements specified');
    }
    
    // Check estimated time is realistic
    if (possibility.estimatedTime.includes('hour') && possibility.estimatedComplexity === 'high') {
      issues.push('High complexity project estimated to complete in hours - likely unrealistic');
    }
    
    evidence.push(`Feasibility score: ${(possibility.scores.feasibility * 100).toFixed(0)}%`);
    evidence.push(`Complexity: ${possibility.estimatedComplexity}`);
    evidence.push(`Resource requirements: ${possibility.resourceRequirements.length} items`);
    
    const severity = issues.length > 2 ? 'critical' : issues.length > 0 ? 'medium' : 'low';
    
    return {
      name: 'Feasibility',
      severity,
      finding: issues.length > 0 
        ? `Feasibility concerns: ${issues.join('; ')}`
        : 'Feasibility appears sound',
      issues,
      evidence,
      confidence: 0.8,
    };
  }
  
  private challengeAssumptions(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check for unstated assumptions
    if (possibility.innovation > 0.7) {
      issues.push('High innovation approach may rely on unproven assumptions');
    }
    
    // Check if capabilities are assumed available
    if (possibility.capabilities.length === 0) {
      issues.push('No capabilities specified - assuming all required capabilities exist');
    }
    
    // Check for external dependencies
    const hasExternalDeps = possibility.description.toLowerCase().includes('api') ||
                            possibility.description.toLowerCase().includes('cloud') ||
                            possibility.description.toLowerCase().includes('third-party');
    if (hasExternalDeps) {
      issues.push('External dependencies assumed to be available and reliable');
    }
    
    evidence.push(`Innovation level: ${(possibility.innovation * 100).toFixed(0)}%`);
    evidence.push(`Capabilities specified: ${possibility.capabilities.length}`);
    evidence.push(`Has external dependencies: ${hasExternalDeps}`);
    
    const severity = issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'low';
    
    return {
      name: 'Assumptions',
      severity,
      finding: issues.length > 0
        ? `Assumption risks: ${issues.join('; ')}`
        : 'Assumptions appear reasonable',
      issues,
      evidence,
      confidence: 0.7,
    };
  }
  
  private challengeRisks(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check safety score
    if (possibility.scores.safety < 0.5) {
      issues.push('Low safety score indicates potential harm');
    }
    
    // Check privacy implications
    if (possibility.scores.privacy < 0.5) {
      issues.push('Low privacy score - data protection concerns');
    }
    
    // Check security implications
    if (possibility.scores.security < 0.5) {
      issues.push('Low security score - vulnerability risks');
    }
    
    // Check impact score
    if (possibility.scores.impact < 0.3) {
      issues.push('Very low impact score - may not achieve intended outcome');
    }
    
    evidence.push(`Safety: ${(possibility.scores.safety * 100).toFixed(0)}%`);
    evidence.push(`Privacy: ${(possibility.scores.privacy * 100).toFixed(0)}%`);
    evidence.push(`Security: ${(possibility.scores.security * 100).toFixed(0)}%`);
    evidence.push(`Impact: ${(possibility.scores.impact * 100).toFixed(0)}%`);
    
    const severity = issues.length > 2 ? 'critical' : issues.length > 0 ? 'high' : 'low';
    
    return {
      name: 'Risks',
      severity,
      finding: issues.length > 0
        ? `Risk concerns: ${issues.join('; ')}`
        : 'Risk profile acceptable',
      issues,
      evidence,
      confidence: 0.85,
    };
  }
  
  private challengeAlternatives(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check if this is the simplest viable option
    if (possibility.category === 'innovative' && possibility.scores.feasibility < 0.7) {
      issues.push('Innovative approach selected when simpler options may exist');
    }
    
    // Check if cost is justified
    if (possibility.estimatedCost === 'paid' && possibility.scores.cost < 0.5) {
      issues.push('Paid solution with poor cost efficiency');
    }
    
    // Check if there's a simpler alternative
    if (possibility.estimatedComplexity === 'high' && !possibility.description.toLowerCase().includes('required')) {
      issues.push('High complexity may not be necessary - simpler alternatives not ruled out');
    }
    
    evidence.push(`Category: ${possibility.category}`);
    evidence.push(`Cost: ${possibility.estimatedCost}`);
    evidence.push(`Complexity: ${possibility.estimatedComplexity}`);
    
    const severity = issues.length > 1 ? 'medium' : 'low';
    
    return {
      name: 'Alternatives',
      severity,
      finding: issues.length > 0
        ? `Alternative concerns: ${issues.join('; ')}`
        : 'Alternative approaches considered',
      issues,
      evidence,
      confidence: 0.6,
    };
  }
  
  private challengeEdgeCases(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check for error handling
    if (!possibility.description.toLowerCase().includes('error') &&
        !possibility.description.toLowerCase().includes('fail') &&
        !possibility.description.toLowerCase().includes('fallback')) {
      issues.push('No mention of error handling or failure scenarios');
    }
    
    // Check for scalability considerations
    if (possibility.estimatedComplexity === 'high' && 
        !possibility.description.toLowerCase().includes('scale')) {
      issues.push('High complexity project without scalability considerations');
    }
    
    // Check for data validation
    if (possibility.description.toLowerCase().includes('input') &&
        !possibility.description.toLowerCase().includes('valid')) {
      issues.push('Input handling mentioned but validation not specified');
    }
    
    evidence.push('Description analyzed for edge case handling');
    evidence.push(`Complexity: ${possibility.estimatedComplexity}`);
    
    const severity = issues.length > 1 ? 'high' : issues.length > 0 ? 'medium' : 'low';
    
    return {
      name: 'Edge Cases',
      severity,
      finding: issues.length > 0
        ? `Edge case concerns: ${issues.join('; ')}`
        : 'Edge cases appear addressed',
      issues,
      evidence,
      confidence: 0.65,
    };
  }
  
  private challengeFailureModes(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check for single points of failure
    if (possibility.capabilities.length === 1) {
      issues.push('Single capability dependency - single point of failure');
    }
    
    // Check for recovery mechanisms
    if (!possibility.description.toLowerCase().includes('backup') &&
        !possibility.description.toLowerCase().includes('recovery') &&
        !possibility.description.toLowerCase().includes('redundant')) {
      issues.push('No recovery or backup mechanisms mentioned');
    }
    
    // Check for monitoring
    if (possibility.estimatedComplexity !== 'low' &&
        !possibility.description.toLowerCase().includes('monitor') &&
        !possibility.description.toLowerCase().includes('log')) {
      issues.push('No monitoring or logging mentioned for complex system');
    }
    
    evidence.push(`Capabilities: ${possibility.capabilities.length}`);
    evidence.push(`Complexity: ${possibility.estimatedComplexity}`);
    
    const severity = issues.length > 1 ? 'high' : issues.length > 0 ? 'medium' : 'low';
    
    return {
      name: 'Failure Modes',
      severity,
      finding: issues.length > 0
        ? `Failure mode concerns: ${issues.join('; ')}`
        : 'Failure modes appear addressed',
      issues,
      evidence,
      confidence: 0.7,
    };
  }
  
  private challengeResourceConstraints(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check resource requirements are specified
    if (possibility.resourceRequirements.length === 0) {
      issues.push('No resource requirements specified');
    }
    
    // Check for resource conflicts
    if (possibility.estimatedCost === 'free' && possibility.scores.resourceFit < 0.5) {
      issues.push('Free solution but poor resource fit - may require unexpected resources');
    }
    
    // Check human skills match
    if (possibility.humanSkills.length === 0) {
      issues.push('No human skills specified - unclear if team can execute');
    }
    
    evidence.push(`Resource requirements: ${possibility.resourceRequirements.length}`);
    evidence.push(`Cost: ${possibility.estimatedCost}`);
    evidence.push(`Resource fit: ${(possibility.scores.resourceFit * 100).toFixed(0)}%`);
    evidence.push(`Human skills: ${possibility.humanSkills.length}`);
    
    const severity = issues.length > 1 ? 'high' : issues.length > 0 ? 'medium' : 'low';
    
    return {
      name: 'Resource Constraints',
      severity,
      finding: issues.length > 0
        ? `Resource concerns: ${issues.join('; ')}`
        : 'Resource constraints appear manageable',
      issues,
      evidence,
      confidence: 0.75,
    };
  }
  
  private challengeHumanFactors(possibility: GeneratedPossibility): ChallengeDimension {
    const issues: string[] = [];
    const evidence: string[] = [];
    
    // Check human fit score
    if (possibility.scores.humanFit < 0.5) {
      issues.push('Low human fit - may not align with user capabilities or preferences');
    }
    
    // Check for accessibility considerations
    if (!possibility.description.toLowerCase().includes('accessib') &&
        !possibility.description.toLowerCase().includes('usability')) {
      issues.push('Accessibility and usability not explicitly considered');
    }
    
    // Check for documentation
    if (possibility.estimatedComplexity !== 'low' &&
        !possibility.description.toLowerCase().includes('document')) {
      issues.push('Complex solution without documentation plan');
    }
    
    evidence.push(`Human fit: ${(possibility.scores.humanFit * 100).toFixed(0)}%`);
    evidence.push(`Complexity: ${possibility.estimatedComplexity}`);
    
    const severity = issues.length > 1 ? 'medium' : issues.length > 0 ? 'low' : 'low';
    
    return {
      name: 'Human Factors',
      severity,
      finding: issues.length > 0
        ? `Human factor concerns: ${issues.join('; ')}`
        : 'Human factors appear considered',
      issues,
      evidence,
      confidence: 0.7,
    };
  }
  
  private calculateStrength(dimensions: ChallengeDimension[]): number {
    if (dimensions.length === 0) return 0;
    
    const severityScores: Record<ChallengeDimension['severity'], number> = {
      'none': 1.0,
      'low': 0.8,
      'medium': 0.5,
      'high': 0.3,
      'critical': 0.1,
    };
    
    const totalScore = dimensions.reduce((sum, dim) => {
      return sum + (severityScores[dim.severity] * dim.confidence);
    }, 0);
    
    const maxScore = dimensions.length;
    return totalScore / maxScore;
  }
  
  private generateActions(dimensions: ChallengeDimension[]): string[] {
    const actions: string[] = [];
    
    dimensions.forEach(dim => {
      if (dim.severity === 'critical' || dim.severity === 'high') {
        actions.push(`Address ${dim.name.toLowerCase()} issues before proceeding`);
      } else if (dim.severity === 'medium') {
        actions.push(`Review ${dim.name.toLowerCase()} concerns`);
      }
    });
    
    if (actions.length === 0) {
      actions.push('Proceed with implementation');
    }
    
    return actions;
  }
  
  // Challenge all possibilities in a set
  challengeAll(possibilities: PossibilitySet): Map<string, ChallengeResult> {
    console.log('\n⚔️  CHALLENGING ALL POSSIBILITIES\n');
    
    const results = new Map<string, ChallengeResult>();
    
    possibilities.possibilities.forEach(possibility => {
      const result = this.challenge(possibility);
      results.set(possibility.id, result);
      
      const status = result.canProceed ? '✅' : '❌';
      console.log(`${status} ${possibility.name}: Strength ${(result.overallStrength * 100).toFixed(0)}%`);
    });
    
    return results;
  }
  
  // Select the strongest possibility after challenging
  selectStrongestPossibility(
    possibilities: PossibilitySet,
    challengeResults: Map<string, ChallengeResult>
  ): GeneratedPossibility | null {
    if (possibilities.possibilities.length === 0) return null;
    
    // Score each possibility by strength
    const scored = possibilities.possibilities.map(p => {
      const challenge = challengeResults.get(p.id);
      const strength = challenge?.overallStrength || 0;
      
      // Combine original score with challenge strength
      const originalScore = this.calculateRecommendationScore(p);
      const finalScore = (originalScore * 0.6) + (strength * 0.4);
      
      return {
        possibility: p,
        score: finalScore,
        strength,
      };
    });
    
    // Sort by final score descending
    scored.sort((a, b) => b.score - a.score);
    
    const best = scored[0];
    console.log(`\n💪 Strongest possibility: ${best.possibility.name}`);
    console.log(`   Original score: ${(best.score * 100).toFixed(0)}%`);
    console.log(`   Challenge strength: ${(best.strength * 100).toFixed(0)}%`);
    
    return best.possibility;
  }
  
  private calculateRecommendationScore(possibility: GeneratedPossibility): number {
    const scores = possibility.scores;
    
    let score = 0;
    score += scores.feasibility * 0.2;
    score += scores.safety * 0.15;
    score += scores.privacy * 0.1;
    score += scores.security * 0.1;
    score += scores.cost * 0.1;
    score += scores.resourceFit * 0.1;
    score += scores.humanFit * 0.1;
    score += scores.impact * 0.15;
    score += scores.maturity * 0.05;
    score += scores.evidenceQuality * 0.05;
    score -= possibility.innovation * 0.05;
    
    return Math.max(0, Math.min(1, score));
  }
}