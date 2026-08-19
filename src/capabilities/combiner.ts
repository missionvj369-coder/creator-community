// Capability Combiner
// Combines multiple capabilities into new possibilities

import { CapabilityRecord, CapabilityGraph } from '../world/capability';

export interface CombinationResult {
  capabilities: CapabilityRecord[];
  combinedCapability: {
    name: string;
    description: string;
    expectedOutput: string[];
    useCases: string[];
  };
  feasibility: {
    score: number;
    reasoning: string;
  };
  hardwareRequirements: {
    totalRam: number;
    totalStorage: number;
    gpuRequired: boolean;
  };
}

export class CapabilityCombiner {
  private graph: CapabilityGraph;

  constructor(graph: CapabilityGraph) {
    this.graph = graph;
  }

  combine(capabilityIds: string[]): CombinationResult | null {
    const capabilities: CapabilityRecord[] = [];
    
    for (const id of capabilityIds) {
      const cap = this.graph.getCapability(id);
      if (cap) {
        capabilities.push(cap);
      }
    }

    if (capabilities.length === 0) {
      return null;
    }

    // Calculate combined resources
    const totalRam = capabilities.reduce((sum, cap) => sum + cap.estimatedResourceLevel.ram, 0);
    const totalStorage = capabilities.reduce((sum, cap) => sum + cap.estimatedResourceLevel.storage, 0);
    const gpuRequired = capabilities.some(cap => cap.hardwareRequirements.gpuRequired);

    // Generate combined capability info
    const combinedName = capabilities.map(c => c.name).join(' + ');
    const combinedDescription = `Combined capability from: ${capabilities.map(c => c.name).join(', ')}`;
    const expectedOutput = capabilities.flatMap(c => c.outputTypes);
    const useCases = capabilities.flatMap(c => c.inputTypes);

    // Calculate feasibility
    const feasibility = this.calculateFeasibility(capabilities);

    return {
      capabilities,
      combinedCapability: {
        name: combinedName,
        description: combinedDescription,
        expectedOutput,
        useCases,
      },
      feasibility,
      hardwareRequirements: {
        totalRam,
        totalStorage,
        gpuRequired,
      },
    };
  }

  private calculateFeasibility(capabilities: CapabilityRecord[]): { score: number; reasoning: string } {
    // Simple feasibility calculation
    const avgMaturity = capabilities.reduce((sum, cap) => {
      const maturityScore = { 'experimental': 0.3, 'beta': 0.6, 'stable': 0.8, 'mature': 1.0 };
      return sum + (maturityScore[cap.maturity] || 0.5);
    }, 0) / capabilities.length;

    const avgReliability = capabilities.reduce((sum, cap) => sum + cap.reliability, 0) / capabilities.length;

    const score = (avgMaturity * 0.5 + avgReliability * 0.5);
    const reasoning = score > 0.8 ? 'High feasibility combination' : 
                      score > 0.6 ? 'Medium feasibility combination' : 
                      'Low feasibility combination';

    return { score, reasoning };
  }

  findCompatibleCombinations(capabilityId: string, maxSize: number = 3): string[][] {
    const capability = this.graph.getCapability(capabilityId);
    if (!capability) {
      return [];
    }

    const combinations: string[][] = [];
    const compatible = capability.compatibleWith;

    // Find combinations of size 2 to maxSize
    for (let size = 2; size <= maxSize; size++) {
      const combos = this.getCombinations(compatible, size);
      combinations.push(...combos.map(combo => [capabilityId, ...combo]));
    }

    return combinations;
  }

  private getCombinations(arr: string[], size: number): string[][] {
    if (size === 1) {
      return arr.map(item => [item]);
    }

    const result: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const remaining = arr.slice(i + 1);
      const combos = this.getCombinations(remaining, size - 1);
      for (const combo of combos) {
        result.push([arr[i], ...combo]);
      }
    }

    return result;
  }
}