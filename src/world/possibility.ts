// Possibility Record Model
// Represents a potential combination of capabilities

import { CapabilityGraph } from './capability';

export interface PossibilityRecord {
  id: string;
  title: string;
  description: string;
  
  requiredCapabilities: string[]; // capability IDs
  optionalCapabilities: string[]; // capability IDs
  
  proposedCombination: CombinationProposal;
  
  feasibility: {
    score: number; // 0-1
    reasoning: string;
    deviceRequirements: DeviceFeasibility;
    humanRequirements: HumanFeasibility;
    resourceRequirements: ResourceFeasibility;
  };
  
  evidence: Evidence[];
  
  hardwareRequirements: HardwareSummary;
  humanSkillRequirements: SkillSummary;
  
  privacyRisk: 'low' | 'medium' | 'high' | 'critical';
  securityRisk: 'low' | 'medium' | 'high' | 'critical';
  
  impactPotential: {
    benefit: number; // 0-1
    beneficiaries: string[];
    environmentalImpact: 'positive' | 'neutral' | 'negative' | 'unknown';
    accessibility: number; // 0-1
  };
  
  status: PossibilityStatus;
  
  createdAt: Date;
  updatedAt: Date;
  validatedAt?: Date;
  deprecatedAt?: Date;
  
  createdBy: 'system' | 'human' | 'combination-engine';
  validatedBy?: string;
  
  tags: string[];
  notes: string;
}

export interface CombinationProposal {
  description: string;
  capabilities: string[];
  expectedOutput: string;
  useCases: string[];
  similarExistingSystems?: string[];
}

export interface DeviceFeasibility {
  feasible: boolean;
  minRequirements: {
    ram: number;
    storage: number;
    gpu: boolean;
    cpuCores: number;
  };
  recommendedDevice?: string;
  alternatives: string[];
}

export interface HumanFeasibility {
  feasible: boolean;
  minSkillLevel: 'beginner' | 'guided' | 'intermediate' | 'advanced' | 'expert';
  setupComplexity: 'low' | 'medium' | 'high';
  maintenanceComplexity: 'low' | 'medium' | 'high';
  learningCurve: string;
}

export interface ResourceFeasibility {
  feasible: boolean;
  estimatedCost: 'free' | 'freemium' | 'paid' | 'enterprise';
  costBreakdown: CostItem[];
  openSourceAlternatives: string[];
}

export interface CostItem {
  item: string;
  estimatedCost: string;
  recurring: boolean;
}

export interface Evidence {
  type: 'tested' | 'documented' | 'observed' | 'inferred' | 'hypothetical';
  source: string;
  description: string;
  confidence: number; // 0-1
  timestamp: Date;
}

export interface HardwareSummary {
  minRam?: number;
  recommendedRam?: number;
  gpuRecommended: boolean;
  minStorage?: number;
  specialRequirements?: string[];
}

export interface SkillSummary {
  programming: number; // 0-10
  systemAdmin: number; // 0-10
  domainExpertise: number; // 0-10
  timeToImplement: string;
}

export type PossibilityStatus = 
  | 'discovered'
  | 'hypothesis'
  | 'evaluating'
  | 'validated'
  | 'rejected'
  | 'deprecated';

// Possibility Engine
export class PossibilityEngine {
  private possibilities: Map<string, PossibilityRecord> = new Map();
  private capabilityGraph: CapabilityGraph;

  constructor(capabilityGraph: CapabilityGraph) {
    this.capabilityGraph = capabilityGraph;
  }

