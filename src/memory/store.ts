// File-Based Memory Store
// Persists experiences, knowledge, patterns, and lessons to JSON files

import { promises as fs } from 'fs';
import { join } from 'path';
import {
  ExperienceRecord,
  ExperienceOutcome,
  KnowledgeEntry,
  KnowledgeType,
  Pattern,
  PatternCategory,
  MemoryLesson,
  MemoryStore,
  MemoryStats,
} from './types';

export class FileMemoryStore implements MemoryStore {
  private storagePath: string;
  private experiences: Map<string, ExperienceRecord> = new Map();
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private lessons: Map<string, MemoryLesson> = new Map();
  private initialized = false;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || join(process.cwd(), 'data', 'memory');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await this.loadFromDisk();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize memory store:', error);
      throw error;
    }
  }

  // ==========================================================================
  // EXPERIENCE METHODS
  // ==========================================================================

  async saveExperience(record: ExperienceRecord): Promise<void> {
    this.experiences.set(record.id, record);
    await this.persist('experiences', record);
  }

  async getExperience(id: string): Promise<ExperienceRecord | null> {
    return this.experiences.get(id) || null;
  }

  async getAllExperiences(): Promise<ExperienceRecord[]> {
    return Array.from(this.experiences.values());
  }

  async getExperiencesByIntention(intention: string): Promise<ExperienceRecord[]> {
    const query = intention.toLowerCase();
    return Array.from(this.experiences.values()).filter(exp => {
      const raw = exp.intention.raw.toLowerCase();
      return raw.includes(query) || query.includes(raw);
    });
  }

  async updateExperienceOutcome(id: string, outcome: ExperienceOutcome): Promise<void> {
    const record = this.experiences.get(id);
    if (!record) return;

    record.outcome = outcome;
    this.experiences.set(id, record);
    await this.persist('experiences', record);
  }

  // ==========================================================================
  // KNOWLEDGE METHODS
  // ==========================================================================

  async saveKnowledge(entry: KnowledgeEntry): Promise<void> {
    this.knowledge.set(entry.id, entry);
    await this.persist('knowledge', entry);
  }

  async getKnowledge(id: string): Promise<KnowledgeEntry | null> {
    return this.knowledge.get(id) || null;
  }

  async searchKnowledge(query: string, limit = 10): Promise<KnowledgeEntry[]> {
    const queryLower = query.toLowerCase();
    const results = Array.from(this.knowledge.values())
      .filter(entry => {
        const content = entry.content.toLowerCase();
        const tags = entry.tags.join(' ').toLowerCase();
        return content.includes(queryLower) || tags.includes(queryLower);
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
    return results;
  }

  async getKnowledgeByType(type: KnowledgeType): Promise<KnowledgeEntry[]> {
    return Array.from(this.knowledge.values()).filter(entry => entry.type === type);
  }

  // ==========================================================================
  // PATTERN METHODS
  // ==========================================================================

  async savePattern(pattern: Pattern): Promise<void> {
    this.patterns.set(pattern.id, pattern);
    await this.persist('patterns', pattern);
  }

  async getPatterns(category?: PatternCategory): Promise<Pattern[]> {
    const patterns = Array.from(this.patterns.values());
    if (category) {
      return patterns.filter(p => p.category === category);
    }
    return patterns;
  }

  async findPatternsByExample(example: string): Promise<Pattern[]> {
    const exampleLower = example.toLowerCase();
    return Array.from(this.patterns.values()).filter(pattern => {
      return pattern.examples.some(ex => ex.toLowerCase().includes(exampleLower));
    });
  }

  // ==========================================================================
  // LESSON METHODS
  // ==========================================================================

  async saveLesson(lesson: MemoryLesson): Promise<void> {
    this.lessons.set(lesson.id, lesson);
    await this.persist('lessons', lesson);
  }

  async getLessons(tags?: string[]): Promise<MemoryLesson[]> {
    const lessons = Array.from(this.lessons.values());
    if (!tags || tags.length === 0) return lessons;
    return lessons.filter(lesson => 
      tags.some(tag => lesson.tags.includes(tag))
    );
  }

  async getLessonsByContext(context: string): Promise<MemoryLesson[]> {
    const contextLower = context.toLowerCase();
    return Array.from(this.lessons.values()).filter(lesson => {
      return lesson.context.toLowerCase().includes(contextLower);
    });
  }

  // ==========================================================================
  // STATS & LIFECYCLE
  // ==========================================================================

  getStats(): MemoryStats {
    return {
      totalExperiences: this.experiences.size,
      totalKnowledge: this.knowledge.size,
      totalPatterns: this.patterns.size,
      totalLessons: this.lessons.size,
      lastUpdated: new Date(),
      storagePath: this.storagePath,
    };
  }

  async clear(): Promise<void> {
    this.experiences.clear();
    this.knowledge.clear();
    this.patterns.clear();
    this.lessons.clear();
    await fs.rm(this.storagePath, { recursive: true, force: true });
    await fs.mkdir(this.storagePath, { recursive: true });
  }

  // ==========================================================================
  // PERSISTENCE HELPERS
  // ==========================================================================

  private async persist(collection: string, data: any): Promise<void> {
    const filePath = join(this.storagePath, `${collection}.json`);
    const existing = await this.readCollection(collection);
    existing[data.id] = data;
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');
  }

  private async readCollection(collection: string): Promise<Record<string, any>> {
    const filePath = join(this.storagePath, `${collection}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async loadFromDisk(): Promise<void> {
    const collections = ['experiences', 'knowledge', 'patterns', 'lessons'] as const;

    for (const collection of collections) {
      const data = await this.readCollection(collection);
      for (const [id, value] of Object.entries(data)) {
        // Convert date strings back to Date objects
        if (value.timestamp) value.timestamp = new Date(value.timestamp);
        if (value.analysis?.timestamp) value.analysis.timestamp = new Date(value.analysis.timestamp);
        if (value.analysis?.guardianAnalysis?.evaluatedAt) {
          value.analysis.guardianAnalysis.evaluatedAt = new Date(value.analysis.guardianAnalysis.evaluatedAt);
        }

        switch (collection) {
          case 'experiences':
            this.experiences.set(id, value as ExperienceRecord);
            break;
          case 'knowledge':
            this.knowledge.set(id, value as KnowledgeEntry);
            break;
          case 'patterns':
            this.patterns.set(id, value as Pattern);
            break;
          case 'lessons':
            this.lessons.set(id, value as MemoryLesson);
            break;
        }
      }
    }
  }
}

// Singleton instance for easy use
export const memoryStore = new FileMemoryStore();