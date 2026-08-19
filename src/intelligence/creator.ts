// 5. CREATOR - Transforms possibility into project concept

import { 
  GeneratedPossibility, 
  Understanding, 
  HumanContext, 
  ProjectConcept,
  ResourceLevel,
  ImplementationStage,
  ProjectDependency,
  DeviceRequirements,
  MaintenanceAnalysis
} from './types';

export class Creator {
  createProjectConcept(
    possibility: GeneratedPossibility,
    understanding: Understanding,
    humanContext: HumanContext
  ): ProjectConcept {
    const objective = this.defineObjective(possibility, understanding);
    const users = this.identifyUsers(understanding, humanContext);
    const problemSolved = understanding.rootNeed;
    const proposedSolution = possibility.description;
    const requiredCapabilities = possibility.capabilities;
    const requiredResources = this.defineResourceRequirements(possibility, humanContext);
    const implementationStages = this.planImplementation(possibility, understanding);
    const expectedOutputs = this.defineOutputs(possibility, understanding);
    const dependencies = this.identifyDependencies(possibility, understanding);
    const estimatedComplexity = possibility.estimatedComplexity;
    const deviceRequirements = this.defineDeviceRequirements(possibility, humanContext);
    const humanSkillRequirements = this.defineHumanSkillRequirements(possibility, humanContext);
    
    const confidence = this.calculateConfidence({
      hasClearObjective: objective.length > 0,
      hasUsers: users.length > 0,
      hasCapabilities: requiredCapabilities.length > 0,
      hasStages: implementationStages.length > 0,
      humanFit: possibility.scores.humanFit,
    });
    
    return {
      objective,
      users,
      problemSolved,
      proposedSolution,
      category: possibility.category,
      estimatedCost: possibility.estimatedCost,
      innovation: possibility.innovation,
      requiredCapabilities,
      requiredResources,
      implementationStages,
      expectedOutputs,
      dependencies,
      estimatedComplexity,
      deviceRequirements,
      humanSkillRequirements,
      maintenance: this.defineMaintenance(possibility),
      confidence,
      evidence: this.extractEvidence(possibility, understanding),
      assumptions: this.extractAssumptions(possibility, understanding, humanContext),
      unknowns: this.extractUnknowns(possibility, understanding, humanContext),
      successConditions: understanding.successConditions,
      accessibility: humanContext.accessibility,
    };
  }
  
  private defineObjective(possibility: GeneratedPossibility, understanding: Understanding): string {
    return `Create a ${possibility.estimatedComplexity}-complexity solution to ${understanding.rootNeed} using ${possibility.name.toLowerCase()}`;
  }
  
  private identifyUsers(understanding: Understanding, humanContext: HumanContext): string[] {
    const users: string[] = [];
    
    // From understanding
    for (const stakeholder of understanding.stakeholders) {
      if (stakeholder.length > 2 && !users.includes(stakeholder)) {
        users.push(stakeholder);
      }
    }
    
    // From human context
    if (humanContext.capability === 'beginner') {
      users.push('non-technical users');
    }
    
    if (humanContext.accessibility.length > 0) {
      for (const access of humanContext.accessibility) {
        const group = access.split(':')[0].trim();
        if (group && !users.includes(group)) {
          users.push(group);
        }
      }
    }
    
    // Ensure we have at least primary user
    if (users.length === 0) {
      users.push('end users');
    }
    
    return users;
  }
  
  private defineResourceRequirements(
    possibility: GeneratedPossibility,
    humanContext: HumanContext
  ): ProjectConcept['requiredResources'] {
    const baseComplexity = possibility.estimatedComplexity;
    
    const minimal: ResourceLevel = {
      ram: baseComplexity === 'low' ? 2048 : 4096,
      storage: baseComplexity === 'low' ? 5120 : 10240,
      cpu: 'basic',
      network: 'intermittent',
      estimatedCost: 'free',
      complexity: baseComplexity,
    };
    
    const standard: ResourceLevel = {
      ram: baseComplexity === 'low' ? 4096 : 8192,
      storage: baseComplexity === 'low' ? 10240 : 20480,
      cpu: 'standard',
      network: 'reliable',
      estimatedCost: possibility.estimatedCost,
      complexity: baseComplexity,
    };
    
    const accelerated: ResourceLevel = {
      ram: baseComplexity === 'low' ? 8192 : 16384,
      storage: baseComplexity === 'low' ? 20480 : 51200,
      cpu: 'high-performance',
      gpu: baseComplexity === 'high' ? 'optional' : undefined,
      network: 'high-speed',
      estimatedCost: 'paid',
      complexity: baseComplexity,
    };
    
    return { minimal, standard, accelerated };
  }
  
