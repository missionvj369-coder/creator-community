// 9. EVOLUTION - Compares and improves

import { 
  PossibilitySet, 
  GeneratedPossibility, 
  EvolutionAnalysis,
  AlternativeComparison,
  ValidatedExperience,
  Improvement
} from './types';

export class EvolutionEngine {
  evolve(
    possibilities: PossibilitySet,
    experiences: any[] // Will be properly typed when memory module is implemented
  ): EvolutionAnalysis {
    const currentPossibility = this.selectCurrentPossibility(possibilities);
    const alternatives = this.generateAlternatives(currentPossibility, possibilities);
    const validatedExperiences = this.loadValidatedExperiences(experiences);
    const improvements = this.identifyImprovements(currentPossibility, alternatives, validatedExperiences);
    const assumptionsToRevisit = this.identifyAssumptionsToRevisit(currentPossibility, improvements);
    const newerCapabilities = this.identifyNewerCapabilities(currentPossibility);
    const { shouldEvolve, evolutionPriority, reasoning } = this.decideEvolution(
      currentPossibility,
      improvements,
      alternatives
    );
    
    const confidence = this.calculateConfidence({
      hasCurrentPossibility: currentPossibility !== null,
      hasAlternatives: alternatives.length > 0,
      hasExperiences: validatedExperiences.length > 0,
      hasImprovements: improvements.length > 0,
    });
    
    return {
      currentPossibility: currentPossibility!, // Non-null assertion since we handle null case in shouldEvolve
      alternatives,
      validatedExperiences,
      improvements,
      assumptionsToRevisit,
      newerCapabilities,
      shouldEvolve,
      evolutionPriority,
      reasoning,
      confidence,
    };
  }
  
  private selectCurrentPossibility(possibilities: PossibilitySet): GeneratedPossibility | null {
    // Select the highest-scoring possibility as current
    if (possibilities.possibilities.length === 0) return null;
    
    return possibilities.possibilities.reduce((best, current) => {
      const bestScore = this.calculateTotalScore(best);
      const currentScore = this.calculateTotalScore(current);
      return currentScore > bestScore ? current : best;
    });
  }
  
