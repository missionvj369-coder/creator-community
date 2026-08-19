// 1. OBSERVER - Extracts facts and signals from intention

import { Intention, ObservedIntention } from './types';

export class Observer {
  observe(intention: Intention): ObservedIntention {
    const text = intention.raw.toLowerCase();
    const words = intention.raw.split(/\s+/);
    
    // Extract explicit request
    const explicitRequest = intention.raw;
    
    // Extract implicit objective
    const implicitObjective = this.extractImplicitObjective(text);
    
    // Extract entities (nouns and proper nouns)
    const entities = this.extractEntities(words);
    
    // Extract constraints
    const constraints = this.extractConstraints(text, intention.context?.constraints);
    
    // Extract available resources
    const availableResources = intention.context?.resources || this.inferResources(text) || [];
    
    // Identify missing information
    const missingInformation = this.identifyMissingInformation(text);
    
    // Extract environment context
    const environment = intention.context?.location ? [intention.context.location] : this.inferEnvironment(text);
    
    // Determine urgency
    const urgency = this.determineUrgency(text);
    
    // Extract desired outcome
    const desiredOutcome = this.extractDesiredOutcome(text);
    
    // Classify facts, assumptions, and unknowns
    const { facts, assumptions, unknowns } = this.classifyInformation(text, words);
    
    // Calculate confidence based on completeness
    const confidence = this.calculateConfidence({
      hasExplicitRequest: explicitRequest.length > 0,
      hasConstraints: constraints.length > 0,
      hasResources: availableResources.length > 0,
      missingInfoCount: missingInformation.length,
      unknownsCount: unknowns.length,
    });
    
    return {
      explicitRequest,
      implicitObjective,
      entities,
      constraints,
      availableResources,
      missingInformation,
      environment,
      urgency,
      desiredOutcome,
      facts,
      assumptions,
      unknowns,
      confidence,
    };
  }
  