  private planImplementation(possibility: GeneratedPossibility, understanding: Understanding): ImplementationStage[] {
    const stages: ImplementationStage[] = [];
    let order = 0;
    
    // Stage 1: Setup and planning
    stages.push({
      order: order++,
      name: 'Project Setup and Planning',
      description: 'Initialize project structure, define requirements, and create implementation plan',
      capabilities: [],
      estimatedEffort: possibility.estimatedTime.includes('week') ? '1 week' : '2-3 weeks',
      dependencies: [],
      deliverables: ['project plan', 'requirements document', 'initial repository'],
    });
    
    // Stage 2: Core capability integration
    const coreCapabilities = possibility.capabilities.slice(0, Math.ceil(possibility.capabilities.length / 2));
    if (coreCapabilities.length > 0) {
      stages.push({
        order: order++,
        name: 'Core Capability Integration',
        description: 'Integrate primary capabilities and establish basic functionality',
        capabilities: coreCapabilities.map(c => c.id),
        estimatedEffort: possibility.estimatedTime.includes('week') ? '1-2 weeks' : '3-4 weeks',
        dependencies: [0],
        deliverables: ['working prototype', 'core functionality'],
      });
    }
    
    // Stage 3: Additional capabilities
    const additionalCapabilities = possibility.capabilities.slice(Math.ceil(possibility.capabilities.length / 2));
    if (additionalCapabilities.length > 0) {
      stages.push({
        order: order++,
        name: 'Extended Functionality',
        description: 'Add remaining capabilities and enhance user experience',
        capabilities: additionalCapabilities.map(c => c.id),
        estimatedEffort: possibility.estimatedTime.includes('week') ? '1 week' : '4-6 weeks',
        dependencies: [order - 1],
        deliverables: ['feature-complete version', 'user interface'],
      });
    }
    
    // Stage 4: Testing and validation
    stages.push({
      order: order++,
      name: 'Testing and Validation',
      description: 'Test all functionality, validate against requirements, and fix issues',
      capabilities: [],
      estimatedEffort: possibility.estimatedTime.includes('week') ? '3-5 days' : '2-3 weeks',
      dependencies: [order - 1],
      deliverables: ['test results', 'bug fixes', 'validated solution'],
    });
    
    // Stage 5: Deployment and documentation
    stages.push({
      order: order++,
      name: 'Deployment and Documentation',
      description: 'Deploy solution and create user documentation',
      capabilities: [],
      estimatedEffort: possibility.estimatedTime.includes('week') ? '2-3 days' : '1-2 weeks',
      dependencies: [order - 1],
      deliverables: ['deployed solution', 'user guide', 'maintenance documentation'],
    });
    
    return stages;
  }
  
  private defineOutputs(possibility: GeneratedPossibility, understanding: Understanding): string[] {
    const outputs: string[] = [];
    
    // Universal outputs
    outputs.push(`Working solution addressing: ${understanding.rootNeed}`);
    outputs.push('User documentation and guides');
    outputs.push('Source code and configuration');
    
    // Possibility-specific outputs
    if (possibility.category === 'open-source') {
      outputs.push('Public repository with documentation');
      outputs.push('Community contribution guidelines');
    }
    
    if (possibility.category === 'community') {
      outputs.push('Community engagement plan');
      outputs.push('Training materials for volunteers');
    }
    
    if (possibility.estimatedComplexity === 'high') {
      outputs.push('Architecture documentation');
      outputs.push('Scalability plan');
    }
    
    if (understanding.constraints.some(c => c.match(/(?:data|track|monitor)/i))) {
      outputs.push('Data collection and reporting system');
      outputs.push('Analytics dashboard');
    }
    
    return outputs;
  }
  