  generatePossibility(
    title: string,
    description: string,
    requiredCapabilityIds: string[]
  ): PossibilityRecord {
    const id = this.generateId();
    const capabilities = requiredCapabilityIds.map(id => this.capabilityGraph.getCapability(id)).filter((c): c is NonNullable<typeof c> => c !== undefined);
    
    const combination: CombinationProposal = {
      description: this.generateCombinationDescription(capabilities),
      capabilities: requiredCapabilityIds,
      expectedOutput: this.inferOutput(capabilities),
      useCases: this.inferUseCases(capabilities),
    };

    const feasibility = this.assessFeasibility(capabilities);
    const evidence: Evidence[] = [{
      type: 'inferred',
      source: 'capability-graph',
      description: 'Generated from capability combination analysis',
      confidence: 0.5,
      timestamp: new Date(),
    }];

    const possibility: PossibilityRecord = {
      id,
      title,
      description,
      requiredCapabilities: requiredCapabilityIds,
      optionalCapabilities: [],
      proposedCombination: combination,
      feasibility,
      evidence,
      hardwareRequirements: this.summarizeHardware(capabilities),
      humanSkillRequirements: this.summarizeSkills(capabilities),
      privacyRisk: this.assessPrivacyRisk(capabilities),
      securityRisk: this.assessSecurityRisk(capabilities),
      impactPotential: this.assessImpact(capabilities),
      status: 'hypothesis',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'combination-engine',
      tags: this.generateTags(capabilities),
      notes: 'Auto-generated possibility from capability combination',
    };

    this.possibilities.set(id, possibility);
    return possibility;
  }

  getPossibility(id: string): PossibilityRecord | undefined {
    return this.possibilities.get(id);
  }

  getAllPossibilities(): PossibilityRecord[] {
    return Array.from(this.possibilities.values());
  }

  getPossibilitiesByStatus(status: PossibilityStatus): PossibilityRecord[] {
    return this.getAllPossibilities().filter(p => p.status === status);
  }

  updateStatus(id: string, status: PossibilityStatus, validatedBy?: string): void {
    const possibility = this.possibilities.get(id);
    if (!possibility) return;

    possibility.status = status;
    possibility.updatedAt = new Date();
    
    if (status === 'validated') {
      possibility.validatedAt = new Date();
      possibility.validatedBy = validatedBy;
    } else if (status === 'deprecated') {
      possibility.deprecatedAt = new Date();
    }

    this.possibilities.set(id, possibility);
  }

