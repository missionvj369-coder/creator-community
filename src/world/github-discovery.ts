// GitHub Public Discovery Provider
// Discovers capabilities from public GitHub repositories
// NO API KEY REQUIRED - uses public unauthenticated access

import { DiscoveryProvider, DiscoveryResult, CapabilityMetadata } from './discovery';
import { Guardian } from '../guardian';
import { DiscoveryCache } from './cache';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  license?: {
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  archived: boolean;
  disabled: boolean;
  owner: {
    login: string;
    type: string;
  };
}

export class GitHubDiscoveryProvider implements DiscoveryProvider {
  public name: string;
  public type: 'github' = 'github';
  private guardian: Guardian;
  private cache: DiscoveryCache;
  private rateLimitRemaining: number = 60; // GitHub public API limit
  private rateLimitReset: Date = new Date();

  constructor(guardian: Guardian, cache: DiscoveryCache) {
    this.name = 'GitHub Public Discovery';
    this.guardian = guardian;
    this.cache = cache;
  }

  /**
   * Search GitHub for repositories matching a query
   * Uses public API - no authentication required
   */
  async discover(query?: string): Promise<DiscoveryResult[]> {
    if (!query) {
      return [];
    }
    const limit = 20;
    // Check rate limits
    if (!this.checkRateLimit()) {
      throw new Error('GitHub API rate limit exceeded. Please wait before retrying.');
    }

    // Check cache first
    const cacheKey = `github:search:${query}:${limit}`;
    const cached = await this.cache.get<DiscoveryResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build search URL
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-Discovery/1.0', // GitHub requires User-Agent
        },
      });

      // Update rate limit info from headers
      this.updateRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const repos: GitHubRepo[] = data.items || [];

      // Transform to DiscoveryResults
      const results: DiscoveryResult[] = repos
        .filter(repo => !repo.archived && !repo.disabled) // Skip archived/disabled repos
        .map(repo => this.normalizeRepository(repo));

      // Cache results
      await this.cache.set(cacheKey, results);

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during GitHub search');
    }
  }

  /**
   * Fetch metadata for a specific capability
   */
  async fetchMetadata(capabilityId: string): Promise<CapabilityMetadata | null> {
    // Parse capability ID to extract owner/repo
    const match = capabilityId.match(/^github-(.+)-(.+)$/);
    if (!match) {
      return null;
    }
    const [, owner, repoName] = match;
    const result = await this.getDetails(owner, repoName);
    if (!result) {
      return null;
    }
    // Transform to CapabilityMetadata (simplified)
    return this.transformToMetadata(result);
  }

  /**
   * Get updates since a specific date
   */
  async getUpdates(since?: Date): Promise<DiscoveryResult[]> {
    // For now, return empty - would need to track update history
    return [];
  }

  /**
   * Validate a source URL
   */
  async validateSource(sourceUrl: string): Promise<boolean> {
    // Check if it's a valid GitHub URL
    const match = sourceUrl.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return false;
    }
    const [, owner, repoName] = match;
    const details = await this.getDetails(owner, repoName);
    return details !== null;
  }

  /**
   * Get detailed information about a specific repository
   */
  private async getDetails(owner: string, repo: string): Promise<DiscoveryResult | null> {
    // Check rate limits
    if (!this.checkRateLimit()) {
      throw new Error('GitHub API rate limit exceeded. Please wait before retrying.');
    }

    // Check cache first
    const cacheKey = `github:repo:${owner}/${repo}`;
    const cached = await this.cache.get<DiscoveryResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
      const response = await fetch(repoUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-Discovery/1.0',
        },
      });

      // Update rate limit info
      this.updateRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const repoData: GitHubRepo = await response.json();
      const result = this.normalizeRepository(repoData);

      // Cache result
      await this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during GitHub repository fetch');
    }
  }

  /**
   * Normalize GitHub repository to DiscoveryResult
   */
  private normalizeRepository(repo: GitHubRepo): DiscoveryResult {
    const sourceUrl = `https://github.com/${repo.owner.login}/${repo.name}`;
    
    // Extract capability type from topics and description
    const capabilityType = this.classifyCapability(repo);
    const classificationConfidence = this.getClassificationConfidence(repo, capabilityType);

    return {
      id: `github-${repo.owner.login}-${repo.name}`,
      name: repo.name,
      description: repo.description || 'No description provided',
      sourceType: 'github',
      sourceUrl,
      discoveredAt: new Date(),
      confidence: classificationConfidence === 'HIGH' ? 0.9 : classificationConfidence === 'MEDIUM' ? 0.7 : 0.5,
      metadata: {
        id: `github-${repo.owner.login}-${repo.name}`,
        name: repo.name,
        description: repo.description || 'No description provided',
        capabilityType,
        source: {
          type: 'github',
          url: sourceUrl,
          repository: sourceUrl,
        },
        provider: 'github',
        project: repo.owner.login,
        version: 'latest',
        license: {
          type: repo.license ? 'open-source' : 'unknown',
          name: repo.license?.name || 'Unknown',
          spdxId: repo.license?.spdx_id,
          commercialUse: true,
          modificationAllowed: true,
          distributionAllowed: true,
          attributionRequired: false,
        },
        provenance: {
          source: 'github',
          sourceUrl,
          maintainers: [repo.owner.login],
          lastCommit: new Date(repo.updated_at),
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          verified: false,
        },
        inputTypes: [],
        outputTypes: [],
        hardwareRequirements: {
          gpuRequired: false,
        },
        softwareRequirements: {
          runtimes: [],
          dependencies: [],
          os: [],
          containerSupport: false,
        },
        capabilities: {
          local: true,
          remote: false,
          hybrid: false,
        },
        apiRequired: false,
        authenticationRequired: false,
        estimatedResourceLevel: {
          ram: 512,
          storage: 100,
          cpu: 'minimal',
          network: 'none',
          estimatedCost: 'free',
          complexity: 'low',
        },
        privacyProfile: {
          dataLocal: true,
          dataRemote: false,
          dataTypes: [],
          retention: 'session',
          sharing: [],
          concerns: [],
        },
        securityProfile: {
          riskLevel: 'low',
          concerns: [],
          mitigations: [],
          vulnerabilities: [],
          auditStatus: 'none',
        },
        maturity: 'experimental',
        reliability: 0.5,
        discoveredAt: new Date(),
        updatedAt: new Date(repo.updated_at),
        status: repo.archived ? 'deprecated' : repo.disabled ? 'abandoned' : 'active',
      },
    };
  }

  /**
   * Transform DiscoveryResult to CapabilityMetadata
   */
  private transformToMetadata(result: DiscoveryResult): CapabilityMetadata {
    if (!result.metadata) {
      throw new Error('DiscoveryResult missing metadata');
    }
    return result.metadata;
  }

  /**
   * Classify repository into capability type
   * Conservative classification - returns UNKNOWN if uncertain
   */
  private classifyCapability(repo: GitHubRepo): string {
    const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();

    // Define classification patterns
    const patterns: Array<{ type: string; keywords: string[] }> = [
      { type: 'SPEECH_TO_TEXT', keywords: ['speech-to-text', 'speech recognition', 'whisper', 'stt', 'transcribe'] },
      { type: 'TEXT_TO_SPEECH', keywords: ['text-to-speech', 'tts', 'speech synthesis', 'voice synthesis'] },
      { type: 'TRANSLATION', keywords: ['translation', 'translate', 'machine translation', 'nmt'] },
      { type: 'TEXT_GENERATION', keywords: ['llm', 'language model', 'text generation', 'gpt', 'llama', 'text-generation'] },
      { type: 'IMAGE_GENERATION', keywords: ['image generation', 'text-to-image', 'diffusion', 'stable diffusion'] },
      { type: 'VISION', keywords: ['vision', 'image recognition', 'object detection', 'computer vision'] },
      { type: 'AUDIO_PROCESSING', keywords: ['audio', 'music', 'sound', 'audio processing'] },
      { type: 'VIDEO_PROCESSING', keywords: ['video', 'video processing', 'video generation'] },
      { type: 'DATABASE', keywords: ['database', 'db', 'sql', 'nosql', 'storage'] },
      { type: 'WEB_INTERFACE', keywords: ['web', 'ui', 'frontend', 'react', 'vue', 'angular'] },
      { type: 'API', keywords: ['api', 'rest', 'graphql', 'endpoint'] },
      { type: 'AUTOMATION', keywords: ['automation', 'workflow', 'pipeline', 'ci-cd'] },
      { type: 'DATA_ANALYSIS', keywords: ['data analysis', 'analytics', 'visualization', 'charts'] },
    ];

    // Count matches for each type
    const scores: Array<{ type: string; score: number }> = patterns.map(pattern => {
      const score = pattern.keywords.reduce((acc, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      return { type: pattern.type, score };
    });

    // Find highest scoring type
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    , { type: 'UNKNOWN', score: 0 });

    // Only classify if we have reasonable confidence
    if (bestMatch.score >= 2) {
      return bestMatch.type;
    }

    return 'UNKNOWN';
  }

  /**
   * Get classification confidence level
   */
  private getClassificationConfidence(repo: GitHubRepo, capabilityType: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (capabilityType === 'UNKNOWN') {
      return 'LOW';
    }

    const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
    const typeKeywords = this.getTypeKeywords(capabilityType);
    
    const matchCount = typeKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (matchCount >= 3) {
      return 'HIGH';
    } else if (matchCount >= 2) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Get keywords for a capability type
   */
  private getTypeKeywords(type: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'SPEECH_TO_TEXT': ['speech', 'recognition', 'whisper', 'transcribe', 'stt'],
      'TEXT_TO_SPEECH': ['text-to-speech', 'tts', 'synthesis', 'voice'],
      'TRANSLATION': ['translation', 'translate', 'machine translation'],
      'TEXT_GENERATION': ['llm', 'language model', 'text generation', 'gpt', 'llama'],
      'IMAGE_GENERATION': ['image', 'diffusion', 'stable diffusion', 'text-to-image'],
      'VISION': ['vision', 'image recognition', 'object detection'],
      'DATABASE': ['database', 'db', 'sql', 'storage'],
      'WEB_INTERFACE': ['web', 'ui', 'frontend', 'react', 'vue'],
    };

    return keywordMap[type] || [];
  }

  /**
   * Assess privacy profile from repository data
   */
  private assessPrivacyProfile(repo: GitHubRepo): Record<string, unknown> {
    const description = (repo.description || '').toLowerCase();
    const topics = repo.topics.map(t => t.toLowerCase());

    return {
      localOnly: !description.includes('cloud') && !description.includes('remote'),
      remoteOnly: description.includes('cloud-only') || description.includes('remote-only'),
      hasPrivacyPolicy: description.includes('privacy') || topics.includes('privacy'),
      dataCollection: description.includes('collect') || description.includes('telemetry'),
      sendsUserDataToThirdParties: description.includes('third-party') || description.includes('analytics'),
    };
  }

  /**
   * Assess security profile from repository data
   */
  private assessSecurityProfile(repo: GitHubRepo): Record<string, unknown> {
    return {
      hasSecurityPolicy: false, // Would need to fetch SECURITY.md
      hasKnownVulnerabilities: false, // Would need to check GitHub Advisory
      criticalVulnerabilities: 0,
      openIssues: repo.open_issues_count,
      archived: repo.archived,
      disabled: repo.disabled,
    };
  }

  /**
   * Assess resource level from repository data
   */
  private assessResourceLevel(repo: GitHubRepo): Record<string, unknown> {
    // Estimate based on language and size indicators
    const language = repo.language?.toLowerCase() || 'unknown';
    
    let ramEstimate = 512; // Default
    let storageEstimate = 100; // Default MB

    if (language === 'python') {
      ramEstimate = 2048;
      storageEstimate = 500;
    } else if (language === 'javascript' || language === 'typescript') {
      ramEstimate = 512;
      storageEstimate = 100;
    } else if (language === 'rust' || language === 'go') {
      ramEstimate = 256;
      storageEstimate = 50;
    }

    return {
      estimatedRamMB: ramEstimate,
      estimatedStorageMB: storageEstimate,
      gpuRequired: false,
      confidence: 'LOW',
    };
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = new Date();
    if (now > this.rateLimitReset) {
      this.rateLimitRemaining = 60; // Reset
      return true;
    }
    return this.rateLimitRemaining > 0;
  }

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimit(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    if (reset) {
      this.rateLimitReset = new Date(parseInt(reset, 10) * 1000);
    }
  }

}
