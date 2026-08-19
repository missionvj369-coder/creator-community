// Memory Module Tests
// Verifies experience tracking, knowledge storage, pattern extraction, and lesson generation

import { FileMemoryStore } from '../src/memory/store';
import { MemoryManagerImpl, createMemoryManager } from '../src/memory/manager';
import { MemoryManager, MemoryStore, ExperienceRecord, ExperienceOutcome } from '../src/memory/types';
import { Intention } from '../src/types';
import { CreationAnalysis } from '../src/intelligence/types';

// Helper to create a mock CreationAnalysis
function createMockAnalysis(): CreationAnalysis {
  return {
    intention: { raw: 'Test intention' },
    observedIntention: {
      explicitRequest: 'Test intention',
      entities: [],
      constraints: [],
      availableResources: [],
      missingInformation: [],
      environment: [],
      urgency: 'unknown',
      desiredOutcome: 'Test outcome',
      facts: [],
      assumptions: [],
      unknowns: [],
      confidence: 0.5,
    },
    understanding: {
      rootNeed: 'Test need',
      surfaceRequest: 'Test request',
      desiredOutcome: 'Test outcome',
      constraints: [],
      stakeholders: [],
      dependencies: [],
      risks: [],
      successConditions: [],
      subProblems: [],
      confidence: 0.5,
    },
    humanContext: {
      capability: 'intermediate',
      technicalKnowledge: 5,
      accessibility: [],
      resourceLimitations: [],
      likelyFears: [],
      likelyFriction: [],
      desiredGuidance: 'moderate',
      observed: [],
      inferred: [],
      unknown: [],
      confidence: 0.5,
    },
    availableCapabilities: [
      {
        id: 'cap-1',
        name: 'Web Form Builder',
        description: 'Create web forms with validation',
        provider: 'built-in',
        type: 'tool',
        source: {
          platform: 'other',
          url: 'built-in',
          verified: true,
          lastChecked: new Date(),
        },
        license: 'MIT',
        capabilities: ['form-creation', 'validation'],
        limitations: [],
        cost: { type: 'free', details: 'No cost' },
        compatibility: { platforms: ['web'], requirements: [] },
        provenance: { attribution: 'LCI', originalAuthor: 'LCI', verified: true },
        status: 'active',
      },
    ],
    possibilities: {
      possibilities: [],
      diversityScore: 0,
      coverageScore: 0,
    },
    systemsAnalysis: {
      inputs: [],
      processes: [],
      outputs: [],
      feedbackLoops: [],
      dependencies: [],
      firstOrderEffects: [],
      secondOrderEffects: [],
      thirdOrderEffects: [],
      unintendedConsequences: [],
      failureModes: [],
      scalability: {
        currentCapacity: 'unknown',
        maxCapacity: 'unknown',
        scalingLimitations: [],
        scalingCost: 'medium',
        bottlenecks: [],
      },
      maintenance: {
        requiredMaintenance: [],
        maintenanceFrequency: 'weekly',
        maintenanceComplexity: 'medium',
        longTermViability: 0.5,
      },
      resourceConsumption: {
        compute: 'unknown',
        storage: 'unknown',
        network: 'unknown',
        energy: 'medium',
        sustainability: 0.5,
      },
      confidence: 0.5,
    },
    impactAnalysis: {
      dimensions: [],
      overallPositive: 0,
      overallNegative: 0,
      overallUncertainty: 0,
      summary: 'Test summary',
      confidence: 0.5,
    },
    guardianAnalysis: {
      status: 'REVIEW',
      trustLevel: 0.5,
      licenseStatus: 'UNKNOWN',
      securityRisk: 'MEDIUM',
      privacyRisk: 'MEDIUM',
      executionRisk: 'MEDIUM',
      dependencyRisk: 'MEDIUM',
      reasons: [],
      warnings: [],
      evidence: {},
      recommendedAction: 'Test',
      evaluatedAt: new Date(),
    },
    recommendedPossibility: null,
    projectConcept: null,
    evolutionAnalysis: {
      currentPossibility: {
        id: 'test-1',
        name: 'Test Possibility',
        description: 'Test description',
        category: 'simplest',
        approach: 'Test approach',
        capabilities: [],
        estimatedComplexity: 'low',
        estimatedCost: 'free',
        estimatedTime: '1 week',
        resourceRequirements: [],
        humanSkills: [],
        innovation: 0.5,
        feasibility: 0.5,
        reasoning: 'Test reasoning',
        scores: {
          feasibility: 0.5,
          safety: 0.5,
          privacy: 0.5,
          security: 0.5,
          cost: 0.5,
          resourceFit: 0.5,
          humanFit: 0.5,
          impact: 0.5,
          maturity: 0.5,
          evidenceQuality: 0.5,
        },
      },
      alternatives: [],
      validatedExperiences: [],
      improvements: [],
      assumptionsToRevisit: [],
      newerCapabilities: [],
      shouldEvolve: false,
      evolutionPriority: 'low',
      reasoning: 'Test reasoning',
      confidence: 0.5,
    },
    confidence: 0.5,
    unknowns: [],
    assumptions: [],
    evidence: [],
    canProceed: true,
    blockingFactors: [],
    recommendations: [],
    timestamp: new Date(),
    processingTime: 100,
  };
}

