// Step 5: Ten Intelligences - Type Definitions

import { Intention, Capability, Possibility, Project, DeviceProfile, HumanCapabilityProfile } from '../types';

// Re-export Intention for use by intelligence modules
export { Intention };

// Re-export HumanCapabilityProfile and DeviceProfile for use by intelligence modules
export type { HumanCapabilityProfile, DeviceProfile } from '../types';

// ============================================================================
// 1. OBSERVER - Extracts facts and signals from intention
// ============================================================================

export interface ObservedIntention {
  explicitRequest: string;
  implicitObjective?: string;
  entities: string[];
  constraints: string[];
  availableResources: string[];
  missingInformation: string[];
  environment: string[];
  urgency: 'low' | 'medium' | 'high' | 'unknown';
  desiredOutcome: string;
  
  // Fact classification
  facts: string[];
  assumptions: string[];
  unknowns: string[];
  
  confidence: number; // 0-1
}

// ============================================================================
// 2. UNDERSTANDING - Transforms observation into structured problem
// ============================================================================

export interface Understanding {
  rootNeed: string;
  surfaceRequest: string;
  desiredOutcome: string;
  constraints: string[];
  stakeholders: string[];
  dependencies: string[];
  risks: string[];
  successConditions: string[];
  
  // Problem decomposition
  subProblems: SubProblem[];
  
  confidence: number;
}

export interface SubProblem {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}

// ============================================================================
// 3. EMPATHY - Models human perspective
// ============================================================================

export interface HumanContext {
  capability: HumanCapabilityLevel;
  technicalKnowledge: number; // 0-10
  accessibility: string[];
  resourceLimitations: string[];
  likelyFears: string[];
  likelyFriction: string[];
  desiredGuidance: 'minimal' | 'moderate' | 'detailed';
  
  // Classification
  observed: string[];
  inferred: string[];
  unknown: string[];
  
  confidence: number;
}

export type HumanCapabilityLevel = 'beginner' | 'guided' | 'intermediate' | 'advanced' | 'expert';

// ============================================================================
// 4. POSSIBILITY - Generates multiple solutions
// ============================================================================

export interface PossibilitySet {
  possibilities: GeneratedPossibility[];
  
  // Categorization
  simplest?: GeneratedPossibility;
  lowResource?: GeneratedPossibility;
  openSource?: GeneratedPossibility;
  community?: GeneratedPossibility;
  innovative?: GeneratedPossibility;
  longTerm?: GeneratedPossibility;
  
  diversityScore: number; // How diverse are the options
  coverageScore: number; // How well do they cover the need
}

export interface GeneratedPossibility {
  id: string;
  name: string;
  description: string;
  category: PossibilityCategory;
  approach: string;
  capabilities: Capability[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  estimatedCost: 'free' | 'freemium' | 'paid';
  estimatedTime: string;
  resourceRequirements: string[];
  humanSkills: string[];
  innovation: number; // 0-1
  feasibility: number; // 0-1
  reasoning: string;
  
  // Multi-dimensional scoring
  scores: PossibilityScores;
}

export type PossibilityCategory = 
  | 'simplest'
  | 'low-resource'
  | 'open-source'
  | 'community'
  | 'innovative'
  | 'long-term';

export interface PossibilityScores {
  feasibility: number;
  safety: number;
  privacy: number;
  security: number;
  cost: number;
  resourceFit: number;
  humanFit: number;
  impact: number;
  maturity: number;
  evidenceQuality: number;
}

// ============================================================================
// 5. CREATOR - Transforms possibility into project concept
// ============================================================================

export interface ProjectConcept {
  objective: string;
  users: string[];
  problemSolved: string;
  proposedSolution: string;
  category: string;
  estimatedCost: string;
  innovation: number;
  
  // Requirements
  requiredCapabilities: Capability[];
  requiredResources: ResourceRequirements;
  
  // Implementation
  implementationStages: ImplementationStage[];
  expectedOutputs: string[];
  dependencies: ProjectDependency[];
  
  // Assessment
  estimatedComplexity: 'low' | 'medium' | 'high';
  deviceRequirements: DeviceRequirements;
  humanSkillRequirements: HumanSkillRequirements;
  maintenance: MaintenanceAnalysis;
  
