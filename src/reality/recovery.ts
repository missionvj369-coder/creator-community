// Reality Verification Engine - Recovery & Retry Logic
// Handles failures with intelligent retry and fallback strategies

import { CreationError, ErrorType, ExecutionPathType, CreationStep, RecoveryStrategy, RetryPolicy } from './types';
import { RealityDetector } from './detector';

export class RecoveryManager {
  constructor(private detector: RealityDetector) {}

  // ============================================================================
  // MAIN RECOVERY METHOD
  // ============================================================================

  async recover(step: CreationStep, error: CreationError): Promise<RecoveryStrategy> {
    this.detector.log({ 
      level: 'warn', 
      category: 'retry', 
      message: `Recovery needed for step ${step.order} (${step.name}): ${error.message}`,
      data: { error, step }
    });

    const retryPolicy = this.getRetryPolicy(error.errorType);
    
    // Check if we should retry
    if (step.retries < retryPolicy.maxRetries && retryPolicy.retryableErrors.includes(error.errorType)) {
      const strategy: RecoveryStrategy = {
        originalError: error,
        strategy: 'retry',
        message: `Retrying step ${step.order} (attempt ${step.retries + 1}/${retryPolicy.maxRetries})`,
      };
      
      this.detector.log({ level: 'info', category: 'retry', message: strategy.message });
      return strategy;
    }

    // Find fallback path
    const fallbackPath = this.determineFallbackPath(step.executor, error);
    
    if (fallbackPath) {
      const strategy: RecoveryStrategy = {
        originalError: error,
        strategy: 'fallback',
        fallbackPath,
        message: `Falling back from ${step.executor} to ${fallbackPath}`,
      };
      
      this.detector.log({ level: 'warn', category: 'retry', message: strategy.message });
      return strategy;
    }

    // No recovery possible
    const strategy: RecoveryStrategy = {
      originalError: error,
      strategy: 'abort',
      message: `No recovery possible for step ${step.order}. Aborting.`,
    };
    
    this.detector.log({ level: 'error', category: 'retry', message: strategy.message });
    return strategy;
  }

  // ============================================================================
  // RETRY POLICIES
  // ============================================================================

  private getRetryPolicy(errorType: ErrorType): RetryPolicy {
    const basePolicy: RetryPolicy = {
      maxRetries: 3,
      backoffMs: [1000, 2000, 4000], // Exponential backoff
      retryableErrors: [],
    };

    switch (errorType) {
      case 'gpu_memory':
        return {
          maxRetries: 2,
          backoffMs: [1000, 2000],
          retryableErrors: ['gpu_memory', 'timeout'],
        };

      case 'ram_limit':
        return {
          ...basePolicy,
          maxRetries: 1,
          retryableErrors: ['ram_limit'],
        };

      case 'timeout':
        return {
          ...basePolicy,
          maxRetries: 3,
          backoffMs: [2000, 4000, 8000],
          retryableErrors: ['timeout', 'gpu_memory'],
        };

      case 'model_unavailable':
        return {
          ...basePolicy,
          maxRetries: 2,
          retryableErrors: ['model_unavailable'],
        };

      case 'dependency_missing':
        return {
          ...basePolicy,
          maxRetries: 1,
          retryableErrors: ['dependency_missing'],
        };

      case 'ffmpeg_missing':
        return {
          ...basePolicy,
          maxRetries: 0, // Don't retry, fallback immediately
          retryableErrors: [],
        };

      case 'disk_space':
        return {
          ...basePolicy,
          maxRetries: 0, // Don't retry, need user intervention
          retryableErrors: [],
        };

      case 'codec_error':
        return {
          ...basePolicy,
          maxRetries: 2,
          retryableErrors: ['codec_error', 'video_error'],
        };

      case 'video_error':
      case 'audio_error':
        return {
          ...basePolicy,
          maxRetries: 2,
          retryableErrors: ['video_error', 'audio_error', 'codec_error'],
        };

      default:
        return {
          ...basePolicy,
          maxRetries: 1,
          retryableErrors: ['unknown', 'invalid_output'],
        };
    }
  }

  // ============================================================================
  // FALLBACK PATH DETERMINATION
  // ============================================================================

  private determineFallbackPath(currentPath: ExecutionPathType, error: CreationError): ExecutionPathType | null {
    const fallbackChain: Record<ExecutionPathType, ExecutionPathType | null> = {
      'gpu': 'local_cpu',
      'local': 'local_lightweight',
      'local_cpu': 'local_lightweight',
      'local_lightweight': 'api_cloud',
      'api_cloud': null, // Last resort
      'hybrid': 'api_cloud',
    };

    // Special cases based on error type
    if (error.errorType === 'ffmpeg_missing' || error.errorType === 'codec_error') {
      // Skip local paths that require FFmpeg, go straight to API
      return 'api_cloud';
    }

    if (error.errorType === 'gpu_memory') {
      // GPU memory issues -> CPU fallback
      return 'local_cpu';
    }

    if (error.errorType === 'model_unavailable') {
      // Model issues -> API fallback
      return 'api_cloud';
    }

    // Default fallback chain
    return fallbackChain[currentPath] || null;
  }

  // ============================================================================
  // ERROR CLASSIFICATION
  // ============================================================================

