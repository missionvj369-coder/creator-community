// 6. SYSTEMS INTELLIGENCE - Evaluates real-world effects

import { ProjectConcept, SystemsAnalysis } from './types';

export class SystemsEngine {
  analyzeSystems(projectConcept: ProjectConcept): SystemsAnalysis {
    const inputs = this.identifyInputs(projectConcept);
    const processes = this.identifyProcesses(projectConcept);
    const outputs = this.identifyOutputs(projectConcept);
    const feedbackLoops = this.identifyFeedbackLoops(projectConcept);
    const dependencies = this.identifySystemDependencies(projectConcept);
    const firstOrderEffects = this.identifyFirstOrderEffects(projectConcept);
    const secondOrderEffects = this.identifySecondOrderEffects(projectConcept, firstOrderEffects);
    const thirdOrderEffects = this.identifyThirdOrderEffects(projectConcept, secondOrderEffects);
    const unintendedConsequences = this.identifyUnintendedConsequences(projectConcept);
    const failureModes = this.identifyFailureModes(projectConcept);
    const scalability = this.analyzeScalability(projectConcept);
    const maintenance = this.analyzeMaintenance(projectConcept);
    const resourceConsumption = this.analyzeResourceConsumption(projectConcept);
    
    const confidence = this.calculateConfidence({
      hasClearInputs: inputs.length > 0,
      hasClearOutputs: outputs.length > 0,
      hasDependencies: dependencies.length > 0,
      hasFailureModes: failureModes.length > 0,
    });
    
    return {
      inputs,
      processes,
      outputs,
      feedbackLoops,
      dependencies,
      firstOrderEffects,
      secondOrderEffects,
      thirdOrderEffects,
      unintendedConsequences,
      failureModes,
      scalability,
      maintenance,
      resourceConsumption,
      confidence,
    };
  }
  
  private identifyInputs(projectConcept: ProjectConcept): SystemsAnalysis['inputs'] {
    const inputs: SystemsAnalysis['inputs'] = [];
    
    // Human inputs
    inputs.push({
      name: 'User interaction',
      description: 'User requests, data entry, and feedback',
      type: 'input',
      source: 'end users',
      criticality: 'critical',
    });
    
    // Resource inputs
    inputs.push({
      name: 'minimal resources',
      description: `Computational resources at minimal level: ${projectConcept.requiredResources.minimal.ram}MB RAM`,
      type: 'input',
      source: 'infrastructure',
      criticality: 'high',
    });
    inputs.push({
      name: 'standard resources',
      description: `Computational resources at standard level: ${projectConcept.requiredResources.standard.ram}MB RAM`,
      type: 'input',
      source: 'infrastructure',
      criticality: 'high',
    });
    
    // Data inputs
    if (projectConcept.expectedOutputs.some(o => o.match(/(?:data|track|monitor|analytics)/i))) {
      inputs.push({
        name: 'Data collection',
        description: 'External data sources and user-generated data',
        type: 'input',
        source: 'various',
        criticality: 'high',
      });
    }
    
    // Capability inputs
    for (const capability of projectConcept.requiredCapabilities.slice(0, 3)) {
      inputs.push({
        name: capability.name,
        description: capability.description,
        type: 'input',
        source: capability.provider,
        criticality: 'high',
      });
    }
    
    return inputs;
  }
  
  private identifyProcesses(projectConcept: ProjectConcept): SystemsAnalysis['processes'] {
    const processes: SystemsAnalysis['processes'] = [];
    
    // Core processing
    processes.push({
      name: 'Core functionality',
      description: `Main processing for: ${projectConcept.objective}`,
      type: 'process',
      criticality: 'critical',
    });
    
    // Implementation stages as processes
    for (const stage of projectConcept.implementationStages) {
      processes.push({
        name: stage.name,
        description: stage.description,
        type: 'process',
        criticality: stage.order === 0 ? 'critical' : 'high',
      });
    }
    
    // Data processing
    if (projectConcept.expectedOutputs.some(o => o.match(/(?:data|analytics|report)/i))) {
      processes.push({
        name: 'Data processing',
        description: 'Collection, analysis, and reporting of data',
        type: 'process',
        criticality: 'high',
      });
    }
    
    // User management
    if (projectConcept.users.length > 1) {
      processes.push({
        name: 'User management',
        description: 'Authentication, authorization, and user experience',
        type: 'process',
        criticality: 'high',
      });
    }
    
    return processes;
  }
  
