// 7. IMPACT INTELLIGENCE - Evaluates effects across dimensions

import { ProjectConcept, ImpactAnalysis, ImpactDimension } from './types';

export class ImpactEngine {
  analyzeImpact(projectConcept: ProjectConcept): ImpactAnalysis {
    const dimensions = this.analyzeAllDimensions(projectConcept);
    const overallPositive = this.calculateOverallPositive(dimensions);
    const overallNegative = this.calculateOverallNegative(dimensions);
    const overallUncertainty = this.calculateOverallUncertainty(dimensions);
    const summary = this.generateSummary(dimensions, overallPositive, overallNegative);
    const confidence = this.calculateConfidence(dimensions);
    
    return {
      dimensions,
      overallPositive,
      overallNegative,
      overallUncertainty,
      summary,
      confidence,
    };
  }
  
  private analyzeAllDimensions(projectConcept: ProjectConcept): ImpactAnalysis['dimensions'] {
    return [
      this.analyzeHumanImpact(projectConcept),
      this.analyzeCommunityImpact(projectConcept),
      this.analyzeEconomicImpact(projectConcept),
      this.analyzeEnvironmentalImpact(projectConcept),
      this.analyzeResourceImpact(projectConcept),
      this.analyzeTechnologicalImpact(projectConcept),
      this.analyzeLongTermImpact(projectConcept),
    ];
  }
  