  classifyError(error: any): CreationError {
    const errorMessage = error.message || error.toString() || 'Unknown error';
    const errorString = errorMessage.toLowerCase();

    let errorType: ErrorType = 'unknown';
    let recoverable = true;
    let suggestedAction = 'Retry the operation';

    // GPU memory errors
    if (errorString.includes('cuda') || errorString.includes('gpu') || errorString.includes('out of memory') || errorString.includes('cublas')) {
      errorType = 'gpu_memory';
      recoverable = true;
      suggestedAction = 'Reduce batch size or switch to CPU mode';
    }
    // RAM errors
    else if (errorString.includes('memory') || errorString.includes('ram') || errorString.includes('allocation')) {
      errorType = 'ram_limit';
      recoverable = true;
      suggestedAction = 'Free up memory or use lighter model';
    }
    // Disk space errors
    else if (errorString.includes('disk') || errorString.includes('space') || errorString.includes('no space')) {
      errorType = 'disk_space';
      recoverable = false;
      suggestedAction = 'Free up disk space';
    }
    // Model errors
    else if (errorString.includes('model') && (errorString.includes('not found') || errorString.includes('unavailable'))) {
      errorType = 'model_unavailable';
      recoverable = true;
      suggestedAction = 'Use different model or download required model';
    }
    // Dependency errors
    else if (errorString.includes('module') || errorString.includes('require') || errorString.includes('import')) {
      errorType = 'dependency_missing';
      recoverable = true;
      suggestedAction = 'Install missing dependency';
    }
    // FFmpeg errors
    else if (errorString.includes('ffmpeg') || errorString.includes('ffprobe')) {
      errorType = 'ffmpeg_missing';
      recoverable = true;
      suggestedAction = 'Install FFmpeg or use API-based processing';
    }
    // Timeout errors
    else if (errorString.includes('timeout') || errorString.includes('timed out')) {
      errorType = 'timeout';
      recoverable = true;
      suggestedAction = 'Increase timeout or use faster processing method';
    }
    // Codec errors
    else if (errorString.includes('codec') || errorString.includes('encoding')) {
      errorType = 'codec_error';
      recoverable = true;
      suggestedAction = 'Use different codec or output format';
    }
    // Video errors
    else if (errorString.includes('video') || errorString.includes('frame')) {
      errorType = 'video_error';
      recoverable = true;
      suggestedAction = 'Check video parameters and try again';
    }
    // Audio errors
    else if (errorString.includes('audio') || errorString.includes('sound')) {
      errorType = 'audio_error';
      recoverable = true;
      suggestedAction = 'Check audio parameters and try again';
    }
    // Invalid output
    else if (errorString.includes('invalid') || errorString.includes('corrupt')) {
      errorType = 'invalid_output';
      recoverable = true;
      suggestedAction = 'Regenerate output';
    }

    const creationError: CreationError = {
      stage: 'unknown',
      step: 0,
      errorType,
      message: errorMessage,
      recoverable,
      suggestedAction,
      timestamp: new Date(),
      details: error,
    };

    this.detector.log({
      level: 'warn',
      category: 'retry',
      message: `Error classified: ${errorType} (recoverable: ${recoverable})`,
      data: creationError
    });

    return creationError;
  }

  // ============================================================================
  // ADAPTIVE REQUIREMENTS
  // ============================================================================

  adjustRequirementsForFallback(
    originalRequirements: any[],
    fallbackPath: ExecutionPathType
  ): any[] {
    this.detector.log({
      level: 'info',
      category: 'retry',
      message: `Adjusting requirements for fallback path: ${fallbackPath}`
    });

    const adjusted = originalRequirements.map(req => {
      switch (fallbackPath) {
        case 'local_cpu':
          // Reduce quality requirements for CPU
          if (req.type === 'gpu') {
            return { ...req, minimum: false, recommended: false, description: 'GPU not required for CPU fallback' };
          }
          if (req.type === 'ram') {
            return { ...req, minimum: 2048, recommended: 4096 };
          }
          break;

        case 'local_lightweight':
          // Minimal requirements
          if (req.type === 'gpu') {
            return { ...req, minimum: false, recommended: false };
          }
          if (req.type === 'ram') {
            return { ...req, minimum: 1024, recommended: 2048 };
          }
          break;

        case 'api_cloud':
          // API has minimal local requirements
          if (req.type === 'gpu') {
            return { ...req, minimum: false, recommended: false };
          }
          if (req.type === 'ram') {
            return { ...req, minimum: 512, recommended: 1024 };
          }
          if (req.type === 'storage') {
            return { ...req, minimum: 256, recommended: 512 };
          }
          break;
      }

      return req;
    });

    return adjusted;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  shouldRetry(step: CreationStep, error: CreationError): boolean {
    const policy = this.getRetryPolicy(error.errorType);
    return step.retries < policy.maxRetries && policy.retryableErrors.includes(error.errorType);
  }

  getBackoffDelay(retryNumber: number, policy: RetryPolicy): number {
    if (retryNumber < policy.backoffMs.length) {
      return policy.backoffMs[retryNumber];
    }
    // Cap at maximum backoff
    return policy.backoffMs[policy.backoffMs.length - 1];
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorContext: { stage: string; step: number },
    maxRetries: number = 3
  ): Promise<{ result: T; success: boolean; attempts: number }> {
    let lastError: any;
    let attempts = 0;

    for (attempts = 0; attempts <= maxRetries; attempts++) {
      try {
        const result = await operation();
        return { result, success: true, attempts: attempts + 1 };
      } catch (error) {
        lastError = error;
        
        const creationError = this.classifyError(error);
        creationError.stage = errorContext.stage;
        creationError.step = errorContext.step;

        if (attempts < maxRetries) {
          const policy = this.getRetryPolicy(creationError.errorType);
          const delay = this.getBackoffDelay(attempts, policy);
          
          this.detector.log({
            level: 'warn',
            category: 'retry',
            message: `Attempt ${attempts + 1} failed. Retrying in ${delay}ms...`,
            data: { error: creationError, delay }
          });

          await this.sleep(delay);
        }
      }
    }

    return { result: null as any, success: false, attempts };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}