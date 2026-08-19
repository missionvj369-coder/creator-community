// Capability Matcher - Matches requirements to available capabilities
// Uses scoring algorithms to find best capability combinations

import type { Capability } from '../types';
import type { DeviceProfile, HumanCapabilityProfile } from '../types';
import { CapabilityRegistry } from './registry';

export interface MatchRequirements {
  requiredCapabilities: string[];
  preferredCapabilities?: string[];
  minFeasibility?: number;
  maxCost?: 'free' | 'freemium' | 'paid';
  deviceProfile: DeviceProfile;
  humanProfile: HumanCapabilityProfile;
}

export interface MatchResult {
  capabilities: Capability[];
  score: number;
  reasoning: string;
  gaps: string[];
  alternatives: Capability[][];
}

export interface CombinationMatch {
  capabilities: Capability[];
  combination: string;
  feasibility: number;
  coverage: number;
  reasoning: string;
}

export class CapabilityMatcher {
  private registry: CapabilityRegistry;

  constructor(registry: CapabilityRegistry) {
    this.registry = registry;
  }

  // Match single capabilities to requirements
  matchRequirements(requirements: MatchRequirements): MatchResult[] {
    const results: MatchResult[] = [];
    const candidates = this.getCandidates(requirements);

    for (const capability of candidates) {
      const score = this.calculateMatchScore(capability, requirements);
      const gaps = this.identifyGaps(capability, requirements);
      const reasoning = this.generateReasoning(capability, score, requirements);

      results.push({
        capabilities: [capability],
        score,
        reasoning,
        gaps,
        alternatives: [],
      });
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  // Find best combination of capabilities
  findCombinations(requirements: MatchRequirements): CombinationMatch[] {
    const combinations: CombinationMatch[] = [];
    const requiredCaps = requirements.requiredCapabilities;
    
    // Get all capabilities that provide required capabilities
    const capabilitySets = requiredCaps.map(req => 
      this.registry.getByCapability(req)
    );

    // Generate combinations (cartesian product)
    const cartesian = this.cultiplication(capabilitySets);

    for (const combination of cartesian) {
      const match = this.evaluateCombination(combination, requirements);
      combinations.push(match);
    }

    // Sort by feasibility descending
    return combinations.sort((a, b) => b.feasibility - a.feasibility);
  }

  // Find best single capability for a specific need
  findBest(need: string, context: {
    deviceProfile: DeviceProfile;
    humanProfile: HumanCapabilityProfile;
    maxCost?: 'free' | 'freemium' | 'paid';
  }): MatchResult | null {
    const candidates = this.registry.search(need);
    
    if (candidates.length === 0) return null;

    const scored = candidates.map(cap => ({
      capability: cap,
      score: this.calculateCapabilityScore(cap, context),
    }));

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    return {
      capabilities: [best.capability],
      score: best.score,
      reasoning: this.generateCapabilityReasoning(best.capability, best.score),
      gaps: [],
      alternatives: scored.slice(1, 4).map(s => [s.capability]),
    };
  }

  // Private helper methods

  private getCandidates(requirements: MatchRequirements): Capability[] {
    let candidates = this.registry.getAll();

    // Filter by required capabilities
    if (requirements.requiredCapabilities.length > 0) {
      candidates = candidates.filter(cap =>
        requirements.requiredCapabilities.every(req => 
          cap.capabilities.includes(req)
        )
      );
    }

    // Filter by cost
    if (requirements.maxCost) {
      const costOrder = { 'free': 0, 'freemium': 1, 'paid': 2 };
      const maxCost = costOrder[requirements.maxCost];
      candidates = candidates.filter(cap => {
        const capCost = costOrder[cap.cost.type as keyof typeof costOrder];
        return capCost <= maxCost;
      });
    }

    // Filter by device compatibility
    candidates = candidates.filter(cap => 
      this.isDeviceCompatible(cap, requirements.deviceProfile)
    );

    // Filter by human skill level
    candidates = candidates.filter(cap =>
      this.isHumanCompatible(cap, requirements.humanProfile)
    );

    return candidates;
  }

  private calculateMatchScore(capability: Capability, requirements: MatchRequirements): number {
    let score = 0;

    // Capability coverage (40%)
    const requiredCaps = requirements.requiredCapabilities;
    const providedCaps = capability.capabilities;
    const coverage = requiredCaps.filter(req => providedCaps.includes(req)).length / requiredCaps.length;
    score += coverage * 0.4;

    // Device compatibility (25%)
    const deviceScore = this.calculateDeviceCompatibility(capability, requirements.deviceProfile);
    score += deviceScore * 0.25;

    // Human compatibility (20%)
    const humanScore = this.calculateHumanCompatibility(capability, requirements.humanProfile);
    score += humanScore * 0.2;

    // Cost efficiency (15%)
    const costScore = this.calculateCostScore(capability, requirements.maxCost);
    score += costScore * 0.15;

    return Math.min(1, Math.max(0, score));
  }

  private calculateCapabilityScore(capability: Capability, context: {
    deviceProfile: DeviceProfile;
    humanProfile: HumanCapabilityProfile;
    maxCost?: 'free' | 'freemium' | 'paid';
  }): number {
    let score = 0;

    // Device compatibility (40%)
    const deviceScore = this.calculateDeviceCompatibility(capability, context.deviceProfile);
    score += deviceScore * 0.4;

    // Human compatibility (35%)
    const humanScore = this.calculateHumanCompatibility(capability, context.humanProfile);
    score += humanScore * 0.35;

    // Cost efficiency (25%)
    const costScore = this.calculateCostScore(capability, context.maxCost);
    score += costScore * 0.25;

    return Math.min(1, Math.max(0, score));
  }

  private calculateDeviceCompatibility(capability: Capability, device: DeviceProfile): number {
    let score = 1.0;

    // Check platform compatibility
    const platformMatch = capability.compatibility.platforms.some(p =>
      device.os.toLowerCase().includes(p.toLowerCase()) ||
      p === 'any' ||
      p === 'cross-platform'
    );
    if (!platformMatch) score -= 0.3;

    // Check RAM requirements
    if (capability.performance) {
      const ramReq = capability.performance.benchmarks.ram || 0;
      if (ramReq > device.ramAvailable) {
        score -= 0.4;
      }
    }

    // Check GPU requirements
    const gpuRequired = capability.compatibility.requirements.some(req =>
      req.toLowerCase().includes('gpu')
    );
    if (gpuRequired && !device.gpu) {
      score -= 0.5;
    }

    return Math.max(0, score);
  }

  private calculateHumanCompatibility(capability: Capability, human: HumanCapabilityProfile): number {
    let score = 1.0;

    // Estimate skill requirement from complexity
    const complexityMap = { 'low': 2, 'medium': 5, 'high': 8 };
    const skillReq = complexityMap[capability.cost.type as keyof typeof complexityMap] || 5;

    // Adjust based on human skill level
    const skillGap = skillReq - human.technicalExperience;
    if (skillGap > 3) {
      score -= 0.4;
    } else if (skillGap > 1) {
      score -= 0.2;
    }

    // Check if capability provides good documentation/guidance
    if (human.desiredGuidance === 'detailed' && capability.provenance.documentation) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateCostScore(capability: Capability, maxCost?: 'free' | 'freemium' | 'paid'): number {
    const costScores = { 'free': 1.0, 'freemium': 0.7, 'paid': 0.4 };
    const capScore = costScores[capability.cost.type as keyof typeof costScores] || 0.5;

    if (!maxCost) return capScore;

    const costOrder = { 'free': 0, 'freemium': 1, 'paid': 2 };
    const max = costOrder[maxCost];
    const cap = costOrder[capability.cost.type as keyof typeof costOrder];

    return cap <= max ? capScore : 0;
  }

  private isDeviceCompatible(capability: Capability, device: DeviceProfile): boolean {
    return this.calculateDeviceCompatibility(capability, device) > 0.3;
  }

  private isHumanCompatible(capability: Capability, human: HumanCapabilityProfile): boolean {
    return this.calculateHumanCompatibility(capability, human) > 0.3;
  }

  private identifyGaps(capability: Capability, requirements: MatchRequirements): string[] {
    const gaps: string[] = [];

    // Check required capabilities
    const missingCaps = requirements.requiredCapabilities.filter(
      req => !capability.capabilities.includes(req)
    );
    if (missingCaps.length > 0) {
      gaps.push(`Missing capabilities: ${missingCaps.join(', ')}`);
    }

    // Check device compatibility
    if (!this.isDeviceCompatible(capability, requirements.deviceProfile)) {
      gaps.push('Device compatibility issues');
    }

    // Check human compatibility
    if (!this.isHumanCompatible(capability, requirements.humanProfile)) {
      gaps.push('Skill level mismatch');
    }

    return gaps;
  }

  private generateReasoning(capability: Capability, score: number, requirements: MatchRequirements): string {
    const reasons: string[] = [];

    if (score > 0.8) {
      reasons.push('Excellent match for requirements');
    } else if (score > 0.6) {
      reasons.push('Good match with minor gaps');
    } else if (score > 0.4) {
      reasons.push('Partial match, may need supplementation');
    } else {
      reasons.push('Weak match, significant gaps exist');
    }

    if (capability.cost.type === 'free') {
      reasons.push('No cost');
    }

    if (capability.compatibility.platforms.includes('cross-platform')) {
      reasons.push('Cross-platform compatible');
    }

    return reasons.join('; ');
  }

  private generateCapabilityReasoning(capability: Capability, score: number): string {
    const reasons: string[] = [];

    reasons.push(`Provides: ${capability.capabilities.slice(0, 3).join(', ')}`);
    
    if (score > 0.8) {
      reasons.push('Highly recommended');
    } else if (score > 0.6) {
      reasons.push('Good option');
    }

    if (capability.provenance.verified) {
      reasons.push('Verified source');
    }

    return reasons.join('; ');
  }

  private evaluateCombination(capabilities: Capability[], requirements: MatchRequirements): CombinationMatch {
    // Combine capabilities from combination
    const combinedCapabilities = new Set<string>();
    capabilities.forEach(cap => {
      cap.capabilities.forEach(c => combinedCapabilities.add(c));
    });

    // Calculate coverage
    const requiredCaps = requirements.requiredCapabilities;
    const covered = requiredCaps.filter(req => combinedCapabilities.has(req)).length;
    const coverage = covered / requiredCaps.length;

    // Calculate feasibility (average of individual scores)
    const scores = capabilities.map(cap => 
      this.calculateMatchScore(cap, requirements)
    );
    const feasibility = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Generate combination description
    const combination = capabilities.map(cap => cap.name).join(' + ');

    // Generate reasoning
    const reasoning = this.generateCombinationReasoning(capabilities, coverage, feasibility);

    return {
      capabilities,
      combination,
      feasibility,
      coverage,
      reasoning,
    };
  }

  private generateCombinationReasoning(capabilities: Capability[], coverage: number, feasibility: number): string {
    const reasons: string[] = [];

    reasons.push(`Combines ${capabilities.length} capabilities`);
    reasons.push(`Covers ${Math.round(coverage * 100)}% of requirements`);

    if (feasibility > 0.8) {
      reasons.push('High feasibility');
    } else if (feasibility > 0.6) {
      reasons.push('Moderate feasibility');
    }

    if (coverage === 1.0) {
      reasons.push('Full requirement coverage');
    }

    return reasons.join('; ');
  }

  private cultiplication<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    
    const [first, ...rest] = arrays;
    const restProduct = this.cultiplication(rest);
    
    return first.flatMap(item => 
      restProduct.map(combo => [item, ...combo])
    );
  }
}

export function createMatcher(registry: CapabilityRegistry): CapabilityMatcher {
  return new CapabilityMatcher(registry);
}