  private identifyDependencies(possibility: GeneratedPossibility, understanding: Understanding): ProjectDependency[] {
    const dependencies: ProjectDependency[] = [];
    let id = 0;
    
    // Capability dependencies
    for (const capability of possibility.capabilities) {
      dependencies.push({
        id: `dep-${id++}`,
        name: capability.name,
        type: 'capability',
        criticality: 'high',
        alternatives: [],
      });
    }
    
    // Infrastructure dependencies
    if (possibility.estimatedComplexity !== 'low') {
      dependencies.push({
        id: `dep-${id++}`,
        name: 'Hosting infrastructure',
        type: 'resource',
        criticality: 'high',
        alternatives: ['cloud hosting', 'self-hosted', 'serverless'],
      });
    }
    
    // Knowledge dependencies
    if (possibility.humanSkills.some(s => s.match(/(?:advanced|expert)/i))) {
      dependencies.push({
        id: `dep-${id++}`,
        name: 'Technical expertise',
        type: 'knowledge',
        criticality: 'high',
        alternatives: ['hiring developer', 'outsourcing', 'extensive learning'],
      });
    }
    
    // External dependencies
    if (possibility.estimatedCost === 'paid') {
      dependencies.push({
        id: `dep-${id++}`,
        name: 'Funding source',
        type: 'external',
        criticality: 'critical',
        alternatives: ['grants', 'donations', 'self-funding', 'freemium model'],
      });
    }
    
    return dependencies;
  }
  
  private defineDeviceRequirements(possibility: GeneratedPossibility, humanContext: HumanContext): DeviceRequirements {
    const complexity = possibility.estimatedComplexity;
    
    const minimal = complexity === 'low' 
      ? 'Basic computer or smartphone with web browser'
      : complexity === 'medium'
      ? 'Computer with 4GB RAM, modern browser'
      : 'Computer with 8GB RAM, development environment capable';
    
    const recommended = complexity === 'low'
      ? 'Computer with 4GB RAM, stable internet connection'
      : complexity === 'medium'
      ? 'Computer with 8GB RAM, SSD storage, reliable internet'
      : 'Computer with 16GB RAM, SSD storage, high-speed internet';
    
    const optimal = complexity === 'low'
      ? 'Modern computer or laptop'
      : complexity === 'medium'
      ? 'High-performance computer with 16GB RAM'
      : 'Workstation with 32GB+ RAM, dedicated GPU, fast storage';
    
    const platforms: string[] = ['web'];
    if (complexity !== 'low') {
      platforms.push('desktop');
    }
    if (complexity === 'high') {
      platforms.push('server', 'cloud');
    }
    
    return { minimal, recommended, optimal, platforms };
  }
  
  private defineHumanSkillRequirements(
    possibility: GeneratedPossibility,
    humanContext: HumanContext
  ): ProjectConcept['humanSkillRequirements'] {
    const complexity = possibility.estimatedComplexity;
    
    const programming = complexity === 'low' ? 2 : complexity === 'medium' ? 5 : 8;
    const systemAdmin = complexity === 'low' ? 1 : complexity === 'medium' ? 3 : 6;
    const domainExpertise = 5; // Always need some domain knowledge
    
    const timeToImplement = possibility.estimatedTime;
    const learningCurve = complexity === 'low' ? 'low' : complexity === 'medium' ? 'medium' : 'high';
    
    return {
      programming,
      systemAdmin,
      domainExpertise,
      timeToImplement,
      learningCurve,
    };
  }
  
