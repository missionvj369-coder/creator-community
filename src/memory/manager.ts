// Memory Manager
// Coordinates experience recording, pattern extraction, and lesson generation

import { Intention } from '../types';
import { CreationAnalysis } from '../intelligence/types';
import {
  ExperienceRecord,
  ExperienceOutcome,
  KnowledgeEntry,
  Pattern,
  PatternCategory,
  MemoryLesson,
  MemoryStore,
  MemoryManager,
} from './types';

export class MemoryManagerImpl implements MemoryManager {
  store: MemoryStore;

  constructor(store: MemoryStore) {
    this.store = store;
  }

  async initialize(): Promise<void> {
    await this.store.initialize();
  }

  // ==========================================================================
  // RECORDING
  // ==========================================================================

  async recordExperience(analysis: CreationAnalysis, intention: Intention): Promise<ExperienceRecord> {
    const record: ExperienceRecord = {
      id: this.generateId('exp'),
      timestamp: new Date(),
      intention,
      analysis,
      metadata: {
        duration: analysis.processingTime,
        capabilitiesDiscovered: analysis.availableCapabilities.length,
        combinationsGenerated: analysis.possibilities.possibilities.length,
        confidence: analysis.confidence,
        canProceed: analysis.canProceed,
        processingTime: analysis.processingTime,
      },
    };

    await this.store.saveExperience(record);

    // Auto-extract knowledge from the analysis
    await this.extractKnowledgeFromAnalysis(analysis);

    return record;
  }

  async recordOutcome(experienceId: string, outcome: ExperienceOutcome): Promise<void> {
    await this.store.updateExperienceOutcome(experienceId, outcome);

    // Generate lessons from the outcome
    const experience = await this.store.getExperience(experienceId);
    if (experience) {
      const lessons = await this.generateLessons([experience]);
      for (const lesson of lessons) {
        await this.store.saveLesson(lesson);
      }
    }
  }

  // ==========================================================================
  // RETRIEVAL
  // ==========================================================================

  async findRelevantExperiences(intention: string, limit = 5): Promise<ExperienceRecord[]> {
    const experiences = await this.store.getExperiencesByIntention(intention);
    return experiences
      .sort((a, b) => b.metadata.confidence - a.metadata.confidence)
      .slice(0, limit);
  }

  async findRelevantLessons(context: string, limit = 5): Promise<MemoryLesson[]> {
    const lessons = await this.store.getLessonsByContext(context);
    return lessons
      .sort((a, b) => b.applicability - a.applicability)
      .slice(0, limit);
  }