describe('Memory Module', () => {
  let store: MemoryStore;
  let manager: MemoryManager;
  let testDir: string;

  beforeEach(async () => {
    testDir = `./data/test-memory-${Date.now()}`;
    store = new FileMemoryStore(testDir);
    manager = createMemoryManager(store);
    await manager.initialize();
  });

  afterEach(async () => {
    await store.clear();
  });

  describe('Experience Recording', () => {
    it('should record an experience', async () => {
      const intention: Intention = { raw: 'I want to build a community food sharing app' };
      const analysis = createMockAnalysis();
      analysis.intention = intention;

      const record = await manager.recordExperience(analysis, intention);

      expect(record.id).toBeDefined();
      expect(record.intention.raw).toBe('I want to build a community food sharing app');
      expect(record.metadata.confidence).toBe(0.5);
      expect(record.metadata.canProceed).toBe(true);
    });

    it('should retrieve an experience by id', async () => {
      const intention: Intention = { raw: 'Test intention' };
      const analysis = createMockAnalysis();
      const record = await manager.recordExperience(analysis, intention);

      const retrieved = await store.getExperience(record.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(record.id);
    });

    it('should find experiences by intention', async () => {
      const intention1: Intention = { raw: 'I want to build a community food sharing app' };
      const intention2: Intention = { raw: 'I want to create an art installation' };
      
      await manager.recordExperience(createMockAnalysis(), intention1);
      await manager.recordExperience(createMockAnalysis(), intention2);

      const results = await store.getExperiencesByIntention('community');
      expect(results.length).toBe(1);
      expect(results[0].intention.raw).toContain('community');
    });

    it('should update experience outcome', async () => {
      const intention: Intention = { raw: 'Test intention' };
      const record = await manager.recordExperience(createMockAnalysis(), intention);

      const outcome: ExperienceOutcome = {
        success: true,
        rating: 0.9,
        lessons: ['Community engagement is key'],
        improvements: ['Add more features'],
      };

      await manager.recordOutcome(record.id, outcome);

      const updated = await store.getExperience(record.id);
      expect(updated!.outcome).toBeDefined();
      expect(updated!.outcome!.success).toBe(true);
      expect(updated!.outcome!.rating).toBe(0.9);
    });
  });

  describe('Knowledge Storage', () => {
    it('should save and retrieve knowledge', async () => {
      await store.saveKnowledge({
        id: 'know-1',
        type: 'capability',
        content: 'Web Form Builder: Create web forms with validation',
        tags: ['form-creation', 'validation'],
        source: 'test',
        confidence: 0.8,
        timestamp: new Date(),
      });

      const entry = await store.getKnowledge('know-1');
      expect(entry).not.toBeNull();
      expect(entry!.type).toBe('capability');
      expect(entry!.content).toContain('Web Form Builder');
    });

    it('should search knowledge by query', async () => {
      await store.saveKnowledge({
        id: 'know-1',
        type: 'capability',
        content: 'Web Form Builder: Create web forms with validation',
        tags: ['form-creation', 'validation'],
        source: 'test',
        confidence: 0.8,
        timestamp: new Date(),
      });

      await store.saveKnowledge({
        id: 'know-2',
        type: 'capability',
        content: 'Database: Store and query structured data',
        tags: ['data-storage', 'querying'],
        source: 'test',
        confidence: 0.7,
        timestamp: new Date(),
      });

      const results = await store.searchKnowledge('form');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('know-1');
    });

    it('should get knowledge by type', async () => {
      await store.saveKnowledge({
        id: 'know-1',
        type: 'capability',
        content: 'Test capability',
        tags: [],
        source: 'test',
        confidence: 0.5,
        timestamp: new Date(),
      });

      await store.saveKnowledge({
        id: 'know-2',
        type: 'project',
        content: 'Test project',
        tags: [],
        source: 'test',
        confidence: 0.5,
        timestamp: new Date(),
      });

      const capabilities = await store.getKnowledgeByType('capability');
      expect(capabilities.length).toBe(1);
      expect(capabilities[0].id).toBe('know-1');
    });
  });

  describe('Pattern Extraction', () => {
    it('should extract patterns from multiple experiences', async () => {
      const intention1: Intention = { raw: 'I want to help my community reduce food waste' };
      const intention2: Intention = { raw: 'I want to help my community build a garden' };
      
      const record1 = await manager.recordExperience(createMockAnalysis(), intention1);
      const record2 = await manager.recordExperience(createMockAnalysis(), intention2);

      // Add outcomes to both
      await manager.recordOutcome(record1.id, {
        success: true,
        rating: 0.8,
        lessons: ['Community engagement works'],
        improvements: [],
      });
      await manager.recordOutcome(record2.id, {
        success: true,
        rating: 0.7,
        lessons: ['Start small'],
        improvements: [],
      });

      const experiences = await store.getAllExperiences();
      const patterns = await manager.extractPatterns(experiences);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].frequency).toBeGreaterThanOrEqual(2);
    });

    it('should find patterns by example', async () => {
      const intention1: Intention = { raw: 'I want to help my community reduce food waste' };
      const intention2: Intention = { raw: 'I want to help my community build a garden' };
      
      const record1 = await manager.recordExperience(createMockAnalysis(), intention1);
      const record2 = await manager.recordExperience(createMockAnalysis(), intention2);

      await manager.recordOutcome(record1.id, {
        success: true,
        rating: 0.8,
        lessons: ['Community engagement works'],
        improvements: [],
      });
      await manager.recordOutcome(record2.id, {
        success: true,
        rating: 0.7,
        lessons: ['Start small'],
        improvements: [],
      });

      const experiences = await store.getAllExperiences();
      await manager.extractPatterns(experiences);

      const patterns = await store.findPatternsByExample('community');
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('Lesson Generation', () => {
    it('should generate lessons from successful outcomes', async () => {
      const intention: Intention = { raw: 'I want to build a community app' };
      const record = await manager.recordExperience(createMockAnalysis(), intention);

      await manager.recordOutcome(record.id, {
        success: true,
        rating: 0.9,
        lessons: ['Community engagement is key to success'],
        improvements: [],
      });

      const lessons = await store.getLessons();
      expect(lessons.length).toBe(1);
      expect(lessons[0].insight).toContain('Successful approach');
      expect(lessons[0].tags.length).toBeGreaterThan(0);
    });

    it('should generate lessons from failed outcomes', async () => {
      const intention: Intention = { raw: 'I want to build a complex system' };
      const record = await manager.recordExperience(createMockAnalysis(), intention);

      await manager.recordOutcome(record.id, {
        success: false,
        rating: 0.2,
        lessons: ['Too complex to start with'],
        improvements: ['Start simpler'],
      });

      const lessons = await store.getLessons();
      expect(lessons.length).toBe(1);
      expect(lessons[0].insight).toContain('Failed approach');
    });

    it('should find lessons by context', async () => {
      const intention: Intention = { raw: 'I want to build a community food sharing app' };
      const record = await manager.recordExperience(createMockAnalysis(), intention);

      await manager.recordOutcome(record.id, {
        success: true,
        rating: 0.9,
        lessons: ['Community engagement is key'],
        improvements: [],
      });

      const lessons = await store.getLessonsByContext('community');
      expect(lessons.length).toBe(1);
    });
  });

  describe('Improvement Suggestions', () => {
    it('should return improvement suggestions from memory', async () => {
      const intention: Intention = { raw: 'I want to build a community food sharing app' };
      const record = await manager.recordExperience(createMockAnalysis(), intention);

      await manager.recordOutcome(record.id, {
        success: true,
        rating: 0.9,
        lessons: ['Community engagement is key'],
        improvements: [],
      });

      const suggestions = await manager.getImprovementSuggestions('community food sharing');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Stats', () => {
    it('should return correct stats', async () => {
      const intention: Intention = { raw: 'Test intention' };
      await manager.recordExperience(createMockAnalysis(), intention);

      const stats = store.getStats();
      expect(stats.totalExperiences).toBe(1);
      expect(stats.totalKnowledge).toBeGreaterThan(0);
      expect(stats.storagePath).toContain('test-memory');
    });
  });
});