  private extractEvidence(possibility: GeneratedPossibility, understanding: Understanding): string[] {
    const evidence: string[] = [];
    
    // From possibility
    if (possibility.scores.evidenceQuality > 0.7) {
      evidence.push(`High evidence quality (${(possibility.scores.evidenceQuality * 100).toFixed(0)}%) for this approach`);
    }
    
    if (possibility.scores.maturity > 0.7) {
      evidence.push(`Mature solution with ${(possibility.scores.maturity * 100).toFixed(0)}% maturity score`);
    }
    
    // From understanding
    if (understanding.successConditions.length > 0) {
      evidence.push(`Clear success criteria defined: ${understanding.successConditions.length} conditions`);
    }
    
    if (understanding.stakeholders.length > 0) {
      evidence.push(`Stakeholder engagement plan for ${understanding.stakeholders.length} groups`);
    }
    
    return evidence;
  }
  
  private extractAssumptions(
    possibility: GeneratedPossibility,
    understanding: Understanding,
    humanContext: HumanContext
  ): string[] {
    const assumptions: string[] = [];
    
    // Resource assumptions
    if (possibility.estimatedCost === 'free') {
      assumptions.push('Free tools and services will remain available');
    }
    
    if (humanContext.capability === 'beginner') {
      assumptions.push('User will follow guidance and documentation');
    }
    
    // Technical assumptions
    if (possibility.estimatedComplexity === 'high') {
      assumptions.push('Technical challenges can be overcome with available expertise');
    }
    
    if (possibility.capabilities.some(c => c.cost.type === 'freemium')) {
      assumptions.push('Freemium tools will meet needs without requiring paid upgrade');
    }
    
    // Context assumptions
    if (understanding.constraints.length > 0) {
      assumptions.push('Constraints are accurately understood and achievable');
    }
    
    if (humanContext.likelyFriction.length > 0) {
      assumptions.push('Identified friction points can be mitigated');
    }
    
    return assumptions;
  }
  
  private extractUnknowns(
    possibility: GeneratedPossibility,
    understanding: Understanding,
    humanContext: HumanContext
  ): string[] {
    const unknowns: string[] = [];
    
    // Technical unknowns
    if (possibility.estimatedComplexity === 'high') {
      unknowns.push('Technical integration challenges not yet identified');
    }
    
    if (possibility.innovation > 0.7) {
      unknowns.push('Novel approach lacks proven track record');
    }
    
    // Human unknowns
    if (humanContext.confidence < 0.7) {
      unknowns.push('Human capability profile may not be fully accurate');
    }
    
    if (humanContext.unknown.length > 0) {
      unknowns.push(...humanContext.unknown.slice(0, 3));
    }
    
    // Context unknowns
    if (understanding.risks.length > 3) {
      unknowns.push('Multiple risk factors may interact in unexpected ways');
    }
    
    if (possibility.scores.evidenceQuality < 0.6) {
      unknowns.push('Limited evidence for approach effectiveness');
    }
    
    return unknowns;
  }
  
  private defineMaintenance(possibility: GeneratedPossibility): MaintenanceAnalysis {
    const complexity = possibility.estimatedComplexity;
    
    const requiredMaintenance: string[] = [
      'Security updates',
      'Bug fixes',
      'Performance optimization',
    ];
    
    if (complexity === 'high') {
      requiredMaintenance.push('Architecture updates');
      requiredMaintenance.push('Scalability improvements');
    }
    
    const maintenanceFrequency = complexity === 'low' ? 'monthly' 
      : complexity === 'medium' ? 'weekly' 
      : 'daily';
    
    const maintenanceComplexity = complexity;
    
    const longTermViability = complexity === 'low' ? 0.6 
      : complexity === 'medium' ? 0.75 
      : 0.85;
    
    return {
      requiredMaintenance,
      maintenanceFrequency,
      maintenanceComplexity,
      longTermViability,
    };
  }
  
  private calculateConfidence(metrics: {
    hasClearObjective: boolean;
    hasUsers: boolean;
    hasCapabilities: boolean;
    hasStages: boolean;
    humanFit: number;
  }): number {
    let confidence = 0.5;
    
    if (metrics.hasClearObjective) confidence += 0.15;
    if (metrics.hasUsers) confidence += 0.1;
    if (metrics.hasCapabilities) confidence += 0.15;
    if (metrics.hasStages) confidence += 0.1;
    
    // Factor in human fit
    confidence += metrics.humanFit * 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }
}