  private generateId(): string {
    return `possibility-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCombinationDescription(capabilities: any[]): string {
    const names = capabilities.map(c => c.name).join(', ');
    return `Combines ${names} to create a new integrated capability`;
  }

  private inferOutput(capabilities: any[]): string {
    const outputTypes = new Set<string>();
    capabilities.forEach(c => c.outputTypes.forEach((t: string) => outputTypes.add(t)));
    return Array.from(outputTypes).join(', ') || 'Integrated output';
  }

  private inferUseCases(capabilities: any[]): string[] {
    // Simplified use case inference
    const useCases: string[] = [];
    const hasAudio = capabilities.some(c => c.inputTypes.includes('audio') || c.outputTypes.includes('audio'));
    const hasVideo = capabilities.some(c => c.inputTypes.includes('video') || c.outputTypes.includes('video'));
    const hasText = capabilities.some(c => c.inputTypes.includes('text') || c.outputTypes.includes('text'));
    const hasImage = capabilities.some(c => c.inputTypes.includes('image') || c.outputTypes.includes('image'));

    if (hasAudio && hasText) useCases.push('Voice interfaces', 'Transcription');
    if (hasVideo && hasText) useCases.push('Video analysis', 'Content generation');
    if (hasImage && hasText) useCases.push('Image generation', 'Visual content');
    if (hasText && capabilities.length > 2) useCases.push('Complex reasoning', 'Multi-step workflows');

    return useCases.length > 0 ? useCases : ['General purpose'];
  }

  private assessFeasibility(capabilities: any[]): any {
    // Simplified feasibility assessment
    const totalComplexity = capabilities.reduce((sum, c) => {
      const complexityMap: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };
      return sum + (complexityMap[c.estimatedResourceLevel.complexity] || 2);
    }, 0);

    const avgComplexity = totalComplexity / capabilities.length;
    const score = Math.max(0, Math.min(1, 1 - (avgComplexity - 1) / 2));

    return {
      score,
      reasoning: avgComplexity <= 1.5 
        ? 'Low complexity combination, highly feasible'
        : avgComplexity <= 2.5
        ? 'Medium complexity, feasible with proper setup'
        : 'High complexity, requires careful planning',
      deviceRequirements: {
        feasible: true,
        minRequirements: { ram: 4096, storage: 1000, gpu: false, cpuCores: 4 },
        alternatives: ['cloud-based', 'hybrid'],
      },
      humanRequirements: {
        feasible: true,
        minSkillLevel: 'intermediate' as const,
        setupComplexity: 'medium' as const,
        maintenanceComplexity: 'medium' as const,
        learningCurve: 'Moderate - requires understanding of multiple components',
      },
      resourceRequirements: {
        feasible: true,
        estimatedCost: 'free' as const,
        costBreakdown: [],
        openSourceAlternatives: capabilities.map(c => c.project),
      },
    };
  }

  private summarizeHardware(capabilities: any[]): HardwareSummary {
    const maxRam = Math.max(...capabilities.map(c => c.hardwareRequirements.recommendedRam || c.hardwareRequirements.minRam || 0));
    const needsGpu = capabilities.some(c => c.hardwareRequirements.gpuRequired);
    const maxStorage = Math.max(...capabilities.map(c => c.hardwareRequirements.minStorage || 0));

    return {
      minRam: maxRam,
      recommendedRam: maxRam * 1.5,
      gpuRecommended: needsGpu,
      minStorage: maxStorage,
    };
  }

  private summarizeSkills(capabilities: any[]): SkillSummary {
    const maxComplexity = Math.max(...capabilities.map(c => {
      const complexityMap: Record<string, number> = { 'low': 2, 'medium': 5, 'high': 8 };
      return complexityMap[c.estimatedResourceLevel.complexity] || 5;
    }));

    return {
      programming: maxComplexity,
      systemAdmin: Math.max(3, maxComplexity - 2),
      domainExpertise: Math.max(2, maxComplexity - 3),
      timeToImplement: maxComplexity <= 3 ? '1-2 weeks' : maxComplexity <= 6 ? '1-2 months' : '3-6 months',
    };
  }

  private assessPrivacyRisk(capabilities: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const hasRemote = capabilities.some(c => c.capabilities.remote);
    const hasSensitiveData = capabilities.some(c => c.privacyProfile.dataTypes.some((t: string) => 
      t.includes('personal') || t.includes('sensitive') || t.includes('private')
    ));

    if (hasRemote && hasSensitiveData) return 'high';
    if (hasRemote || hasSensitiveData) return 'medium';
    return 'low';
  }

  private assessSecurityRisk(capabilities: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const hasVulnerabilities = capabilities.some(c => 
      c.securityProfile.vulnerabilities.some((v: any) => v.status === 'open' && v.severity === 'critical')
    );
    const hasHighRisk = capabilities.some(c => c.securityProfile.riskLevel === 'high' || c.securityProfile.riskLevel === 'critical');

    if (hasVulnerabilities || hasHighRisk) return 'high';
    if (capabilities.some(c => c.securityProfile.riskLevel === 'medium')) return 'medium';
    return 'low';
  }

  private assessImpact(capabilities: any[]): any {
    return {
      benefit: 0.7,
      beneficiaries: ['General users', 'Target community'],
      environmentalImpact: 'neutral' as const,
      accessibility: 0.8,
    };
  }

  private generateTags(capabilities: any[]): string[] {
    const tags = new Set<string>();
    capabilities.forEach(c => {
      tags.add(c.capabilityType);
      c.tags?.forEach((t: string) => tags.add(t));
    });
    return Array.from(tags);
  }
}