  private identifyOutputs(projectConcept: ProjectConcept): SystemsAnalysis['outputs'] {
    const outputs: SystemsAnalysis['outputs'] = [];
    
    // Primary outputs
    for (const output of projectConcept.expectedOutputs) {
      outputs.push({
        name: output,
        description: `Deliverable: ${output}`,
        type: 'output',
        destination: 'users',
        criticality: 'high',
      });
    }
    
    // Secondary outputs
    outputs.push({
      name: 'User value',
      description: `Addresses: ${projectConcept.problemSolved}`,
      type: 'output',
      destination: 'end users',
      criticality: 'critical',
    });
    
    // Feedback outputs
    outputs.push({
      name: 'System feedback',
      description: 'Metrics, logs, and monitoring data',
      type: 'output',
      destination: 'administrators',
      criticality: 'medium',
    });
    
    return outputs;
  }
  
  private identifyFeedbackLoops(projectConcept: ProjectConcept): SystemsAnalysis['feedbackLoops'] {
    const loops: SystemsAnalysis['feedbackLoops'] = [];
    
    // User feedback loop
    if (projectConcept.users.length > 0) {
      loops.push({
        id: 'fl-1',
        name: 'User feedback loop',
        type: 'reinforcing',
        description: 'User feedback improves system over time',
        elements: ['user interaction', 'system adaptation', 'improved experience'],
        impact: 'positive',
      });
    }
    
    // Resource consumption feedback
    if (projectConcept.estimatedComplexity !== 'low') {
      loops.push({
        id: 'fl-2',
        name: 'Resource optimization loop',
        type: 'balancing',
        description: 'Resource usage monitored and optimized',
        elements: ['resource monitoring', 'optimization', 'reduced consumption'],
        impact: 'positive',
      });
    }
    
    // Quality feedback loop
    loops.push({
      id: 'fl-3',
      name: 'Quality assurance loop',
      type: 'balancing',
      description: 'Testing and validation ensure quality',
      elements: ['testing', 'issue detection', 'fixes', 're-testing'],
      impact: 'positive',
    });
    
    // Scaling feedback
    if (projectConcept.estimatedComplexity === 'high') {
      loops.push({
        id: 'fl-4',
        name: 'Scaling feedback loop',
        type: 'balancing',
        description: 'Performance monitoring triggers scaling actions',
        elements: ['performance monitoring', 'load detection', 'scaling', 're-monitoring'],
        impact: 'neutral',
      });
    }
    
    return loops;
  }
  
  private identifySystemDependencies(projectConcept: ProjectConcept): SystemsAnalysis['dependencies'] {
    const dependencies: SystemsAnalysis['dependencies'] = [];
    let id = 0;
    
    // Capability dependencies
    for (const capability of projectConcept.requiredCapabilities) {
      dependencies.push({
        id: `sys-dep-${id++}`,
        name: capability.name,
        type: 'external',
        criticality: 'high',
        alternatives: [],
        failureImpact: `Loss of ${capability.name} would break core functionality`,
      });
    }
    
    // Infrastructure dependencies
    if (projectConcept.estimatedComplexity !== 'low') {
      dependencies.push({
        id: `sys-dep-${id++}`,
        name: 'Hosting infrastructure',
        type: 'infrastructure',
        criticality: 'critical',
        alternatives: ['cloud', 'self-hosted', 'hybrid'],
        failureImpact: 'System would be unavailable',
      });
    }
    
    // Data dependencies
    if (projectConcept.expectedOutputs.some(o => o.match(/(?:data|analytics)/i))) {
      dependencies.push({
        id: `sys-dep-${id++}`,
        name: 'Data storage',
        type: 'infrastructure',
        criticality: 'high',
        alternatives: ['SQL', 'NoSQL', 'file-based'],
        failureImpact: 'Data loss and system malfunction',
      });
    }
    
    // Human dependencies
    dependencies.push({
      id: `sys-dep-${id++}`,
      name: 'Human operators',
      type: 'internal',
      criticality: 'high',
      alternatives: ['automation', 'outsourcing'],
      failureImpact: 'System maintenance and updates would halt',
    });
    
    return dependencies;
  }
  
  private identifyFirstOrderEffects(projectConcept: ProjectConcept): string[] {
    const effects: string[] = [];
    
    // Direct effects
    effects.push(`Solves: ${projectConcept.problemSolved}`);
    effects.push(`Delivers: ${projectConcept.proposedSolution}`);
    
    // User effects
    for (const user of projectConcept.users.slice(0, 3)) {
      effects.push(`Benefits: ${user}`);
    }
    
    // Resource effects
    effects.push(`Requires: ${projectConcept.requiredResources.standard.ram}MB RAM`);
    effects.push(`Complexity: ${projectConcept.estimatedComplexity}`);
    
    // Time effects
    const totalTime = projectConcept.implementationStages.reduce((sum, stage) => {
      const weeks = parseInt(stage.estimatedEffort) || 1;
      return sum + weeks;
    }, 0);
    effects.push(`Implementation time: ~${totalTime} weeks`);
    
    return effects;
  }
  
