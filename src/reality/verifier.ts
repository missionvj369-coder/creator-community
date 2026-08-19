// Reality Verification Engine - Output Verifier
// Validates that generated outputs are real and valid

import { VerificationResult, ErrorType, CreationError } from './types';
import { RealityDetector } from './detector';

export class OutputVerifier {
  constructor(private detector: RealityDetector) {}

  // ============================================================================
  // MAIN VERIFICATION METHOD
  // ============================================================================

  async verifyOutput(filePath: string, expectedType: 'video' | 'audio' | 'image'): Promise<VerificationResult> {
    this.detector.log({ level: 'info', category: 'verify', message: `Starting verification: ${filePath}` });

    const result: VerificationResult = {
      success: false,
      timestamp: new Date(),
      fileExists: false,
      fileSize: null,
      fileSizeValid: false,
      hasVideoStream: null,
      hasAudioStream: null,
      duration: null,
      durationValid: null,
      frameCount: null,
      frameCountValid: null,
      codec: null,
      container: null,
      codecValid: null,
      ffmpegValid: null,
      ffmpegError: null,
      valid: false,
      errors: [],
      warnings: [],
    };

    // Check 1: File exists
    result.fileExists = await this.checkFileExists(filePath);
    if (!result.fileExists) {
      result.errors.push('File does not exist');
      this.detector.log({ level: 'error', category: 'verify', message: 'Verification failed: File does not exist' });
      return result;
    }

    // Check 2: File size
    result.fileSize = await this.getFileSize(filePath);
    result.fileSizeValid = result.fileSize !== null && result.fileSize > 0;
    if (!result.fileSizeValid) {
      result.errors.push(`Invalid file size: ${result.fileSize}`);
      this.detector.log({ level: 'error', category: 'verify', message: `Verification failed: Invalid file size ${result.fileSize}` });
      return result;
    }

    this.detector.log({ level: 'info', category: 'verify', message: `File exists, size: ${result.fileSize} bytes` });

    // Check 3: Media-specific validation
    if (expectedType === 'video') {
      await this.verifyVideo(filePath, result);
    } else if (expectedType === 'audio') {
      await this.verifyAudio(filePath, result);
    } else if (expectedType === 'image') {
      await this.verifyImage(filePath, result);
    }

    // Final verdict
    result.valid = result.errors.length === 0;
    result.success = result.valid;

    if (result.valid) {
      this.detector.log({ level: 'info', category: 'verify', message: 'Verification PASSED' });
    } else {
      this.detector.log({ level: 'error', category: 'verify', message: `Verification FAILED: ${result.errors.join(', ')}` });
    }

    return result;
  }