  // Metadata
  confidence: number;
  evidence: string[];
  assumptions: string[];
  unknowns: string[];
  successConditions: string[];
  accessibility: string[];
}

export interface ResourceRequirements {
  minimal: ResourceLevel;
  standard: ResourceLevel;
  accelerated: ResourceLevel;
}

export interface ResourceLevel {
  ram: number; // MB
  storage: number; // MB
  cpu: string;
  gpu?: string;
  network: string;
  estimatedCost: 'free' | 'freemium' | 'paid';
  complexity: 'low' | 'medium' | 'high';
}

export interface ImplementationStage {
  order: number;
  name: string;
  description: string;
  capabilities: string[];
  estimatedEffort: string;
  dependencies: number[];
  deliverables: string[];
}

export interface ProjectDependency {
  id: string;
  name: string;
  type: 'capability' | 'resource' | 'knowledge' | 'external';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  alternatives?: string[];
}

export interface DeviceRequirements {
  minimal: string;
  recommended: string;
  optimal: string;
  platforms: string[];
}

export interface HumanSkillRequirements {
  programming: number; // 0-10
  systemAdmin: number; // 0-10
  domainExpertise: number; // 0-10
  timeToImplement: string;
  learningCurve: 'low' | 'medium' | 'high';
}

// ============================================================================
// 6. SYSTEMS INTELLIGENCE - Evaluates real-world effects
// ============================================================================

export interface SystemsAnalysis {
  // System boundaries
  inputs: SystemElement[];
  processes: SystemElement[];
  outputs: SystemElement[];
  
  // Dynamics
  feedbackLoops: FeedbackLoop[];
  dependencies: SystemDependency[];
  
  // Effects
  firstOrderEffects: string[];
  secondOrderEffects: string[];
  thirdOrderEffects: string[];
  
  // Risk assessment
  unintendedConsequences: string[];
  failureModes: FailureMode[];
  scalability: ScalabilityAnalysis;
  maintenance: MaintenanceAnalysis;
  
  // Resource flows
  resourceConsumption: ResourceConsumption;
  