  private identifySecondOrderEffects(projectConcept: ProjectConcept, firstOrder: string[]): string[] {
    const effects: string[] = [];
    
    // Behavioral effects
    if (projectConcept.users.some(u => u.match(/(?:community|people|users)/i))) {
      effects.push('Changes user behavior and workflows');
      effects.push('Requires user adoption and training');
    }
    
    // Resource effects
    if (projectConcept.estimatedComplexity === 'high') {
      effects.push('Requires ongoing maintenance resources');
      effects.push('Creates technical debt over time');
    }
    
    // Social effects
    if (projectConcept.problemSolved.match(/(?:community|social|people|access)/i)) {
      effects.push('May change community dynamics');
      effects.push('Could create dependency on system');
    }
    
    // Economic effects
    if (projectConcept.requiredResources.standard.estimatedCost !== 'free') {
      effects.push('Creates ongoing operational costs');
      effects.push('May require funding sustainability plan');
    }
    
    // Technical effects
    effects.push('Creates technical dependencies');
    effects.push('Requires updates and security patches');
    
    return effects;
  }
  
  private identifyThirdOrderEffects(projectConcept: ProjectConcept, secondOrder: string[]): string[] {
    const effects: string[] = [];
    
    // Long-term systemic effects
    if (projectConcept.estimatedComplexity === 'high') {
      effects.push('May require organizational changes');
      effects.push('Could influence future technology decisions');
    }
    
    // Community effects
    if (projectConcept.users.some(u => u.match(/(?:community|local|global)/i))) {
      effects.push('Could scale to broader communities');
      effects.push('May create network effects');
    }
    
    // Environmental effects
    if (projectConcept.requiredResources.accelerated.ram > 16384) {
      effects.push('Significant energy consumption');
      effects.push('Hardware lifecycle impact');
    }
    
    // Knowledge effects
    effects.push('Creates organizational knowledge');
    effects.push('Generates learnings for future projects');
    
    // Evolution effects
    if (projectConcept.implementationStages.some(s => s.name.match(/(?:scale|grow|expand)/i))) {
      effects.push('May require fundamental redesign at scale');
      effects.push('Could become legacy system requiring migration');
    }
    
    return effects;
  }
  
  private identifyUnintendedConsequences(projectConcept: ProjectConcept): string[] {
    const consequences: string[] = [];
    
    // Common unintended consequences
    if (projectConcept.estimatedComplexity === 'high') {
      consequences.push('Over-engineering may reduce usability');
    }
    
    if (projectConcept.users.some(u => u.match(/(?:beginner|non-technical|elderly)/i))) {
      consequences.push('May exclude users with lower technical skills');
    }
    
    if (projectConcept.requiredCapabilities.some(c => c.cost.type === 'paid')) {
      consequences.push('Cost barriers may limit accessibility');
    }
    
    if (projectConcept.problemSolved.match(/(?:data|track|monitor|surveillance)/i)) {
      consequences.push('Privacy concerns may arise');
      consequences.push('Data misuse potential');
    }
    
    if (projectConcept.estimatedComplexity === 'low') {
      consequences.push('Simple solution may not scale');
      consequences.push('Limited features may reduce long-term value');
    }
    
    if (projectConcept.users.length > 5) {
      consequences.push('Multiple user groups may have conflicting needs');
    }
    
    // If no specific consequences, add general ones
    if (consequences.length === 0) {
      consequences.push('User adoption may be slower than expected');
      consequences.push('Maintenance burden may increase over time');
    }
    
    return consequences;
  }
  