  // ============================================================================
  // FILE CHECKS
  // ============================================================================

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getFileSize(filePath: string): Promise<number | null> {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // VIDEO VERIFICATION
  // ============================================================================

  private async verifyVideo(filePath: string, result: VerificationResult): Promise<void> {
    this.detector.log({ level: 'info', category: 'verify', message: 'Verifying video file...' });

    // Try FFmpeg validation
    const ffmpegResult = await this.verifyWithFFmpeg(filePath, 'video');
    result.ffmpegValid = ffmpegResult.valid;
    result.ffmpegError = ffmpegResult.error;

    if (ffmpegResult.valid && ffmpegResult.data) {
      result.hasVideoStream = ffmpegResult.data.hasVideo;
      result.hasAudioStream = ffmpegResult.data.hasAudio;
      result.duration = ffmpegResult.data.duration;
      result.codec = ffmpegResult.data.videoCodec;
      result.container = ffmpegResult.data.container;

      // Validate duration
      result.durationValid = result.duration !== null && result.duration > 0;
      if (!result.durationValid) {
        result.errors.push(`Invalid duration: ${result.duration}`);
      }

      // Validate video stream
      if (!result.hasVideoStream) {
        result.errors.push('No video stream found');
      }

      // Validate frame count (if available)
      if (ffmpegResult.data.frameCount !== undefined && ffmpegResult.data.frameCount !== null) {
        const frameCount = ffmpegResult.data.frameCount;
        result.frameCount = frameCount;
        result.frameCountValid = frameCount > 0;
        if (!result.frameCountValid) {
          result.errors.push(`Invalid frame count: ${frameCount}`);
        }
      }

      // Validate codec
      result.codecValid = result.codec !== null;
      if (!result.codecValid) {
        result.warnings.push('Could not determine video codec');
      }

      this.detector.log({ 
        level: 'info', 
        category: 'verify', 
        message: `Video verified: ${result.duration}s, ${result.codec}, hasAudio: ${result.hasAudioStream}`,
        data: ffmpegResult.data
      });
    } else if (!ffmpegResult.valid) {
      result.errors.push(`FFmpeg validation failed: ${ffmpegResult.error}`);
      this.detector.log({ level: 'error', category: 'verify', message: `FFmpeg validation failed: ${ffmpegResult.error}` });
    }
  }

  // ============================================================================
  // AUDIO VERIFICATION
  // ============================================================================

  private async verifyAudio(filePath: string, result: VerificationResult): Promise<void> {
    this.detector.log({ level: 'info', category: 'verify', message: 'Verifying audio file...' });

    const ffmpegResult = await this.verifyWithFFmpeg(filePath, 'audio');
    result.ffmpegValid = ffmpegResult.valid;
    result.ffmpegError = ffmpegResult.error;

    if (ffmpegResult.valid && ffmpegResult.data) {
      result.hasAudioStream = ffmpegResult.data.hasAudio;
      result.duration = ffmpegResult.data.duration;
      result.codec = ffmpegResult.data.audioCodec;

      // Validate duration
      result.durationValid = result.duration !== null && result.duration > 0;
      if (!result.durationValid) {
        result.errors.push(`Invalid duration: ${result.duration}`);
      }

      // Validate audio stream
      if (!result.hasAudioStream) {
        result.errors.push('No audio stream found');
      }

      this.detector.log({ 
        level: 'info', 
        category: 'verify', 
        message: `Audio verified: ${result.duration}s, ${result.codec}`,
        data: ffmpegResult.data
      });
    } else if (!ffmpegResult.valid) {
      result.errors.push(`FFmpeg validation failed: ${ffmpegResult.error}`);
    }
  }

  // ============================================================================
  // IMAGE VERIFICATION
  // ============================================================================

  private async verifyImage(filePath: string, result: VerificationResult): Promise<void> {
    this.detector.log({ level: 'info', category: 'verify', message: 'Verifying image file...' });

    // Basic image validation - check file extension and try to read header
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const extension = filePath.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    
    if (!validExtensions.includes(extension)) {
      result.warnings.push(`Unusual image extension: ${extension}`);
    }

    // Try to read file header
    try {
      const fs = require('fs').promises;
      const buffer = Buffer.alloc(12);
      const fd = await fs.open(filePath, 'r');
      await fd.read(buffer, 0, 12, 0);
      await fd.close();

      // Check magic numbers
      const isValidImage = 
        (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) || // JPEG
        (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) || // PNG
        (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) || // GIF
        (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46); // WEBP

      if (!isValidImage) {
        result.errors.push('Invalid image file header');
      } else {
        this.detector.log({ level: 'info', category: 'verify', message: 'Image header valid' });
      }
    } catch (error) {
      result.errors.push(`Could not read image file: ${error}`);
    }
  }

  // ============================================================================
  // FFMPEG VALIDATION
  // ============================================================================

  private async verifyWithFFmpeg(filePath: string, type: 'video' | 'audio'): Promise<{ valid: boolean; error: string | null; data: any }> {
    try {
      const { execSync } = require('child_process');
      
      // Run ffprobe to get media information
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const output = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      
      const info = JSON.parse(output);
      
      // Extract video stream
      const videoStream = info.streams?.find((s: any) => s.codec_type === 'video');
      const audioStream = info.streams?.find((s: any) => s.codec_type === 'audio');
      
      const data: any = {
        hasVideo: !!videoStream,
        hasAudio: !!audioStream,
        duration: parseFloat(info.format?.duration || '0'),
        container: info.format?.format_name || null,
        videoCodec: videoStream?.codec_name || null,
        audioCodec: audioStream?.codec_name || null,
        frameCount: videoStream?.nb_frames ? parseInt(videoStream.nb_frames, 10) : undefined,
      };

      // Validate based on type
      if (type === 'video' && !data.hasVideo) {
        return { valid: false, error: 'No video stream found', data };
      }
      
      if (type === 'audio' && !data.hasAudio) {
        return { valid: false, error: 'No audio stream found', data };
      }

      if (data.duration <= 0) {
        return { valid: false, error: 'Invalid duration', data };
      }

      return { valid: true, error: null, data };
    } catch (error) {
      // FFmpeg not available or file invalid
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'FFmpeg validation failed',
        data: null 
      };
    }
  }

  // ============================================================================
  // QUICK VALIDATION
  // ============================================================================

  async quickCheck(filePath: string): Promise<boolean> {
    const exists = await this.checkFileExists(filePath);
    if (!exists) return false;

    const size = await this.getFileSize(filePath);
    return size !== null && size > 0;
  }
}