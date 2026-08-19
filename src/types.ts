// Core type definitions for Living Creation Intelligence

export interface Intention {
  raw: string;
  context?: {
    location?: string;
    constraints?: string[];
    resources?: string[];
    timeline?: string;
  };
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: CapabilityType;
  source: CapabilitySource;
  version?: string;
  license: string;
  dependencies?: string[];
  capabilities: string[];
  limitations: string[];
  cost: CapabilityCost;
  performance?: CapabilityPerformance;
  compatibility: CapabilityCompatibility;
  provenance: CapabilityProvenance;
  status: CapabilityStatus;
}

export type CapabilityType = 'tool' | 'model' | 'api' | 'service' | 'library' | 'framework' | 'dataset';

export interface CapabilitySource {
  platform: 'github' | 'huggingface' | 'npm' | 'pypi' | 'mcp' | 'api' | 'other';
  url: string;
  verified: boolean;
  lastChecked: Date;
}

export interface CapabilityCost {
  type: 'free' | 'freemium' | 'paid';
  details: string;
}

export interface CapabilityPerformance {
  benchmarks: Record<string, number>;
  source: string;
}

export interface CapabilityCompatibility {
  platforms: string[];
  requirements: string[];
}

export interface CapabilityProvenance {
  attribution: string;
  originalAuthor: string;
  repository?: string;
  documentation?: string;
  verified: boolean;
}

export type CapabilityStatus = 'active' | 'deprecated' | 'experimental' | 'unknown';

export interface Possibility {
  id: string;
  name: string;
  description: string;
  capabilities: Capability[];
  combination: string;
  novelty: number;
  feasibility: number;
  impact: number;
  reasoning: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  mission: string;
  architecture: string;
  requiredCapabilities: Capability[];
  executionPlan: ExecutionStep[];
  impactAnalysis: ImpactAnalysis;
  guardianAnalysis: GuardianAnalysis;
  systemsAnalysis: SystemsAnalysis;
  status: ProjectStatus;
}

export type ProjectStatus = 'proposed' | 'approved' | 'building' | 'testing' | 'deployed' | 'evolving' | 'deprecated';

export interface ExecutionStep {
  order: number;
  description: string;
  capabilities: string[];
  estimatedEffort: string;
  dependencies: number[];
}

export interface ImpactAnalysis {
  beneficiaries: string[];
  reach: number;
  depth: number;
  alignment: number;
  measurability: number;
  reasoning: string;
}

export interface GuardianAnalysis {
  constitutionalCompliance: ConstitutionalCheck[];
  overallRisk: number;
  abusePotential: string;
  privacyImpact: string;
  environmentalImpact: string;
  recommendation: 'proceed' | 'modify' | 'reconsider' | 'refuse';
  reasoning: string;
}

