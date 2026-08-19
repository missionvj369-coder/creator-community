// Human Capability Intelligence - Gradual, non-invasive capability profiling
// Infers capability from conversation, asks only high-value questions

import { HumanCapabilityProfile, HumanCapabilityLevel } from '../types';

export interface ConversationSignal {
  type: 'technical_term' | 'confidence_indicator' | 'experience_mention' | 'question_pattern' | 'time_constraint' | 'complexity_preference';
  value: string;
  confidence: number;
}

export class HumanProfiler {
  private profile: HumanCapabilityProfile;
  private signals: ConversationSignal[] = [];

  constructor() {
    this.profile = this.createDefaultProfile();
  }

  private createDefaultProfile(): HumanCapabilityProfile {
    return {
      level: 'guided', // Default to guided - safest assumption
      technicalExperience: 5,
      programmingExperience: 5,
      aiFamiliarity: 5,
      desiredGuidance: 'moderate',
      complexityTolerance: 5,
      desiredControl: 'guided',
      confidence: 0.5, // Low confidence until we learn more
      lastUpdated: new Date(),
    };
  }

  async initialize(): Promise<HumanCapabilityProfile> {
    // Start with a simple, non-intrusive question
    // In a real system, this would be presented to the user
    return this.profile;
  }

  processSignal(signal: ConversationSignal): void {
    this.signals.push(signal);
    this.updateProfile();
  }

