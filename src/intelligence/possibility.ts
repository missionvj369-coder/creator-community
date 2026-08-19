// 4. POSSIBILITY - Generates multiple solutions

import { Understanding, HumanContext, PossibilitySet, GeneratedPossibility, DeviceProfile } from './types';
import type { Capability } from '../types';

export class PossibilityEngine {
  private capabilities: Capability[];
  
  constructor(capabilities: Capability[]) {
    this.capabilities = capabilities;
  }
  
  generatePossibilities(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): PossibilitySet {
    const possibilities = this.generateDiversePossibilities(
      understanding,
      capabilities,
      humanContext,
      deviceProfile
    );
    
    // Categorize possibilities
    const categorized = this.categorizePossibilities(possibilities);
    
    // Calculate diversity and coverage scores
    const diversityScore = this.calculateDiversityScore(possibilities);
    const coverageScore = this.calculateCoverageScore(possibilities, understanding);
    
    return {
      possibilities,
      ...categorized,
      diversityScore,
      coverageScore,
    };
  }
  
  private generateDiversePossibilities(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility[] {
    const possibilities: GeneratedPossibility[] = [];
    const text = understanding.surfaceRequest.toLowerCase();
    
    // Generate simplest solution
    const simplest = this.generateSimplestSolution(understanding, capabilities, humanContext, deviceProfile);
    if (simplest) possibilities.push(simplest);
    
    // Generate low-resource solution
    const lowResource = this.generateLowResourceSolution(understanding, capabilities, humanContext, deviceProfile);
    if (lowResource) possibilities.push(lowResource);
    
    // Generate open-source solution
    const openSource = this.generateOpenSourceSolution(understanding, capabilities, humanContext, deviceProfile);
    if (openSource) possibilities.push(openSource);
    
    // Generate community solution
    const community = this.generateCommunitySolution(understanding, capabilities, humanContext, deviceProfile);
    if (community) possibilities.push(community);
    
    // Generate innovative combination
    const innovative = this.generateInnovativeSolution(understanding, capabilities, humanContext, deviceProfile);
    if (innovative) possibilities.push(innovative);
    
    // Generate long-term systemic solution
    const longTerm = this.generateLongTermSolution(understanding, capabilities, humanContext, deviceProfile);
    if (longTerm) possibilities.push(longTerm);
    
    return possibilities;
  }
  
  private generateSimplestSolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    // Find the simplest capability combination that addresses the need
    const simpleCapabilities = capabilities
      .filter(c => c.cost.type === 'free' && c.status === 'active')
      .slice(0, 3);
    
    if (simpleCapabilities.length === 0) return null;
    
    return {
      id: 'possibility-simplest',
      name: 'Simplest Direct Solution',
      description: `Address ${understanding.rootNeed} using the most straightforward approach with minimal components`,
      category: 'simplest',
      approach: 'Use existing tools directly without complex integration',
      capabilities: simpleCapabilities,
      estimatedComplexity: 'low',
      estimatedCost: 'free',
      estimatedTime: '1-2 weeks',
      resourceRequirements: ['minimal hardware', 'basic software tools'],
      humanSkills: ['beginner-friendly', 'minimal coding'],
      innovation: 0.2,
      feasibility: 0.9,
      reasoning: 'Simplest approach minimizes complexity and implementation time',
      scores: {
        feasibility: 0.9,
        safety: 0.8,
        privacy: 0.7,
        security: 0.7,
        cost: 1.0,
        resourceFit: 0.9,
        humanFit: 0.9,
        impact: 0.5,
        maturity: 0.8,
        evidenceQuality: 0.6,
      },
    };
  }
  
  private generateLowResourceSolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    // Filter for capabilities that work on low-end devices
    const lowResourceCaps = capabilities.filter(c => {
      const perf = c.performance;
      if (!perf) return true;
      const ram = perf.benchmarks['ram'] || 2048;
      return ram <= 2048;
    });
    
    if (lowResourceCaps.length < 2) return null;
    
