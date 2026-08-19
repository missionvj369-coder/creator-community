// 2. UNDERSTANDING - Transforms observation into structured problem

import { ObservedIntention, Understanding, SubProblem } from './types';

export class UnderstandingEngine {
  understand(observed: ObservedIntention): Understanding {
    const rootNeed = this.identifyRootNeed(observed);
    const surfaceRequest = observed.explicitRequest;
    const desiredOutcome = observed.desiredOutcome;
    const constraints = observed.constraints;
    const stakeholders = this.identifyStakeholders(observed);
    const dependencies = this.identifyDependencies(observed);
    const risks = this.identifyRisks(observed);
    const successConditions = this.defineSuccessConditions(observed, rootNeed);
    const subProblems = this.decomposeProblem(observed, rootNeed);
    
    const confidence = this.calculateConfidence({
      hasClearRootNeed: rootNeed !== 'unknown',
      hasStakeholders: stakeholders.length > 0,
      hasSuccessConditions: successConditions.length > 0,
      missingInfoCount: observed.missingInformation.length,
    });
    
    return {
      rootNeed,
      surfaceRequest,
      desiredOutcome,
      constraints,
      stakeholders,
      dependencies,
      risks,
      successConditions,
      subProblems,
      confidence,
    };
  }
  
  private identifyRootNeed(observed: ObservedIntention): string {
    // Analyze the core need behind the request
    const text = observed.explicitRequest.toLowerCase();
    
    // Map surface requests to root needs
    const needMappings: Array<{ pattern: RegExp; need: string }> = [
      { pattern: /food|hunger|nutrition|meal/i, need: 'food access and nutrition security' },
      { pattern: /water|drink|hydration/i, need: 'clean water access' },
      { pattern: /shelter|housing|home|homeless/i, need: 'safe and affordable housing' },
      { pattern: /education|learn|school|teach|student/i, need: 'accessible education' },
      { pattern: /health|medical|healthcare|disease|illness/i, need: 'healthcare access' },
      { pattern: /transport|travel|commute|mobility/i, need: 'affordable transportation' },
      { pattern: /job|employment|work|career|income/i, need: 'employment and economic opportunity' },
      { pattern: /community|neighbor|social|connect/i, need: 'community connection and social support' },
      { pattern: /environment|climate|pollution|sustainability/i, need: 'environmental sustainability' },
      { pattern: /communication|language|translate|understand/i, need: 'effective communication' },
      { pattern: /waste|reduce|recycle|sustainability/i, need: 'resource efficiency and waste reduction' },
      { pattern: /access|reach|available|obtain/i, need: 'improved access to resources or services' },
    ];
    
    for (const { pattern, need } of needMappings) {
      if (pattern.test(text)) {
        return need;
      }
    }
    
    // If no pattern matches, extract from context
    if (observed.implicitObjective) {
      return observed.implicitObjective;
    }
    
    return 'unknown - requires clarification';
  }
  
  private identifyStakeholders(observed: ObservedIntention): string[] {
    const stakeholders: string[] = [];
    const text = observed.explicitRequest.toLowerCase();
    
    // Direct stakeholders mentioned
    const stakeholderPatterns = [
      { pattern: /for\s+(\w+)/gi, type: 'primary' },
      { pattern: /help\s+(\w+)/gi, type: 'primary' },
      { pattern: /by\s+(\w+)/gi, type: 'implementer' },
      { pattern: /with\s+(\w+)/gi, type: 'collaborator' },
    ];
    
    for (const { pattern } of stakeholderPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const entity = match[1].toLowerCase();
        if (!stakeholders.includes(entity) && entity.length > 2) {
          stakeholders.push(entity);
        }
      }
    }
    
    // Add entities from observation
    for (const entity of observed.entities) {
      if (!stakeholders.includes(entity)) {
        stakeholders.push(entity);
      }
    }
    
    // Infer additional stakeholders based on context
    if (text.match(/community/)) {
      stakeholders.push('community members');
      stakeholders.push('community leaders');
    }
    
    if (text.match(/food|waste/)) {
      stakeholders.push('food suppliers');
      stakeholders.push('waste management');
    }
    
    if (text.match(/children|kids|youth/)) {
      stakeholders.push('parents');
      stakeholders.push('educators');
    }
    
    if (text.match(/elderly|seniors|aged/)) {
      stakeholders.push('caregivers');
      stakeholders.push('healthcare providers');
    }
    