  private extractImplicitObjective(text: string): string | undefined {
    // Look for implicit goals
    const implicitPatterns = [
      { pattern: /(?:to help|helping|for|so that|in order to)\s+(\w+(?:\s+\w+){0,5})/i, weight: 0.8 },
      { pattern: /(?:need|want|looking for|trying to)\s+(\w+(?:\s+\w+){0,5})/i, weight: 0.6 },
    ];
    
    for (const { pattern, weight } of implicitPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  private extractEntities(words: string[]): string[] {
    const entities: string[] = [];
    const commonEntities = [
      'community', 'people', 'users', 'children', 'elderly', 'students', 'teachers',
      'farmers', 'businesses', 'families', 'patients', 'doctors', 'developers',
      'food', 'water', 'energy', 'transportation', 'education', 'healthcare',
      'local', 'global', 'urban', 'rural', 'online', 'offline',
    ];
    
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (commonEntities.includes(cleanWord)) {
        entities.push(cleanWord);
      }
    }
    
    return [...new Set(entities)];
  }
  
  private extractConstraints(text: string, explicitConstraints?: string[]): string[] {
    const constraints: string[] = [];
    
    // Add explicit constraints
    if (explicitConstraints) {
      constraints.push(...explicitConstraints);
    }
    
    // Extract implicit constraints
    const constraintPatterns = [
      /(?:cheap|low cost|budget|affordable|free)/i,
      /(?:quick|fast|rapid|immediate|urgent)/i,
      /(?:simple|easy|straightforward)/i,
      /(?:small|limited|minimal)\s+(?:resources?|budget|time)/i,
      /(?:no|without|without using)\s+(\w+)/i,
      /(?:must|should|need to|required to)\s+(\w+(?:\s+\w+){0,3})/i,
    ];
    
    for (const pattern of constraintPatterns) {
      const match = text.match(pattern);
      if (match) {
        constraints.push(match[0].trim());
      }
    }
    
    return [...new Set(constraints)];
  }
  
  private inferResources(text: string): string[] {
    const resources: string[] = [];
    
    const resourcePatterns = [
      /(?:using|with|using only|have access to)\s+(\w+(?:\s+\w+){0,3})/i,
      /(?:computer|laptop|phone|mobile|tablet|device)/i,
      /(?:internet|wifi|network|connection)/i,
      /(?:database|server|cloud)/i,
    ];
    
    for (const pattern of resourcePatterns) {
      const match = text.match(pattern);
      if (match) {
        resources.push(match[1]?.trim() || match[0].trim());
      }
    }
    
    return resources;
  }
  
  private identifyMissingInformation(text: string): string[] {
    const missing: string[] = [];
    
    // Check for common missing information
    if (!text.match(/\d+/) && !text.match(/(?:hundreds|thousands|millions|many|few|several)/i)) {
      missing.push('scale: number of users/beneficiaries not specified');
    }
    
    if (!text.match(/(?:budget|cost|price|afford|\$|cheap|expensive)/i)) {
      missing.push('budget: financial constraints not mentioned');
    }
    
    if (!text.match(/(?:time|timeline|deadline|duration|months?|weeks?|days?)/i)) {
      missing.push('timeline: time constraints not specified');
    }
    
    if (!text.match(/(?:skill|experience|knowledge|beginner|expert|developer)/i)) {
      missing.push('human_skills: technical capability not mentioned');
    }
    
    if (!text.match(/(?:device|computer|laptop|phone|server|hardware)/i)) {
      missing.push('device_capacity: available hardware not specified');
    }
    
    return missing;
  }
  
  private inferEnvironment(text: string): string[] {
    const environment: string[] = [];
    
    if (text.match(/(?:online|web|internet|digital|app|website)/i)) {
      environment.push('digital');
    }
    
    if (text.match(/(?:offline|local|physical|in-person|face-to-face)/i)) {
      environment.push('physical');
    }
    
    if (text.match(/(?:community|neighborhood|local|village|town)/i)) {
      environment.push('community-based');
    }
    
    if (text.match(/(?:global|worldwide|international|world)/i)) {
      environment.push('global');
    }
    
    return environment.length > 0 ? environment : ['unspecified'];
  }
  
  private determineUrgency(text: string): 'low' | 'medium' | 'high' | 'unknown' {
    const highUrgency = /(?:urgent|immediately|asap|critical|emergency|now|today)/i;
    const mediumUrgency = /(?:soon|quickly|fast|rapid|within\s+\w+\s+(?:days?|weeks?|months?))/i;
    const lowUrgency = /(?:eventually|someday|long-term|future|when\s+possible)/i;
    
    if (highUrgency.test(text)) return 'high';
    if (mediumUrgency.test(text)) return 'medium';
    if (lowUrgency.test(text)) return 'low';
    return 'unknown';
  }
  
  private extractDesiredOutcome(text: string): string {
    // Look for outcome indicators
    const outcomePatterns = [
      /(?:so that|in order to|to)\s+(\w+(?:\s+\w+){0,8})/i,
      /(?:goal|objective|aim|purpose)\s+(?:is|:)?\s+(\w+(?:\s+\w+){0,8})/i,
      /(?:result|outcome|achieve)\s+(?:is|:)?\s+(\w+(?:\s+\w+){0,8})/i,
    ];
    
    for (const pattern of outcomePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Default to the original text if no pattern matches
    return text;
  }
  
  private classifyInformation(text: string, words: string[]): { facts: string[]; assumptions: string[]; unknowns: string[] } {
    const facts: string[] = [];
    const assumptions: string[] = [];
    const unknowns: string[] = [];
    
    // Facts are explicit statements
    const factPatterns = [
      /(?:i have|we have|there is|there are|i need|we need)\s+(\w+(?:\s+\w+){0,5})/i,
      /(?:currently|right now|at the moment)\s+(\w+(?:\s+\w+){0,5})/i,
    ];
    
    for (const pattern of factPatterns) {
      const match = text.match(pattern);
      if (match) {
        facts.push(match[0].trim());
      }
    }
    
    // Assumptions are implied but not stated
    const assumptionPatterns = [
      /(?:probably|likely|presumably|assumably|i think|i believe|i assume)/i,
      /(?:should|would|could|might|may)\s+\w+/i,
    ];
    
    for (const pattern of assumptionPatterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        if (match) {
          assumptions.push(match[0].trim());
        }
      }
    }
    
    // Unknowns are gaps in information
    if (!text.match(/\d+/) && !text.match(/(?:many|few|several|some)/i)) {
      unknowns.push('specific quantity or scale unknown');
    }
    
    if (!text.match(/(?:budget|cost|price|afford)/i)) {
      unknowns.push('budget constraints unknown');
    }
    
    if (!text.match(/(?:skill|experience|knowledge)/i)) {
      unknowns.push('human technical capability unknown');
    }
    
    if (!text.match(/(?:device|computer|hardware)/i)) {
      unknowns.push('available hardware unknown');
    }
    
    return { facts, assumptions, unknowns };
  }
  
  private calculateConfidence(metrics: {
    hasExplicitRequest: boolean;
    hasConstraints: boolean;
    hasResources: boolean;
    missingInfoCount: number;
    unknownsCount: number;
  }): number {
    let confidence = 0.5; // Base confidence
    
    if (metrics.hasExplicitRequest) confidence += 0.2;
    if (metrics.hasConstraints) confidence += 0.1;
    if (metrics.hasResources) confidence += 0.1;
    
    // Reduce confidence for missing information
    confidence -= metrics.missingInfoCount * 0.05;
    confidence -= metrics.unknownsCount * 0.03;
    
    return Math.max(0, Math.min(1, confidence));
  }
}