  private analyzeHumanImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.problemSolved.match(/(?:food|hunger|nutrition)/i)) {
      positiveEffects.push('Improves food security and nutrition');
      positiveEffects.push('Reduces hunger in target population');
    }
    
    if (projectConcept.problemSolved.match(/(?:health|medical|healthcare)/i)) {
      positiveEffects.push('Improves health outcomes');
      positiveEffects.push('Increases access to healthcare');
    }
    
    if (projectConcept.problemSolved.match(/(?:education|learn|school)/i)) {
      positiveEffects.push('Enhances educational opportunities');
      positiveEffects.push('Improves learning outcomes');
    }
    
    if (projectConcept.users.some(u => u.match(/(?:children|elderly|vulnerable)/i))) {
      positiveEffects.push('Benefits vulnerable populations');
      positiveEffects.push('Reduces inequality');
    }
    
    if (projectConcept.accessibility.length > 0) {
      positiveEffects.push('Improves accessibility for users with disabilities');
    }
    
    // Universal positive
    positiveEffects.push('Solves a real human need');
    positiveEffects.push('Provides value to end users');
    
    // Negative effects
    if (projectConcept.estimatedComplexity === 'high') {
      negativeEffects.push('May require significant user behavior change');
    }
    
    if (projectConcept.users.some(u => u.match(/(?:beginner|non-technical)/i))) {
      negativeEffects.push('May be difficult for non-technical users to adopt');
    }
    
    if (projectConcept.requiredCapabilities.some(c => c.cost.type === 'paid')) {
      negativeEffects.push('Cost may limit access for some users');
    }
    
    // Uncertainty
    if (!projectConcept.expectedOutputs.some(o => o.match(/(?:metric|measure|track|analytics)/i))) {
      uncertainty.push('Impact measurement not clearly defined');
    }
    
    if (!projectConcept.users.length) {
      uncertainty.push('User base not well defined');
    }
    
    // Evidence
    if (projectConcept.successConditions && projectConcept.successConditions.length > 0) {
      evidence.push('Success criteria defined');
    }
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'human',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeCommunityImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.problemSolved.match(/(?:community|social|neighbor)/i)) {
      positiveEffects.push('Strengthens community bonds');
      positiveEffects.push('Fosters collaboration and cooperation');
    }
    
    if (projectConcept.category === 'community') {
      positiveEffects.push('Empowers community self-sufficiency');
      positiveEffects.push('Builds local capacity and skills');
    }
    
    if (projectConcept.users.length > 3) {
      positiveEffects.push('Benefits multiple stakeholder groups');
      positiveEffects.push('Creates shared value');
    }
    
    // Negative effects
    if (projectConcept.estimatedComplexity === 'high') {
      negativeEffects.push('May create digital divide within community');
    }
    
    if (projectConcept.problemSolved.match(/(?:data|track|monitor)/i)) {
      negativeEffects.push('Privacy concerns within community');
    }
    
    // Uncertainty
    if (!projectConcept.expectedOutputs.some(o => o.match(/(?:community|engagement|participation)/i))) {
      uncertainty.push('Community engagement strategy unclear');
    }
    
    // Evidence
    if (projectConcept.users.some(u => u.match(/(?:community|local|neighborhood)/i))) {
      evidence.push('Community-focused design');
    }
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'community',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeEconomicImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.requiredResources.standard.estimatedCost === 'free') {
      positiveEffects.push('No licensing or subscription costs');
      positiveEffects.push('Reduces economic barriers to access');
    }
    
    if (projectConcept.problemSolved.match(/(?:job|employment|income|economic)/i)) {
      positiveEffects.push('Creates economic opportunities');
      positiveEffects.push('Generates income or reduces costs');
    }
    
    if (projectConcept.category === 'open-source') {
      positiveEffects.push('Free and open access maximizes economic benefit');
    }
    
    // Negative effects
    if (projectConcept.requiredResources.standard.estimatedCost === 'paid') {
      negativeEffects.push('Ongoing operational costs');
      negativeEffects.push('May require funding or revenue model');
    }
    
    if (projectConcept.estimatedComplexity === 'high') {
      negativeEffects.push('High initial development cost');
      negativeEffects.push('Significant maintenance investment required');
    }
    
    // Uncertainty
    if (projectConcept.estimatedCost === 'freemium') {
      uncertainty.push('Long-term cost sustainability uncertain');
    }
    
    // Evidence
    if (projectConcept.requiredResources.standard.estimatedCost === 'free') {
      evidence.push('Zero-cost solution');
    }
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'economic',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeEnvironmentalImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.problemSolved.match(/(?:environment|climate|sustainability|waste|reduce)/i)) {
      positiveEffects.push('Directly addresses environmental concern');
      positiveEffects.push('Promotes sustainability');
    }
    
    if (projectConcept.requiredResources.standard.estimatedCost === 'free') {
      positiveEffects.push('Digital solution reduces physical resource consumption');
    }
    
    if (projectConcept.requiredResources.minimal.ram < 4096) {
      positiveEffects.push('Low resource requirements reduce energy consumption');
    }
    
    // Negative effects
    if (projectConcept.requiredResources.accelerated.ram > 16384) {
      negativeEffects.push('High resource consumption');
      negativeEffects.push('Significant energy usage');
    }
    
    if (projectConcept.estimatedComplexity === 'high') {
      negativeEffects.push('Requires significant computing infrastructure');
    }
    
    // Uncertainty
    uncertainty.push('Actual energy consumption depends on deployment');
    uncertainty.push('Hardware lifecycle impact unknown');
    
    // Evidence
    if (projectConcept.requiredResources.standard.estimatedCost === 'free') {
      evidence.push('Low-resource digital solution');
    }
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'environmental',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeResourceImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.requiredResources.minimal.ram < 2048) {
      positiveEffects.push('Minimal RAM requirement');
      positiveEffects.push('Accessible on low-end devices');
    }
    
    if (projectConcept.requiredResources.minimal.storage < 5120) {
      positiveEffects.push('Minimal storage footprint');
    }
    
    if (projectConcept.requiredResources.standard.network === 'intermittent') {
      positiveEffects.push('Works with unreliable internet');
      positiveEffects.push('Offline-capable design');
    }
    
    // Negative effects
    if (projectConcept.requiredResources.standard.ram > 8192) {
      negativeEffects.push('High RAM requirement limits accessibility');
    }
    
    if (projectConcept.requiredResources.standard.storage > 20480) {
      negativeEffects.push('Large storage requirement');
    }
    
    // Uncertainty
    uncertainty.push('Actual resource usage may vary in production');
    
    // Evidence
    evidence.push(`Minimal: ${projectConcept.requiredResources.minimal.ram}MB RAM`);
    evidence.push(`Standard: ${projectConcept.requiredResources.standard.ram}MB RAM`);
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'resource',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeTechnologicalImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.estimatedComplexity === 'high') {
      positiveEffects.push('Uses advanced, modern technology');
      positiveEffects.push('Pushes technological boundaries');
    }
    
    if (projectConcept.category === 'innovative') {
      positiveEffects.push('Novel technological approach');
      positiveEffects.push('Potential for technological advancement');
    }
    
    if (projectConcept.requiredCapabilities.some(c => c.license.includes('open') || c.license.includes('MIT'))) {
      positiveEffects.push('Open and transparent technology stack');
    }
    
    // Negative effects
    if (projectConcept.estimatedComplexity === 'high') {
      negativeEffects.push('Technically complex to maintain');
      negativeEffects.push('Requires specialized expertise');
    }
    
    if (projectConcept.requiredCapabilities.length > 5) {
      negativeEffects.push('Many dependencies increase complexity');
    }
    
    // Uncertainty
    if (projectConcept.innovation > 0.7) {
      uncertainty.push('Novel technology may have unknown issues');
    }
    
    // Evidence
    evidence.push(`${projectConcept.requiredCapabilities.length} capabilities integrated`);
    evidence.push(`Complexity: ${projectConcept.estimatedComplexity}`);
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'technological',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private analyzeLongTermImpact(projectConcept: ProjectConcept): ImpactDimension {
    const positiveEffects: string[] = [];
    const negativeEffects: string[] = [];
    const uncertainty: string[] = [];
    const evidence: string[] = [];
    
    // Positive effects
    if (projectConcept.category === 'long-term') {
      positiveEffects.push('Designed for long-term sustainability');
      positiveEffects.push('Scalable architecture supports growth');
    }
    
    if (projectConcept.maintenance.longTermViability > 0.7) {
      positiveEffects.push('High long-term viability');
      positiveEffects.push('Sustainable maintenance model');
    }
    
    if (projectConcept.implementationStages.some(s => s.name.match(/(?:scale|grow|expand)/i))) {
      positiveEffects.push('Planned for future growth and evolution');
    }
    
    // Negative effects
    if (projectConcept.maintenance.maintenanceFrequency === 'daily') {
      negativeEffects.push('Requires continuous maintenance effort');
    }
    
    if (projectConcept.maintenance.maintenanceComplexity === 'high') {
      negativeEffects.push('High maintenance burden');
    }
    
    // Uncertainty
    uncertainty.push('Long-term technology evolution uncertain');
    uncertainty.push('Future user needs may change');
    
    // Evidence
    if (projectConcept.maintenance.longTermViability > 0.7) {
      evidence.push(`High viability score: ${(projectConcept.maintenance.longTermViability * 100).toFixed(0)}%`);
    }
    
    const confidence = this.calculateDimensionConfidence({
      hasPositiveEffects: positiveEffects.length > 0,
      hasNegativeEffects: negativeEffects.length > 0,
      hasEvidence: evidence.length > 0,
      uncertaintyCount: uncertainty.length,
    });
    
    return {
      domain: 'long-term',
      positiveEffects,
      negativeEffects,
      uncertainty,
      evidence,
      confidence,
    };
  }
  
  private calculateOverallPositive(dimensions: ImpactAnalysis['dimensions']): number {
    const scores = dimensions.map(d => {
      const positiveScore = d.positiveEffects.length / 10; // Normalize
      const confidenceWeight = d.confidence;
      return positiveScore * confidenceWeight;
    });
    
    return Math.min(1, scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
  
  private calculateOverallNegative(dimensions: ImpactAnalysis['dimensions']): number {
    const scores = dimensions.map(d => {
      const negativeScore = d.negativeEffects.length / 10; // Normalize
      const confidenceWeight = d.confidence;
      return negativeScore * confidenceWeight;
    });
    
    return Math.min(1, scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
  
  private calculateOverallUncertainty(dimensions: ImpactAnalysis['dimensions']): number {
    const scores = dimensions.map(d => {
      return d.uncertainty.length / 5; // Normalize
    });
    
    return Math.min(1, scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
  
  private generateSummary(
    dimensions: ImpactAnalysis['dimensions'],
    positive: number,
    negative: number
  ): string {
    const netImpact = positive - negative;
    const strongestPositive = dimensions
      .filter(d => d.positiveEffects.length > 0)
      .sort((a, b) => b.positiveEffects.length - a.positiveEffects.length)[0];
    
    const strongestNegative = dimensions
      .filter(d => d.negativeEffects.length > 0)
      .sort((a, b) => b.negativeEffects.length - a.negativeEffects.length)[0];
    
    let summary = `Overall impact: ${netImpact > 0 ? 'positive' : netImpact < 0 ? 'negative' : 'neutral'} `;
    summary += `(positive: ${(positive * 100).toFixed(0)}%, negative: ${(negative * 100).toFixed(0)}%). `;
    
    if (strongestPositive) {
      summary += `Primary benefit: ${strongestPositive.domain} impact. `;
    }
    
    if (strongestNegative) {
      summary += `Main concern: ${strongestNegative.domain} impact.`;
    }
    
    return summary;
  }
  
  private calculateConfidence(dimensions: ImpactAnalysis['dimensions']): number {
    const confidences = dimensions.map(d => d.confidence);
    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }
  
  private calculateDimensionConfidence(metrics: {
    hasPositiveEffects: boolean;
    hasNegativeEffects: boolean;
    hasEvidence: boolean;
    uncertaintyCount: number;
  }): number {
    let confidence = 0.5;
    
    if (metrics.hasPositiveEffects) confidence += 0.15;
    if (metrics.hasNegativeEffects) confidence += 0.1;
    if (metrics.hasEvidence) confidence += 0.15;
    
    // Reduce for uncertainty
    confidence -= metrics.uncertaintyCount * 0.05;
    
    return Math.max(0, Math.min(1, confidence));
  }
}