  private calculateTotalScore(possibility: GeneratedPossibility): number {
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
  
  private generateAlternatives(
    current: GeneratedPossibility | null,
    possibilities: PossibilitySet
  ): AlternativeComparison[] {
    if (!current) return [];
    
    const alternatives: AlternativeComparison[] = [];
    
    // Compare with other possibilities
    for (const possibility of possibilities.possibilities) {
      if (possibility.id === current.id) continue;
      
      const comparison = this.comparePossibilities(current, possibility);
      alternatives.push(comparison);
    }
    
    // Sort by relevance
    return alternatives.sort((a, b) => {
      const aScore = a.advantages.length - a.disadvantages.length;
      const bScore = b.advantages.length - b.disadvantages.length;
      return bScore - aScore;
    }).slice(0, 3); // Top 3 alternatives
  }
  
  private comparePossibilities(current: GeneratedPossibility, alternative: GeneratedPossibility): AlternativeComparison {
    const advantages: string[] = [];
    const disadvantages: string[] = [];
    
    // Compare scores
    if (alternative.scores.feasibility > current.scores.feasibility) {
      advantages.push(`Higher feasibility (${(alternative.scores.feasibility * 100).toFixed(0)}% vs ${(current.scores.feasibility * 100).toFixed(0)}%)`);
    } else if (alternative.scores.feasibility < current.scores.feasibility) {
      disadvantages.push(`Lower feasibility (${(alternative.scores.feasibility * 100).toFixed(0)}% vs ${(current.scores.feasibility * 100).toFixed(0)}%)`);
    }
    
    if (alternative.scores.impact > current.scores.impact) {
      advantages.push(`Higher impact potential (${(alternative.scores.impact * 100).toFixed(0)}% vs ${(current.scores.impact * 100).toFixed(0)}%)`);
    } else if (alternative.scores.impact < current.scores.impact) {
      disadvantages.push(`Lower impact potential (${(alternative.scores.impact * 100).toFixed(0)}% vs ${(current.scores.impact * 100).toFixed(0)}%)`);
    }
    
    if (alternative.scores.cost > current.scores.cost) {
      advantages.push(`Better cost efficiency (${(alternative.scores.cost * 100).toFixed(0)}% vs ${(current.scores.cost * 100).toFixed(0)}%)`);
    } else if (alternative.scores.cost < current.scores.cost) {
      disadvantages.push(`Higher cost (${(alternative.scores.cost * 100).toFixed(0)}% vs ${(current.scores.cost * 100).toFixed(0)}%)`);
    }
    
    if (alternative.innovation > current.innovation) {
      advantages.push(`More innovative approach (${(alternative.innovation * 100).toFixed(0)}% vs ${(current.innovation * 100).toFixed(0)}%)`);
    } else if (alternative.innovation < current.innovation) {
      disadvantages.push(`Less innovative (${(alternative.innovation * 100).toFixed(0)}% vs ${(current.innovation * 100).toFixed(0)}%)`);
    }
    
    if (alternative.scores.maturity > current.scores.maturity) {
      advantages.push(`More mature solution (${(alternative.scores.maturity * 100).toFixed(0)}% vs ${(current.scores.maturity * 100).toFixed(0)}%)`);
    } else if (alternative.scores.maturity < current.scores.maturity) {
      disadvantages.push(`Less mature (${(alternative.scores.maturity * 100).toFixed(0)}% vs ${(current.scores.maturity * 100).toFixed(0)}%)`);
    }
    
    // Category-specific comparisons
    if (alternative.category !== current.category) {
      advantages.push(`Different approach: ${alternative.category} vs ${current.category}`);
    }
    
    const whenToChoose = this.defineWhenToChoose(alternative, current);
    
    return {
      possibility: alternative,
      advantages,
      disadvantages,
      whenToChoose,
    };
  }
  
  private defineWhenToChoose(alternative: GeneratedPossibility, current: GeneratedPossibility): string {
    const reasons: string[] = [];
    
    if (alternative.estimatedComplexity !== current.estimatedComplexity) {
      reasons.push(`When ${alternative.estimatedComplexity} complexity is preferred over ${current.estimatedComplexity}`);
    }
    
    if (alternative.estimatedCost !== current.estimatedCost) {
      reasons.push(`When budget allows for ${alternative.estimatedCost} vs ${current.estimatedCost}`);
    }
    
    if (alternative.innovation > current.innovation + 0.2) {
      reasons.push('When innovation is prioritized over stability');
    }
    
    if (alternative.scores.maturity > current.scores.maturity + 0.2) {
      reasons.push('When maturity and reliability are critical');
    }
    
    if (reasons.length === 0) {
      reasons.push('As an alternative with similar characteristics');
    }
    
    return reasons.join('; ');
  }
  
  private loadValidatedExperiences(experiences: any[]): ValidatedExperience[] {
    // In a real implementation, this would load from a database
    // For now, return empty array or mock experiences
    return experiences.map((exp, index) => ({
      id: `exp-${index}`,
      context: exp.context || 'Unknown context',
      outcome: exp.outcome || 'partial',
      lessons: exp.lessons || ['Lesson learned'],
      applicability: exp.applicability || 0.5,
    }));
  }
  
  private identifyImprovements(
    current: GeneratedPossibility | null,
    alternatives: AlternativeComparison[],
    experiences: ValidatedExperience[]
  ): Improvement[] {
    const improvements: Improvement[] = [];
    let id = 0;
    
    if (!current) return improvements;
    
    // Improvements from alternatives
    for (const alternative of alternatives) {
      for (const advantage of alternative.advantages) {
        if (advantage.match(/(?:higher|better|more)/i)) {
          improvements.push({
            id: `imp-${id++}`,
            description: `Adopt from ${alternative.possibility.name}: ${advantage}`,
            impact: 'medium',
            effort: 'medium',
            reasoning: `Alternative shows better performance in this aspect`,
          });
        }
      }
    }
    
    // Improvements from experiences
    for (const experience of experiences) {
      if (experience.outcome === 'success') {
        for (const lesson of experience.lessons) {
          improvements.push({
            id: `imp-${id++}`,
            description: `From past success: ${lesson}`,
            impact: 'high',
            effort: 'low',
            reasoning: 'Proven successful in similar context',
          });
        }
      } else if (experience.outcome === 'failure') {
        for (const lesson of experience.lessons) {
          improvements.push({
            id: `imp-${id++}`,
            description: `Avoid past failure: ${lesson}`,
            impact: 'high',
            effort: 'low',
            reasoning: 'Prevents repeating known mistakes',
          });
        }
      }
    }
    
    // General improvements
    if (current.scores.evidenceQuality < 0.7) {
      improvements.push({
        id: `imp-${id++}`,
        description: 'Gather more evidence for approach effectiveness',
        impact: 'high',
        effort: 'medium',
        reasoning: 'Low evidence quality reduces confidence',
      });
    }
    
    if (current.scores.privacy < 0.8) {
      improvements.push({
        id: `imp-${id++}`,
        description: 'Strengthen privacy protections',
        impact: 'high',
        effort: 'medium',
        reasoning: 'Privacy is critical for user trust',
      });
    }
    
    if (current.scores.security < 0.8) {
      improvements.push({
        id: `imp-${id++}`,
        description: 'Enhance security measures',
        impact: 'critical',
        effort: 'high',
        reasoning: 'Security vulnerabilities pose significant risk',
      });
    }
    
    return improvements.slice(0, 10); // Limit to top 10 improvements
  }
  
  private identifyAssumptionsToRevisit(
    current: GeneratedPossibility | null,
    improvements: Improvement[]
  ): string[] {
    const assumptions: string[] = [];
    
    if (!current) return assumptions;
    
    // Assumptions from current possibility
    if (current.estimatedCost === 'free') {
      assumptions.push('Free tools remain available and sustainable');
    }
    
    if (current.estimatedComplexity === 'low') {
      assumptions.push('Simple solution meets all requirements');
    }
    
    if (current.innovation > 0.7) {
      assumptions.push('Novel approach is technically feasible');
    }
    
    // Assumptions from improvements
    for (const improvement of improvements) {
      if (improvement.impact === 'critical' || improvement.impact === 'high') {
        assumptions.push(`Related to: ${improvement.description}`);
      }
    }
    
    return assumptions.slice(0, 5);
  }
  
  private identifyNewerCapabilities(current: GeneratedPossibility | null): string[] {
    // In a real implementation, this would query the capability registry
    // for newer or updated capabilities
    const newerCapabilities: string[] = [];
    
    if (!current) return newerCapabilities;
    
    // Mock: suggest looking for updated versions
    for (const capability of current.capabilities) {
      newerCapabilities.push(`Check for updates to: ${capability.name}`);
    }
    
    // Suggest exploring new categories
    if (current.category === 'simplest') {
      newerCapabilities.push('Explore low-code/no-code alternatives');
    }
    
    if (current.estimatedComplexity === 'high') {
      newerCapabilities.push('Research newer, simpler alternatives');
    }
    
    return newerCapabilities.slice(0, 5);
  }
  
  private decideEvolution(
    current: GeneratedPossibility | null,
    improvements: Improvement[],
    alternatives: AlternativeComparison[]
  ): { shouldEvolve: boolean; evolutionPriority: 'low' | 'medium' | 'high'; reasoning: string } {
    if (!current) {
      return {
        shouldEvolve: false,
        evolutionPriority: 'low',
        reasoning: 'No current possibility to evolve',
      };
    }
    
    const criticalImprovements = improvements.filter(i => i.impact === 'critical').length;
    const highImpactImprovements = improvements.filter(i => i.impact === 'high').length;
    const betterAlternatives = alternatives.filter(a => a.advantages.length > a.disadvantages.length).length;
    
    if (criticalImprovements > 0) {
      return {
        shouldEvolve: true,
        evolutionPriority: 'high',
        reasoning: `${criticalImprovements} critical improvements identified that must be addressed`,
      };
    }
    
    if (highImpactImprovements >= 3 || betterAlternatives >= 2) {
      return {
        shouldEvolve: true,
        evolutionPriority: 'high',
        reasoning: `Multiple high-impact improvements (${highImpactImprovements}) and better alternatives (${betterAlternatives}) available`,
      };
    }
    
    if (highImpactImprovements >= 1 || betterAlternatives >= 1) {
      return {
        shouldEvolve: true,
        evolutionPriority: 'medium',
        reasoning: `Some improvements available (${highImpactImprovements} high-impact, ${betterAlternatives} better alternatives)`,
      };
    }
    
    if (improvements.length > 0) {
      return {
        shouldEvolve: true,
        evolutionPriority: 'low',
        reasoning: `Minor improvements possible (${improvements.length} total)`,
      };
    }
    
    return {
      shouldEvolve: false,
      evolutionPriority: 'low',
      reasoning: 'Current solution is well-optimized',
    };
  }
  
  private calculateConfidence(metrics: {
    hasCurrentPossibility: boolean;
    hasAlternatives: boolean;
    hasExperiences: boolean;
    hasImprovements: boolean;
  }): number {
    let confidence = 0.4;
    
    if (metrics.hasCurrentPossibility) confidence += 0.2;
    if (metrics.hasAlternatives) confidence += 0.15;
    if (metrics.hasExperiences) confidence += 0.15;
    if (metrics.hasImprovements) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
}