  private identifyFailureModes(projectConcept: ProjectConcept): SystemsAnalysis['failureModes'] {
    const modes: SystemsAnalysis['failureModes'] = [];
    let id = 0;
    
    // Technical failures
    if (projectConcept.estimatedComplexity === 'high') {
      modes.push({
        id: `fm-${id++}`,
        name: 'Technical integration failure',
        description: 'Capabilities fail to integrate properly',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Thorough testing and fallback mechanisms',
        detection: 'Integration tests and monitoring',
      });
    }
    
    // Resource failures
    modes.push({
      id: `fm-${id++}`,
      name: 'Resource exhaustion',
      description: 'System exceeds available resources',
      probability: 'medium',
      impact: 'high',
      mitigation: 'Resource monitoring and auto-scaling',
      detection: 'Performance metrics and alerts',
    });
    
    // User adoption failure
    if (projectConcept.users.length > 0) {
      modes.push({
        id: `fm-${id++}`,
        name: 'Low user adoption',
        description: 'Users do not adopt the system',
        probability: 'medium',
        impact: 'critical',
        mitigation: 'User training and intuitive design',
        detection: 'Usage metrics and user feedback',
      });
    }
    
    // Dependency failures
    for (const capability of projectConcept.requiredCapabilities.slice(0, 2)) {
      modes.push({
        id: `fm-${id++}`,
        name: `Capability failure: ${capability.name}`,
        description: `External capability ${capability.name} becomes unavailable`,
        probability: 'low',
        impact: 'high',
        mitigation: 'Alternative capabilities and fallback options',
        detection: 'Health checks and monitoring',
      });
    }
    
    // Security failures
    modes.push({
      id: `fm-${id++}`,
      name: 'Security breach',
      description: 'System vulnerability exploited',
      probability: 'low',
      impact: 'critical',
      mitigation: 'Security best practices and regular audits',
      detection: 'Security monitoring and intrusion detection',
    });
    
    return modes;
  }
  
  private analyzeScalability(projectConcept: ProjectConcept): SystemsAnalysis['scalability'] {
    const complexity = projectConcept.estimatedComplexity;
    
    const currentCapacity = complexity === 'low' 
      ? '10-100 users' 
      : complexity === 'medium' 
      ? '100-10,000 users' 
      : '10,000+ users';
    
    const maxCapacity = complexity === 'low'
      ? '1,000 users'
      : complexity === 'medium'
      ? '100,000 users'
      : '1,000,000+ users';
    
    const scalingLimitations: string[] = [];
    if (complexity === 'low') {
      scalingLimitations.push('Architecture not designed for scale');
      scalingLimitations.push('May require complete rebuild');
    } else if (complexity === 'medium') {
      scalingLimitations.push('Database may need optimization');
      scalingLimitations.push('Caching strategy required');
    } else {
      scalingLimitations.push('Microservices architecture needed');
      scalingLimitations.push('Distributed system complexity');
    }
    
    const scalingCost = complexity === 'low' ? 'low' : complexity === 'medium' ? 'medium' : 'high';
    
    const bottlenecks: string[] = [];
    if (projectConcept.expectedOutputs.some(o => o.match(/(?:data|analytics)/i))) {
      bottlenecks.push('Database queries');
    }
    bottlenecks.push('API rate limits');
    if (complexity === 'high') {
      bottlenecks.push('Network latency');
      bottlenecks.push('Memory usage');
    }
    
    return {
      currentCapacity,
      maxCapacity,
      scalingLimitations,
      scalingCost,
      bottlenecks,
    };
  }
  
  private analyzeMaintenance(projectConcept: ProjectConcept): SystemsAnalysis['maintenance'] {
    const complexity = projectConcept.estimatedComplexity;
    
    const requiredMaintenance: string[] = [
      'Security updates',
      'Bug fixes',
      'Performance optimization',
    ];
    
    if (complexity === 'high') {
      requiredMaintenance.push('Architecture updates');
      requiredMaintenance.push('Scalability improvements');
      requiredMaintenance.push('Dependency updates');
    }
    
    if (projectConcept.expectedOutputs.some(o => o.match(/(?:data|analytics)/i))) {
      requiredMaintenance.push('Data quality checks');
      requiredMaintenance.push('Database optimization');
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
  
  private analyzeResourceConsumption(projectConcept: ProjectConcept): SystemsAnalysis['resourceConsumption'] {
    const resources = projectConcept.requiredResources.standard;
    
    const compute = `${resources.cpu} CPU, ${resources.ram}MB RAM`;
    const storage = `${resources.storage}MB storage`;
    const network = resources.network;
    const energy = resources.complexity === 'high' ? 'high' : 'medium';
    const sustainability = resources.estimatedCost === 'free' ? 0.8 : 0.6;
    
    return {
      compute,
      storage,
      network,
      energy,
      sustainability,
    };
  }
  
  private calculateConfidence(metrics: {
    hasClearInputs: boolean;
    hasClearOutputs: boolean;
    hasDependencies: boolean;
    hasFailureModes: boolean;
  }): number {
    let confidence = 0.5;
    
    if (metrics.hasClearInputs) confidence += 0.15;
    if (metrics.hasClearOutputs) confidence += 0.15;
    if (metrics.hasDependencies) confidence += 0.1;
    if (metrics.hasFailureModes) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
}