  async findRelevantPatterns(example: string, limit = 5): Promise<Pattern[]> {
    const patterns = await this.store.findPatternsByExample(example);
    return patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  // ==========================================================================
  // LEARNING
  // ==========================================================================

  async extractPatterns(experiences: ExperienceRecord[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const groupedByCategory = this.groupExperiencesByCategory(experiences);

    for (const [category, group] of Object.entries(groupedByCategory)) {
      if (group.length < 2) continue; // Need at least 2 to form a pattern

      const pattern = this.createPatternFromGroup(category as PatternCategory, group);
      if (pattern) {
        patterns.push(pattern);
        await this.store.savePattern(pattern);
      }
    }

    return patterns;
  }

  async generateLessons(experiences: ExperienceRecord[]): Promise<MemoryLesson[]> {
    const lessons: MemoryLesson[] = [];

    for (const experience of experiences) {
      if (!experience.outcome) continue;

      const context = experience.intention.raw.substring(0, 100);
      const tags = this.extractTags(experience.intention.raw);

      if (experience.outcome.success) {
        lessons.push({
          id: this.generateId('lesson'),
          context,
          insight: `Successful approach: ${experience.outcome.lessons.join('; ')}`,
          confidence: experience.outcome.rating,
          source: `experience:${experience.id}`,
          timestamp: new Date(),
          tags,
          applicability: 0.8,
        });
      } else {
        lessons.push({
          id: this.generateId('lesson'),
          context,
          insight: `Failed approach - avoid: ${experience.outcome.lessons.join('; ')}`,
          confidence: 1 - experience.outcome.rating,
          source: `experience:${experience.id}`,
          timestamp: new Date(),
          tags,
          applicability: 0.9,
        });
      }
    }

    return lessons;
  }

  // ==========================================================================
  // EVOLUTION SUPPORT
  // ==========================================================================

  async getImprovementSuggestions(intention: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Find relevant experiences
    const experiences = await this.findRelevantExperiences(intention, 3);
    if (experiences.length > 0) {
      suggestions.push(`Found ${experiences.length} similar past experiences to learn from`);
    }

    // Find relevant lessons
    const lessons = await this.findRelevantLessons(intention, 3);
    for (const lesson of lessons) {
      suggestions.push(`Lesson: ${lesson.insight}`);
    }

    // Find relevant patterns
    const patterns = await this.findRelevantPatterns(intention, 3);
    for (const pattern of patterns) {
      suggestions.push(`Pattern: ${pattern.name} - ${pattern.description}`);
    }

    return suggestions;
  }

  // ==========================================================================
  // KNOWLEDGE EXTRACTION
  // ==========================================================================

  private async extractKnowledgeFromAnalysis(analysis: CreationAnalysis): Promise<void> {
    // Extract capability knowledge
    for (const capability of analysis.availableCapabilities) {
      const entry: KnowledgeEntry = {
        id: this.generateId('know'),
        type: 'capability',
        content: `${capability.name}: ${capability.description}`,
        tags: [...capability.capabilities, capability.type],
        source: capability.provider,
        confidence: 0.7,
        timestamp: new Date(),
        metadata: {
          capabilityId: capability.id,
          license: capability.license,
        },
      };
      await this.store.saveKnowledge(entry);
    }

    // Extract combination knowledge
    for (const possibility of analysis.possibilities.possibilities) {
      const entry: KnowledgeEntry = {
        id: this.generateId('know'),
        type: 'combination',
        content: `${possibility.name}: ${possibility.description}`,
        tags: [possibility.category, ...possibility.capabilities.map(c => c.name)],
        source: 'possibility-engine',
        confidence: possibility.scores.feasibility,
        timestamp: new Date(),
        metadata: {
          possibilityId: possibility.id,
          innovation: possibility.innovation,
        },
      };
      await this.store.saveKnowledge(entry);
    }

    // Extract project knowledge
    if (analysis.projectConcept) {
      const entry: KnowledgeEntry = {
        id: this.generateId('know'),
        type: 'project',
        content: `${analysis.projectConcept.objective}: ${analysis.projectConcept.proposedSolution}`,
        tags: analysis.projectConcept.users,
        source: 'creator-intelligence',
        confidence: analysis.projectConcept.confidence,
        timestamp: new Date(),
        metadata: {
          complexity: analysis.projectConcept.estimatedComplexity,
          cost: analysis.projectConcept.estimatedCost,
        },
      };
      await this.store.saveKnowledge(entry);
    }
  }

  // ==========================================================================
  // PATTERN EXTRACTION HELPERS
  // ==========================================================================

  private groupExperiencesByCategory(experiences: ExperienceRecord[]): Record<string, ExperienceRecord[]> {
    const groups: Record<string, ExperienceRecord[]> = {};

    for (const experience of experiences) {
      const category = this.determineCategory(experience);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(experience);
    }

    return groups;
  }

  private determineCategory(experience: ExperienceRecord): PatternCategory {
    const intention = experience.intention.raw.toLowerCase();
    const outcome = experience.outcome;

    if (outcome?.success) return 'success';
    if (outcome && !outcome.success) return 'failure';
    if (intention.includes('community') || intention.includes('people') || intention.includes('help')) {
      return 'intention';
    }
    if (experience.analysis.possibilities.possibilities.length > 1) {
      return 'combination';
    }
    return 'workflow';
  }

  private createPatternFromGroup(category: PatternCategory, group: ExperienceRecord[]): Pattern | null {
    const examples = group.map(exp => exp.intention.raw.substring(0, 80));
    const commonTags = this.findCommonTags(group);

    const name = this.generatePatternName(category, commonTags);
    const description = this.generatePatternDescription(category, group);

    return {
      id: this.generateId('pattern'),
      name,
      description,
      category,
      frequency: group.length,
      confidence: Math.min(0.9, 0.5 + group.length * 0.1),
      examples,
      relatedPatterns: [],
      timestamp: new Date(),
    };
  }

  private findCommonTags(experiences: ExperienceRecord[]): string[] {
    const tagCounts = new Map<string, number>();

    for (const exp of experiences) {
      const tags = this.extractTags(exp.intention.raw);
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 5);
  }

  private generatePatternName(category: PatternCategory, tags: string[]): string {
    const tagStr = tags.length > 0 ? tags[0] : 'general';
    const categoryLabels: Record<string, string> = {
      intention: 'Intention',
      capability: 'Capability',
      combination: 'Combination',
      outcome: 'Outcome',
      failure: 'Failure',
      success: 'Success',
      workflow: 'Workflow',
    };
    return `${categoryLabels[category] || 'Pattern'}: ${tagStr}`;
  }

  private generatePatternDescription(category: PatternCategory, group: ExperienceRecord[]): string {
    const successCount = group.filter(exp => exp.outcome?.success).length;
    const totalCount = group.length;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

    const descriptions: Record<string, string> = {
      intention: `Recurring intention pattern observed in ${totalCount} experiences`,
      capability: `Capability usage pattern with ${successRate.toFixed(0)}% success rate`,
      combination: `Capability combination pattern with ${successRate.toFixed(0)}% success rate`,
      outcome: `Outcome pattern with ${successRate.toFixed(0)}% success rate`,
      failure: `Failure pattern observed in ${totalCount} experiences - avoid repeating`,
      success: `Success pattern observed in ${totalCount} experiences - replicate`,
      workflow: `Workflow pattern with ${successRate.toFixed(0)}% success rate`,
    };

    return descriptions[category] || `Pattern observed in ${totalCount} experiences`;
  }

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================

  private extractTags(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
      'i', 'we', 'you', 'they', 'he', 'she', 'it', 'my', 'our', 'your',
      'want', 'need', 'create', 'build', 'make', 'help', 'using', 'that',
      'this', 'these', 'those', 'there', 'here', 'can', 'could', 'would',
      'should', 'will', 'shall', 'may', 'might', 'must', 'have', 'has',
      'had', 'been', 'being', 'was', 'were', 'are', 'is', 'am', 'do', 'does',
    ]);

    return [...new Set(
      words
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length > 3 && !stopWords.has(w))
    )].slice(0, 10);
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Factory function
export function createMemoryManager(store: MemoryStore): MemoryManager {
  return new MemoryManagerImpl(store);
}