  processMessage(message: string): void {
    const lowerMessage = message.toLowerCase();

    // Detect technical terms
    const technicalTerms = [
      'api', 'rest', 'graphql', 'database', 'sql', 'nosql', 'docker', 'kubernetes',
      'react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript',
      'git', 'github', 'deployment', 'server', 'client', 'frontend', 'backend',
      'machine learning', 'neural network', 'model', 'training', 'inference',
      'tensorflow', 'pytorch', 'llm', 'gpt', 'transformer', 'embedding'
    ];

    for (const term of technicalTerms) {
      if (lowerMessage.includes(term)) {
        this.processSignal({
          type: 'technical_term',
          value: term,
          confidence: 0.7,
        });
      }
    }

    // Detect confidence indicators
    const confidencePatterns = [
      { pattern: /i (don't|do not) (know|understand)/i, value: 'low', confidence: 0.9 },
      { pattern: /i('m| am) (not sure|confused|lost)/i, value: 'low', confidence: 0.9 },
      { pattern: /i (think|believe|guess)/i, value: 'medium', confidence: 0.7 },
      { pattern: /i know|i understand|i('m| am) familiar/i, value: 'high', confidence: 0.8 },
      { pattern: /i('ve| have) (done|built|created|worked on)/i, value: 'high', confidence: 0.8 },
      { pattern: /expert|advanced|experienced/i, value: 'expert', confidence: 0.8 },
      { pattern: /beginner|new to|just starting|no experience/i, value: 'beginner', confidence: 0.9 },
    ];

    for (const { pattern, value, confidence } of confidencePatterns) {
      if (pattern.test(message)) {
        this.processSignal({
          type: 'confidence_indicator',
          value,
          confidence,
        });
        break;
      }
    }

    // Detect experience mentions
    const experiencePatterns = [
      { pattern: /(\d+)\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i, extract: (m: RegExpMatchArray) => parseInt(m[1]) },
      { pattern: /i('ve| have) (been|worked)\s+(for|as)\s+(\d+)/i, extract: (m: RegExpMatchArray) => parseInt(m[3]) },
    ];

    for (const { pattern, extract } of experiencePatterns) {
      const match = message.match(pattern);
      if (match) {
        const years = extract(match);
        this.processSignal({
          type: 'experience_mention',
          value: `${years} years`,
          confidence: 0.8,
        });
      }
    }

    // Detect time constraints
    const timePatterns = [
      { pattern: /asap|urgent|immediately|right away/i, value: 'urgent', confidence: 0.9 },
      { pattern: /this (week|month)|soon/i, value: 'short', confidence: 0.8 },
      { pattern: /no rush|whenever|eventually/i, value: 'flexible', confidence: 0.8 },
    ];

    for (const { pattern, value, confidence } of timePatterns) {
      if (pattern.test(message)) {
        this.processSignal({
          type: 'time_constraint',
          value,
          confidence,
        });
        break;
      }
    }

    // Detect complexity preference
    const complexityPatterns = [
      { pattern: /simple|basic|minimal|easy|straightforward/i, value: 'low', confidence: 0.8 },
      { pattern: /advanced|complex|sophisticated|comprehensive/i, value: 'high', confidence: 0.8 },
      { pattern: /balanced|moderate|middle ground/i, value: 'medium', confidence: 0.8 },
    ];

    for (const { pattern, value, confidence } of complexityPatterns) {
      if (pattern.test(message)) {
        this.processSignal({
          type: 'complexity_preference',
          value,
          confidence,
        });
        break;
      }
    }
  }

  private updateProfile(): void {
    // Aggregate signals to update profile
    const technicalSignals = this.signals.filter(s => s.type === 'technical_term');
    const confidenceSignals = this.signals.filter(s => s.type === 'confidence_indicator');
    const experienceSignals = this.signals.filter(s => s.type === 'experience_mention');

    // Update technical experience based on technical terms
    if (technicalSignals.length > 0) {
      this.profile.technicalExperience = Math.min(10, this.profile.technicalExperience + technicalSignals.length * 0.5);
    }

    // Update confidence based on confidence indicators
    if (confidenceSignals.length > 0) {
      const latestConfidence = confidenceSignals[confidenceSignals.length - 1];
      if (latestConfidence.value === 'low') {
        this.profile.level = 'beginner';
        this.profile.desiredGuidance = 'detailed';
      } else if (latestConfidence.value === 'high' || latestConfidence.value === 'expert') {
        this.profile.level = latestConfidence.value === 'expert' ? 'expert' : 'intermediate';
        this.profile.desiredGuidance = 'minimal';
      } else {
        this.profile.level = 'guided';
        this.profile.desiredGuidance = 'moderate';
      }
    }

    // Update programming experience
    if (experienceSignals.length > 0) {
      const latestExp = experienceSignals[experienceSignals.length - 1];
      const years = parseInt(latestExp.value);
      if (!isNaN(years)) {
        this.profile.programmingExperience = Math.min(10, years);
      }
    }

    // Update confidence in profile
    this.profile.confidence = Math.min(1.0, this.signals.length * 0.1 + 0.5);
    this.profile.lastUpdated = new Date();
  }

  setExplicitLevel(level: HumanCapabilityLevel): void {
    this.profile.level = level;
    this.profile.confidence = 1.0;
    this.profile.lastUpdated = new Date();
  }

  setExplicitGuidance(guidance: 'minimal' | 'moderate' | 'detailed'): void {
    this.profile.desiredGuidance = guidance;
    this.profile.confidence = 1.0;
    this.profile.lastUpdated = new Date();
  }

  getProfile(): HumanCapabilityProfile {
    return { ...this.profile };
  }

  getExplanationDepth(): 'simple' | 'moderate' | 'detailed' {
    switch (this.profile.level) {
      case 'beginner':
        return 'simple';
      case 'guided':
        return 'moderate';
      case 'intermediate':
        return 'moderate';
      case 'advanced':
        return 'detailed';
      case 'expert':
        return 'detailed';
      default:
        return 'moderate';
    }
  }

  shouldShowTechnicalDetails(): boolean {
    return this.profile.level === 'advanced' || this.profile.level === 'expert';
  }

  shouldOfferAlternatives(): boolean {
    return this.profile.level === 'intermediate' || this.profile.level === 'advanced' || this.profile.level === 'expert';
  }
}