    return {
      id: 'possibility-low-resource',
      name: 'Low-Resource Solution',
      description: `Address ${understanding.rootNeed} optimized for limited hardware and bandwidth`,
      category: 'low-resource',
      approach: 'Use lightweight, efficient tools that work on basic hardware',
      capabilities: lowResourceCaps.slice(0, 3),
      estimatedComplexity: 'medium',
      estimatedCost: 'free',
      estimatedTime: '2-4 weeks',
      resourceRequirements: ['low RAM (<2GB)', 'minimal storage (<1GB)', 'offline-capable'],
      humanSkills: ['intermediate', 'optimization knowledge'],
      innovation: 0.4,
      feasibility: 0.8,
      reasoning: 'Optimized for accessibility and resource efficiency',
      scores: {
        feasibility: 0.8,
        safety: 0.8,
        privacy: 0.8,
        security: 0.7,
        cost: 1.0,
        resourceFit: 1.0,
        humanFit: 0.7,
        impact: 0.6,
        maturity: 0.7,
        evidenceQuality: 0.6,
      },
    };
  }
  
  private generateOpenSourceSolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    const openSourceCaps = capabilities.filter(c => 
      c.license.includes('MIT') || 
      c.license.includes('Apache') || 
      c.license.includes('GPL') ||
      c.license.includes('open-source')
    );
    
    if (openSourceCaps.length < 2) return null;
    
    return {
      id: 'possibility-open-source',
      name: 'Open-Source Community Solution',
      description: `Address ${understanding.rootNeed} using fully open-source tools and community support`,
      category: 'open-source',
      approach: 'Leverage open-source ecosystem for transparency and community collaboration',
      capabilities: openSourceCaps.slice(0, 4),
      estimatedComplexity: 'medium',
      estimatedCost: 'free',
      estimatedTime: '1-3 months',
      resourceRequirements: ['standard hardware', 'development environment', 'community engagement'],
      humanSkills: ['intermediate', 'open-source collaboration'],
      innovation: 0.5,
      feasibility: 0.85,
      reasoning: 'Open-source provides transparency, community support, and no licensing costs',
      scores: {
        feasibility: 0.85,
        safety: 0.9,
        privacy: 0.9,
        security: 0.8,
        cost: 1.0,
        resourceFit: 0.8,
        humanFit: 0.7,
        impact: 0.7,
        maturity: 0.8,
        evidenceQuality: 0.8,
      },
    };
  }
  
  private generateCommunitySolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    const communityCaps = capabilities.filter(c => 
      c.provider.includes('community') ||
      c.cost.type === 'free'
    );
    
    return {
      id: 'possibility-community',
      name: 'Community-Led Solution',
      description: `Address ${understanding.rootNeed} through community participation and peer support`,
      category: 'community',
      approach: 'Build solution that relies on community contribution and local resources',
      capabilities: communityCaps.slice(0, 3),
      estimatedComplexity: 'medium',
      estimatedCost: 'free',
      estimatedTime: '3-6 months',
      resourceRequirements: ['community space', 'volunteer time', 'local resources'],
      humanSkills: ['community organizing', 'basic technical skills'],
      innovation: 0.6,
      feasibility: 0.7,
      reasoning: 'Community-driven approach ensures local relevance and sustainability',
      scores: {
        feasibility: 0.7,
        safety: 0.8,
        privacy: 0.9,
        security: 0.7,
        cost: 1.0,
        resourceFit: 0.7,
        humanFit: 0.8,
        impact: 0.8,
        maturity: 0.6,
        evidenceQuality: 0.7,
      },
    };
  }
  
  private generateInnovativeSolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    // Combine capabilities in novel ways
    if (capabilities.length < 3) return null;
    
    const innovativeCombo = capabilities.slice(0, 4);
    
    return {
      id: 'possibility-innovative',
      name: 'Innovative Capability Combination',
      description: `Address ${understanding.rootNeed} through novel combination of multiple capabilities`,
      category: 'innovative',
      approach: 'Combine disparate capabilities in unexpected ways to create new value',
      capabilities: innovativeCombo,
      estimatedComplexity: 'high',
      estimatedCost: 'freemium',
      estimatedTime: '2-6 months',
      resourceRequirements: ['development environment', 'testing infrastructure', 'iteration time'],
      humanSkills: ['advanced', 'integration expertise', 'creative problem-solving'],
      innovation: 0.9,
      feasibility: 0.6,
      reasoning: 'Novel combinations can create unique solutions but carry higher risk',
      scores: {
        feasibility: 0.6,
        safety: 0.7,
        privacy: 0.6,
        security: 0.6,
        cost: 0.7,
        resourceFit: 0.6,
        humanFit: 0.5,
        impact: 0.9,
        maturity: 0.5,
        evidenceQuality: 0.4,
      },
    };
  }
  
  private generateLongTermSolution(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): GeneratedPossibility | null {
    const sustainableCaps = capabilities.filter(c => 
      c.status === 'active' && 
      (c.cost.type === 'free' || c.cost.type === 'freemium')
    );
    
    return {
      id: 'possibility-long-term',
      name: 'Systemic Long-Term Solution',
      description: `Address ${understanding.rootNeed} with sustainable, scalable system design`,
      category: 'long-term',
      approach: 'Design for long-term viability, scalability, and continuous improvement',
      capabilities: sustainableCaps.slice(0, 4),
      estimatedComplexity: 'high',
      estimatedCost: 'freemium',
      estimatedTime: '6-12 months',
      resourceRequirements: ['robust infrastructure', 'maintenance plan', 'scaling strategy'],
      humanSkills: ['advanced', 'systems thinking', 'architectural design'],
      innovation: 0.7,
      feasibility: 0.65,
      reasoning: 'Long-term solutions require more upfront investment but provide lasting impact',
      scores: {
        feasibility: 0.65,
        safety: 0.8,
        privacy: 0.8,
        security: 0.8,
        cost: 0.7,
        resourceFit: 0.6,
        humanFit: 0.5,
        impact: 0.95,
        maturity: 0.7,
        evidenceQuality: 0.7,
      },
    };
  }
  
  private categorizePossibilities(possibilities: GeneratedPossibility[]): {
    simplest?: GeneratedPossibility;
    lowResource?: GeneratedPossibility;
    openSource?: GeneratedPossibility;
    community?: GeneratedPossibility;
    innovative?: GeneratedPossibility;
    longTerm?: GeneratedPossibility;
  } {
    const categorized: any = {};
    
    for (const possibility of possibilities) {
      switch (possibility.category) {
        case 'simplest':
          categorized.simplest = possibility;
          break;
        case 'low-resource':
          categorized.lowResource = possibility;
          break;
        case 'open-source':
          categorized.openSource = possibility;
          break;
        case 'community':
          categorized.community = possibility;
          break;
        case 'innovative':
          categorized.innovative = possibility;
          break;
        case 'long-term':
          categorized.longTerm = possibility;
          break;
      }
    }
    
    return categorized;
  }
  
  private calculateDiversityScore(possibilities: GeneratedPossibility[]): number {
    if (possibilities.length <= 1) return 0;
    
    // Calculate diversity based on category distribution and capability overlap
    const categories = new Set(possibilities.map(p => p.category));
    const categoryDiversity = categories.size / 6; // 6 possible categories
    
    // Calculate capability diversity
    const allCapabilities = possibilities.flatMap(p => p.capabilities.map(c => c.id));
    const uniqueCapabilities = new Set(allCapabilities);
    const capabilityDiversity = uniqueCapabilities.size / Math.max(allCapabilities.length, 1);
    
    return (categoryDiversity * 0.6 + capabilityDiversity * 0.4);
  }
  
  private calculateCoverageScore(possibilities: GeneratedPossibility[], understanding: Understanding): number {
    if (possibilities.length === 0) return 0;
    
    // Check how well possibilities address the root need
    const needKeywords = understanding.rootNeed.toLowerCase().split(' ');
    let coverageCount = 0;
    
    for (const possibility of possibilities) {
      const possibilityText = `${possibility.name} ${possibility.description}`.toLowerCase();
      const matches = needKeywords.filter(keyword => 
        keyword.length > 3 && possibilityText.includes(keyword)
      ).length;
      
      if (matches > 0) coverageCount++;
    }
    
    return Math.min(1, coverageCount / possibilities.length);
  }
}