    return [...new Set(stakeholders)];
  }
  
  private identifyDependencies(observed: ObservedIntention): string[] {
    const dependencies: string[] = [];
    const text = observed.explicitRequest.toLowerCase();
    
    // Technical dependencies
    if (text.match(/(?:app|website|online|digital|software)/i)) {
      dependencies.push('software development');
      dependencies.push('hosting infrastructure');
    }
    
    if (text.match(/(?:database|data|store|track)/i)) {
      dependencies.push('data storage solution');
    }
    
    if (text.match(/(?:payment|money|funding|budget)/i)) {
      dependencies.push('funding source');
    }
    
    if (text.match(/(?:network|internet|connectivity)/i)) {
      dependencies.push('network infrastructure');
    }
    
    // Human dependencies
    if (text.match(/(?:volunteer|staff|team|people)/i)) {
      dependencies.push('human resources');
    }
    
    if (text.match(/(?:training|learn|skill|knowledge)/i)) {
      dependencies.push('training and education');
    }
    
    // Resource dependencies
    if (text.match(/(?:food|water|supply|resource)/i)) {
      dependencies.push('resource supply chain');
    }
    
    if (text.match(/(?:location|space|place|venue)/i)) {
      dependencies.push('physical location');
    }
    
    // Regulatory dependencies
    if (text.match(/(?:legal|permit|license|regulation|compliance)/i)) {
      dependencies.push('legal compliance');
    }
    
    return dependencies;
  }
  
  private identifyRisks(observed: ObservedIntention): string[] {
    const risks: string[] = [];
    const text = observed.explicitRequest.toLowerCase();
    
    // Common risk factors
    if (text.match(/(?:cheap|free|low cost|budget)/i)) {
      risks.push('sustainability risk: low-cost solutions may lack long-term viability');
    }
    
    if (text.match(/(?:quick|fast|rapid|immediate)/i)) {
      risks.push('quality risk: rushed implementation may have quality issues');
    }
    
    if (text.match(/(?:community|local|neighborhood)/i)) {
      risks.push('adoption risk: community buy-in may be difficult');
    }
    
    if (text.match(/(?:technology|digital|online|app)/i)) {
      risks.push('digital divide: may exclude those without technology access');
      risks.push('technical complexity: requires ongoing maintenance');
    }
    
    if (text.match(/(?:scale|large|many|hundreds|thousands)/i)) {
      risks.push('scalability risk: solution may not scale effectively');
    }
    
    if (text.match(/(?:data|personal|private|information)/i)) {
      risks.push('privacy risk: handling sensitive data requires care');
    }
    
    if (observed.urgency === 'high') {
      risks.push('completeness risk: high urgency may lead to incomplete solution');
    }
    
    if (observed.missingInformation.length > 3) {
      risks.push('uncertainty risk: significant information gaps increase project risk');
    }
    
    return risks;
  }
  
  private defineSuccessConditions(observed: ObservedIntention, rootNeed: string): string[] {
    const conditions: string[] = [];
    
    // Universal success conditions
    conditions.push(`Addresses root need: ${rootNeed}`);
    conditions.push('Meets stated constraints and requirements');
    conditions.push('Usable by intended stakeholders');
    
    // Context-specific conditions
    const text = observed.explicitRequest.toLowerCase();
    
    if (text.match(/(?:reduce|decrease|lower)/i)) {
      conditions.push('Demonstrates measurable reduction in target metric');
    }
    
    if (text.match(/(?:increase|improve|enhance|grow)/i)) {
      conditions.push('Shows measurable improvement in target metric');
    }
    
    if (text.match(/(?:access|reach|available)/i)) {
      conditions.push('Increases access for target population');
    }
    
    if (text.match(/(?:community|local)/i)) {
      conditions.push('Achieves community adoption and engagement');
    }
    
    if (text.match(/(?:sustainable|long-term|ongoing)/i)) {
      conditions.push('Demonstrates long-term sustainability');
    }
    
    if (text.match(/(?:cost|budget|affordable)/i)) {
      conditions.push('Operates within budget constraints');
    }
    
    if (text.match(/(?:simple|easy|user-friendly)/i)) {
      conditions.push('Easy to use and understand');
    }
    
    return conditions;
  }
  
  private decomposeProblem(observed: ObservedIntention, rootNeed: string): SubProblem[] {
    const subProblems: SubProblem[] = [];
    const text = observed.explicitRequest.toLowerCase();
    let order = 0;
    
    // Standard problem decomposition
    subProblems.push({
      id: 'sp-1',
      description: 'Understand user needs and context',
      priority: 'critical',
      dependencies: [],
      estimatedComplexity: 'low',
    });
    order++;
    
    // Add domain-specific sub-problems
    if (text.match(/(?:app|website|software|digital|online)/i)) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Design and develop software solution',
        priority: 'high',
        dependencies: [`sp-${order}`],
        estimatedComplexity: 'high',
      });
      order++;
    }
    
    if (text.match(/(?:data|track|monitor|measure)/i)) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Implement data collection and tracking',
        priority: 'high',
        dependencies: [`sp-${order}`],
        estimatedComplexity: 'medium',
      });
      order++;
    }
    
    if (text.match(/(?:community|people|users|stakeholders)/i)) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Engage and onboard stakeholders',
        priority: 'high',
        dependencies: [`sp-${order}`],
        estimatedComplexity: 'medium',
      });
      order++;
    }
    
    if (text.match(/(?:sustainable|ongoing|long-term|maintain)/i)) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Ensure long-term sustainability and maintenance',
        priority: 'medium',
        dependencies: [`sp-${order - 1}`],
        estimatedComplexity: 'high',
      });
      order++;
    }
    
    if (text.match(/(?:scale|grow|expand|large)/i)) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Plan for scalability and growth',
        priority: 'medium',
        dependencies: [`sp-${order - 1}`],
        estimatedComplexity: 'high',
      });
      order++;
    }
    
    // Ensure we have at least 3 sub-problems
    if (subProblems.length < 3) {
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Develop implementation plan',
        priority: 'high',
        dependencies: [`sp-${order}`],
        estimatedComplexity: 'medium',
      });
      order++;
      
      subProblems.push({
        id: `sp-${order + 1}`,
        description: 'Test and validate solution',
        priority: 'high',
        dependencies: [`sp-${order}`],
        estimatedComplexity: 'medium',
      });
    }
    
    return subProblems;
  }
  
  private calculateConfidence(metrics: {
    hasClearRootNeed: boolean;
    hasStakeholders: boolean;
    hasSuccessConditions: boolean;
    missingInfoCount: number;
  }): number {
    let confidence = 0.5;
    
    if (metrics.hasClearRootNeed) confidence += 0.2;
    if (metrics.hasStakeholders) confidence += 0.15;
    if (metrics.hasSuccessConditions) confidence += 0.15;
    
    // Reduce for missing information
    confidence -= metrics.missingInfoCount * 0.05;
    
    return Math.max(0, Math.min(1, confidence));
  }
}