  confidence: number;
}

export interface SystemElement {
  name: string;
  description: string;
  type: 'input' | 'process' | 'output';
  source?: string;
  destination?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface FeedbackLoop {
  id: string;
  name: string;
  type: 'reinforcing' | 'balancing';
  description: string;
  elements: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SystemDependency {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'infrastructure';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  alternatives?: string[];
  failureImpact: string;
}

export interface FailureMode {
  id: string;
  name: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  detection: string;
}

export interface ScalabilityAnalysis {
  currentCapacity: string;
  maxCapacity: string;
  scalingLimitations: string[];
  scalingCost: 'low' | 'medium' | 'high';
  bottlenecks: string[];
}

export interface MaintenanceAnalysis {
  requiredMaintenance: string[];
  maintenanceFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'rarely';
  maintenanceComplexity: 'low' | 'medium' | 'high';
  longTermViability: number; // 0-1
}

export interface ResourceConsumption {
  compute: string;
  storage: string;
  network: string;
  energy: string;
  sustainability: number; // 0-1
}

// ============================================================================
// 7. IMPACT INTELLIGENCE - Evaluates effects across dimensions
// ============================================================================

export interface ImpactAnalysis {
  dimensions: ImpactDimension[];
  
  overallPositive: number; // 0-1
  overallNegative: number; // 0-1
  overallUncertainty: number; // 0-1
  
  summary: string;
  confidence: number;
}

export interface ImpactDimension {
  domain: ImpactDomain;
  positiveEffects: string[];
  negativeEffects: string[];
  uncertainty: string[];
  evidence: string[];
  confidence: number; // 0-1
}

export type ImpactDomain = 
  | 'human'
  | 'community'
  | 'economic'
  | 'environmental'
  | 'resource'
  | 'technological'
  | 'long-term';

// ============================================================================
// 8. GUARDIAN - Trust evaluation (reuses existing Guardian)
// ============================================================================

// Re-export from existing guardian module
export { GuardianResult as GuardianAnalysis, GuardianInput as ConstitutionalCheck } from '../guardian/types';

// ============================================================================
// 8.5 CHALLENGE - Tests and strengthens possibilities
// ============================================================================

export interface ChallengeResult {
  possibilityId: string;
  dimensions: ChallengeDimension[];
  weaknesses: string[];
  strengths: string[];
  overallStrength: number; // 0-1
  canProceed: boolean;
  recommendedActions: string[];
  timestamp: Date;
}

export interface ChallengeDimension {
  name: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  finding: string;
  issues: string[];
  evidence: string[];
  confidence: number; // 0-1
}

// ============================================================================
// 9. EVOLUTION - Compares and improves
// ============================================================================

export interface EvolutionAnalysis {
  currentPossibility: GeneratedPossibility;
  
  // Comparisons
  alternatives: AlternativeComparison[];
  validatedExperiences: ValidatedExperience[];
  
  // Improvements
  improvements: Improvement[];
  assumptionsToRevisit: string[];
  newerCapabilities: string[];
  
  // Recommendation
  shouldEvolve: boolean;
  evolutionPriority: 'low' | 'medium' | 'high';
  reasoning: string;
  
  confidence: number;
}

export interface AlternativeComparison {
  possibility: GeneratedPossibility;
  advantages: string[];
  disadvantages: string[];
  whenToChoose: string;
}

export interface ValidatedExperience {
  id: string;
  context: string;
  outcome: 'success' | 'partial' | 'failure';
  lessons: string[];
  applicability: number; // 0-1
}

export interface Improvement {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  reasoning: string;
}

// ============================================================================
// 10. WORLD - Capability provider (reuses existing World)
// ============================================================================

// Re-export from existing world module
export { Capability as WorldCapability } from '../types';

// ============================================================================
// INTELLIGENCE PIPELINE RESULT
// ============================================================================

export interface CreationAnalysis {
  // Pipeline stages
  intention: Intention;
  observedIntention: ObservedIntention;
  understanding: Understanding;
  humanContext: HumanContext;
  availableCapabilities: Capability[];
  possibilities: PossibilitySet;
  systemsAnalysis: SystemsAnalysis;
  impactAnalysis: ImpactAnalysis;
  guardianAnalysis: import('../guardian/types').GuardianResult;
  recommendedPossibility: GeneratedPossibility | null;
  projectConcept: ProjectConcept | null;
  evolutionAnalysis: EvolutionAnalysis;
  
  // Overall assessment
  confidence: number;
  unknowns: string[];
  assumptions: string[];
  evidence: string[];
  
  // Decision
  canProceed: boolean;
  blockingFactors: string[];
  recommendations: string[];
  
  // Metadata
  timestamp: Date;
  processingTime: number; // ms
}

// ============================================================================
// INTELLIGENCE INTERFACES
// ============================================================================

export interface Observer {
  observe(intention: Intention): ObservedIntention;
}

export interface UnderstandingEngine {
  understand(observed: ObservedIntention): Understanding;
}

export interface EmpathyEngine {
  modelHumanContext(
    observed: ObservedIntention,
    understanding: Understanding,
    humanProfile: HumanCapabilityProfile,
    deviceProfile: DeviceProfile
  ): HumanContext;
}

export interface PossibilityEngine {
  generatePossibilities(
    understanding: Understanding,
    capabilities: Capability[],
    humanContext: HumanContext,
    deviceProfile: DeviceProfile
  ): PossibilitySet;
}

export interface Creator {
  createProjectConcept(
    possibility: GeneratedPossibility,
    understanding: Understanding,
    humanContext: HumanContext
  ): ProjectConcept;
}

export interface SystemsEngine {
  analyzeSystems(projectConcept: ProjectConcept): SystemsAnalysis;
}

export interface ImpactEngine {
  analyzeImpact(projectConcept: ProjectConcept): ImpactAnalysis;
}

export interface EvolutionEngine {
  evolve(
    possibilities: PossibilitySet,
    experiences: any[] // Will be typed when memory module is implemented
  ): EvolutionAnalysis;
}
