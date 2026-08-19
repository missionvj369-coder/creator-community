// Reality Verification Engine - Type Definitions
// Ensures all claims are backed by real runtime detection

export type DetectionStatus = 'detected' | 'not_detected' | 'unavailable' | 'unknown';

export interface CPUInfo {
  model: string;
  cores: number;
  threads: number;
  architecture: string;
  status: DetectionStatus;
  source: string;
}

export interface RAMInfo {
  totalMB: number;
  availableMB: number;
  status: DetectionStatus;
  source: string;
}

export interface GPUInfo {
  vendor: string | null;
  model: string | null;
  vramMB: number | null;
  driverVersion: string | null;
  status: DetectionStatus;
  source: string;
  capabilities: string[];
}

export interface StorageInfo {
  totalMB: number;
  availableMB: number;
  status: DetectionStatus;
  source: string;
}

export interface OSInfo {
  name: string;
  version: string;
  platform: string;
  status: DetectionStatus;
  source: string;
}

export interface PythonInfo {
  version: string | null;
  path: string | null;
  status: DetectionStatus;
  source: string;
}

export interface FFmpegInfo {
  version: string | null;
  path: string | null;
  status: DetectionStatus;
  source: string;
  capabilities: { video: boolean; audio: boolean; codecs: string[] };
}

export interface RuntimeInfo {
  node: boolean;
  nodeVersion: string | null;
  python: boolean;
  pythonVersion: string | null;
  docker: boolean;
  browser: boolean;
  localLLM: boolean;
  localLLMTools: string[];
  status: DetectionStatus;
  source: string;
}

export interface ModelInfo {
  name: string;
  source: string;
  runtime: string;
  local: boolean;
  installed: boolean;
  available: boolean;
  estimatedVRAMMB: number | null;
  estimatedRAMMB: number | null;
  compatible: boolean | null;
  reason: string | null;
  status: DetectionStatus;
}

export interface RealDeviceProfile {
  timestamp: Date;
  cpu: CPUInfo;
  ram: RAMInfo;
  gpu: GPUInfo;
  storage: StorageInfo;
  os: OSInfo;
  python: PythonInfo;
  ffmpeg: FFmpegInfo;
  runtimes: RuntimeInfo;
  models: ModelInfo[];
  canRunLocal: boolean;
  canRunGPU: boolean;
  canRunCPU: boolean;
  confidence: number;
  raw: Record<string, any>;
}

export interface CapabilityRequirement {
  type: 'cpu' | 'gpu' | 'ram' | 'storage' | 'runtime' | 'model' | 'codec';
  minimum: number | string | boolean;
  recommended: number | string | boolean;
  description: string;
}

export interface CapabilityCheck {
  requirement: CapabilityRequirement;
  available: boolean;
  actual: any;
  status: DetectionStatus;
  message: string;
}

export interface CapabilityAnalysis {
  device: RealDeviceProfile;
  requirements: CapabilityRequirement[];
  checks: CapabilityCheck[];
  canRun: boolean;
  viablePaths: ExecutionPath[];
  blockedPaths: ExecutionPath[];
  resourceStatus: { cpu: string; ram: string; gpu: string; storage: string };
  recommendedPath: ExecutionPath | null;
  fallbackPaths: ExecutionPath[];
  blockingIssues: string[];
  confidence: number;
}

export type ExecutionPathType = 'local' | 'local_lightweight' | 'local_cpu' | 'gpu' | 'api_cloud' | 'hybrid';

export interface ExecutionPath {
  type: ExecutionPathType;
  available: boolean;
  status: DetectionStatus;
  capabilities: { videoGeneration: boolean; videoEditing: boolean; audioGeneration: boolean; musicGeneration: boolean; voiceGeneration: boolean; imageGeneration: boolean };
  requirements: { gpuRequired: boolean; minRAMMB: number; minStorageMB: number; models: string[]; runtimes: string[] };
  estimatedPerformance: { resolution: string | null; fps: number | null; maxDuration: number | null; quality: 'low' | 'medium' | 'high' | 'ultra' };
  reason: string | null;
  blockingIssues: string[];
  fallbackTo: ExecutionPathType | null;
}

export interface CreationStep {
  order: number;
  name: string;
  type: 'script' | 'scenes' | 'visuals' | 'voice' | 'music' | 'timeline' | 'render' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  executor: ExecutionPathType;
  command?: string;
  input?: any;
  output?: any;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  success: boolean;
  outputPath?: string;
  outputSize?: number;
  verification?: VerificationResult;
  error?: CreationError;
  retries: number;
  maxRetries: number;
}

export interface CreationPlan {
  id: string;
  projectId: string;
  executionPath: ExecutionPathType;
  steps: CreationStep[];
  allocatedResources: { ramMB: number; storageMB: number; gpuMemoryMB: number; cpuCores: number };
  status: 'planned' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  success: boolean;
  outputPath?: string;
  finalVerification?: VerificationResult;
  errors: CreationError[];
}

export type ErrorType = 'gpu_memory' | 'ram_limit' | 'disk_space' | 'model_unavailable' | 'dependency_missing' | 'ffmpeg_missing' | 'timeout' | 'invalid_output' | 'codec_error' | 'audio_error' | 'video_error' | 'unknown';

export interface CreationError {
  stage: string;
  step: number;
  errorType: ErrorType;
  message: string;
  resource?: string;
  recoverable: boolean;
  suggestedAction: string;
  timestamp: Date;
  details?: any;
}

export interface VerificationResult {
  success: boolean;
  timestamp: Date;
  fileExists: boolean;
  fileSize: number | null;
  fileSizeValid: boolean;
  hasVideoStream: boolean | null;
  hasAudioStream: boolean | null;
  duration: number | null;
  durationValid: boolean | null;
  frameCount: number | null;
  frameCountValid: boolean | null;
  codec: string | null;
  container: string | null;
  codecValid: boolean | null;
  ffmpegValid: boolean | null;
  ffmpegError: string | null;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RealityLogEvent {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'detection' | 'capability' | 'model' | 'plan' | 'create' | 'retry' | 'verify';
  message: string;
  data?: any;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number[];
  retryableErrors: ErrorType[];
}

export interface RecoveryStrategy {
  originalError: CreationError;
  strategy: 'retry' | 'fallback' | 'abort';
  fallbackPath?: ExecutionPathType;
  adjustedRequirements?: Partial<CapabilityRequirement[]>;
  message: string;
}