export interface ConstitutionalCheck {
  article: string;
  compliant: boolean;
  concerns: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemsAnalysis {
  firstOrderEffects: string[];
  secondOrderEffects: string[];
  thirdOrderEffects: string[];
  dependencies: string[];
  risks: string[];
  opportunities: string[];
}

export interface Analysis {
  understoodMission: string;
  importantUnknowns: string[];
  requiredCapabilities: string[];
  existingCapabilitiesToInvestigate: Capability[];
  possibleCapabilityCombinations: Possibility[];
  newPossibilities: Possibility[];
  projectCandidates: Project[];
  impactConsiderations: ImpactAnalysis;
  guardianConsiderations: GuardianAnalysis;
  recommendedProject: Project;
  nextBuildableStep: string;
  reasoning: string;
}

export interface Experience {
  id: string;
  timestamp: Date;
  intention: Intention;
  analysis: Analysis;
  outcome?: {
    success: boolean;
    lessons: string[];
    improvements: string[];
  };
  metadata: {
    duration: number;
    capabilitiesDiscovered: number;
    combinationsGenerated: number;
  };
}

export interface Knowledge {
  capabilities: Map<string, Capability>;
  combinations: Map<string, Possibility>;
  projects: Map<string, Project>;
  experiences: Experience[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  context: string;
  insight: string;
  confidence: number;
  source: string;
  timestamp: Date;
}

export interface EmotionalContext {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  motivations: string[];
  constraints: string[];
  hopes?: string[];
  frustrations?: string[];
  fears?: string[];
}

export interface Understanding {
  mission: string;
  actualNeed: string;
  constraints: string[];
  successCriteria: string[];
  emotionalContext: EmotionalContext;
}

// Step 2: Universal Creation Intelligence Types

export interface DeviceProfile {
  os: string;
  architecture: string;
  cpu: string;
  cpuCores: number;
  cpuThreads: number;
  ramTotal: number; // MB
  ramAvailable: number; // MB
  gpu?: string;
  gpuVendor?: string;
  vram?: number; // MB
  storageTotal: number; // MB
  storageAvailable: number; // MB
  network: NetworkProfile;
  acceleration: AccelerationSupport;
  runtimeCapabilities: RuntimeCapabilities;
  detectedCapabilities: string[];
  confidence: number; // 0-1
  timestamp: Date;
}

export interface NetworkProfile {
  type: 'unknown' | 'wifi' | 'ethernet' | 'cellular' | 'satellite';
  estimatedBandwidth?: number; // Mbps
  latency?: number; // ms
  offlineCapable: boolean;
}

export interface AccelerationSupport {
  webGL: boolean;
  webGPU: boolean;
  wasm: boolean;
  simd: boolean;
  localModels: boolean;
  containerSupport: boolean;
}

export interface RuntimeCapabilities {
  node: boolean;
  python: boolean;
  browser: boolean;
  docker: boolean;
  localLLM: boolean;
}

export type HumanCapabilityLevel = 'beginner' | 'guided' | 'intermediate' | 'advanced' | 'expert';

export interface HumanCapabilityProfile {
  level: HumanCapabilityLevel;
  technicalExperience: number; // 0-10
  programmingExperience: number; // 0-10
  aiFamiliarity: number; // 0-10
  desiredGuidance: 'minimal' | 'moderate' | 'detailed';
  preferredLanguage?: string;
  timeConstraints?: string;
  complexityTolerance: number; // 0-10
  desiredControl: 'full' | 'guided' | 'automated';
  confidence: number; // 0-1
  lastUpdated: Date;
}

export interface ResourceRequirement {
  minimal: ResourceLevel;
  standard: ResourceLevel;
  accelerated: ResourceLevel;
  highPerformance: ResourceLevel;
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

export interface ExecutionPath {
  id: string;
  name: string;
  description: string;
  resourceLevel: ResourceLevel;
  capabilities: string[];
  approach: ExecutionApproach;
  feasibility: number; // 0-1
  reasoning: string;
  securityImplications: SecurityImplications;
  privacyImplications: PrivacyImplications;
}

export type ExecutionApproach = 
  | 'browser-only'
  | 'local-tools'
  | 'lightweight-model'
  | 'hybrid-local-remote'
  | 'gpu-accelerated'
  | 'high-performance-local'
  | 'distributed-cloud';

export interface SecurityImplications {
  riskLevel: 'low' | 'medium' | 'high';
  concerns: string[];
  mitigations: string[];
  requiresSandbox: boolean;
  requiresApproval: boolean;
}

export interface PrivacyImplications {
  dataLocal: boolean;
  dataRemote: boolean;
  dataTypes: string[];
  retention: string;
  sharing: string[];
  concerns: string[];
}

export interface FeasibilityReport {
  project: string;
  humanCapability: HumanCapabilityLevel;
  deviceProfile: DeviceProfile;
  requirements: string[];
  executionPaths: ExecutionPath[];
  recommendedPath: ExecutionPath;
  alternativePaths: ExecutionPath[];
  nextStep: string;
  reasoning: string;
  timestamp: Date;
}

export interface CapabilityMatcher {
  match(
    requirements: string[],
    humanProfile: HumanCapabilityProfile,
    deviceProfile: DeviceProfile
  ): ExecutionPath[];
}