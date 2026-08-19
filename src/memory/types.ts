// Memory Module - Type Definitions
// Stores experience, knowledge, and lessons learned

import { Intention } from '../types';
import { CreationAnalysis } from '../intelligence/types';

// ============================================================================
// EXPERIENCE RECORDS
// ============================================================================

export interface ExperienceRecord {
  id: string;
  timestamp: Date;
  intention: Intention;
  analysis: CreationAnalysis;
  outcome?: ExperienceOutcome;
  metadata: ExperienceMetadata;
}

export interface ExperienceOutcome {
  success: boolean;
  rating: number; // 0-1
  lessons: string[];
  improvements: string[];
  actualResults?: string[];
  userFeedback?: string;
}

export interface ExperienceMetadata {
  duration: number; // ms
  capabilitiesDiscovered: number;
  combinationsGenerated: number;
  confidence: number;
  canProceed: boolean;
  processingTime: number;
}

// ============================================================================
// KNOWLEDGE STORE
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  type: KnowledgeType;
  content: string;
  tags: string[];
  source: string;
  confidence: number; // 0-1
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type KnowledgeType = 
  | 'capability'
  | 'combination'
  | 'project'
  | 'lesson'
  | 'pattern'
  | 'insight'
  | 'workflow';

// ============================================================================
// PATTERN EXTRACTION
// ============================================================================

export interface Pattern {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  frequency: number;
  confidence: number; // 0-1
  examples: string[];
  relatedPatterns: string[];
  timestamp: Date;
}

export type PatternCategory = 
  | 'intention'
  | 'capability'
  | 'combination'
  | 'outcome'
  | 'failure'
  | 'success'
  | 'workflow';

// ============================================================================
// LESSONS LEARNED
// ============================================================================

export interface MemoryLesson {
  id: string;
  context: string;
  insight: string;
  confidence: number; // 0-1
  source: string;
  timestamp: Date;
  tags: string[];
  applicability: number; // 0-1
}

// ============================================================================
// MEMORY STORE INTERFACE
// ============================================================================

export interface MemoryStore {
  saveExperience(record: ExperienceRecord): Promise<void>;
  getExperience(id: string): Promise<ExperienceRecord | null>;
  getAllExperiences(): Promise<ExperienceRecord[]>;
  getExperiencesByIntention(intention: string): Promise<ExperienceRecord[]>;
  updateExperienceOutcome(id: string, outcome: ExperienceOutcome): Promise<void>;
  
  saveKnowledge(entry: KnowledgeEntry): Promise<void>;
  getKnowledge(id: string): Promise<KnowledgeEntry | null>;
  searchKnowledge(query: string, limit?: number): Promise<KnowledgeEntry[]>;
  getKnowledgeByType(type: KnowledgeType): Promise<KnowledgeEntry[]>;
  
  savePattern(pattern: Pattern): Promise<void>;
  getPatterns(category?: PatternCategory): Promise<Pattern[]>;
  findPatternsByExample(example: string): Promise<Pattern[]>;
  
  saveLesson(lesson: MemoryLesson): Promise<void>;
  getLessons(tags?: string[]): Promise<MemoryLesson[]>;
  getLessonsByContext(context: string): Promise<MemoryLesson[]>;
  
  getStats(): MemoryStats;
  
  initialize(): Promise<void>;
  clear(): Promise<void>;
}

export interface MemoryStats {
  totalExperiences: number;
  totalKnowledge: number;
  totalPatterns: number;
  totalLessons: number;
  lastUpdated: Date;
  storagePath: string;
}

// ============================================================================
// MEMORY MANAGER
// ============================================================================

export interface MemoryManager {
  store: MemoryStore;
  
  recordExperience(analysis: CreationAnalysis, intention: Intention): Promise<ExperienceRecord>;
  recordOutcome(experienceId: string, outcome: ExperienceOutcome): Promise<void>;
  
  findRelevantExperiences(intention: string, limit?: number): Promise<ExperienceRecord[]>;
  findRelevantLessons(context: string, limit?: number): Promise<MemoryLesson[]>;
  findRelevantPatterns(example: string, limit?: number): Promise<Pattern[]>;
  
  extractPatterns(experiences: ExperienceRecord[]): Promise<Pattern[]>;
  generateLessons(experiences: ExperienceRecord[]): Promise<MemoryLesson[]>;
  
  getImprovementSuggestions(intention: string): Promise<string[]>;
  
  initialize(): Promise<void>;
}