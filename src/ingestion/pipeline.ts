// Ingestion Pipeline
// Transforms discovered capabilities into trusted capabilities

import { DiscoveryResult, CapabilityMetadata, LicenseInfo, ProvenanceInfo, PrivacyProfile, SecurityProfile, ResourceLevel } from '../world/discovery';
import { Guardian } from '../guardian';
import { CapabilityGraph, CapabilityRecord, RelationshipType } from '../world/capability';
import { TrustedCapability, GuardianResult } from '../guardian/types';

export interface IngestionConfig {
  autoAcceptHighTrust: boolean;
  minTrustLevel: number;
  requireGuardianReview: boolean;
  enableDeduplication: boolean;
}

export class IngestionPipeline {
  private guardian: Guardian;
  private graph: CapabilityGraph;
  private config: IngestionConfig;

  constructor(guardian: Guardian, graph: CapabilityGraph, config?: Partial<IngestionConfig>) {
    this.guardian = guardian;
    this.graph = graph;
    this.config = {
      autoAcceptHighTrust: config?.autoAcceptHighTrust ?? true,
      minTrustLevel: config?.minTrustLevel ?? 0.7,
      requireGuardianReview: config?.requireGuardianReview ?? true,
      enableDeduplication: config?.enableDeduplication ?? true,
    };
  }

  /**
   * Ingest a discovered capability into the system
   */
  async ingest(discovery: DiscoveryResult): Promise<TrustedCapability | null> {
    try {
      // 1. Check for duplicates if enabled
      if (this.config.enableDeduplication) {
        const existing = this.findDuplicate(discovery);
        if (existing) {
          console.log(`Duplicate found for ${discovery.name}, updating existing entry`);
          return this.updateExisting(existing, discovery);
        }
      }

      // 2. Prepare Guardian input
      const guardianInput = this.prepareGuardianInput(discovery);

      // 3. Run Guardian evaluation
      const guardianResult = this.guardian.evaluate(guardianInput);

      // 4. Check if we should auto-accept
      if (this.config.autoAcceptHighTrust && guardianResult.status === 'ACCEPT') {
        console.log(`Auto-accepted ${discovery.name} (trust: ${guardianResult.trustLevel.toFixed(2)})`);
      } else if (guardianResult.status === 'REJECT') {
        console.warn(`Rejected ${discovery.name}: ${guardianResult.reasons.join(', ')}`);
        return null;
      } else {
        console.log(`Review required for ${discovery.name} (trust: ${guardianResult.trustLevel.toFixed(2)})`);
        if (this.config.requireGuardianReview) {
          // In a real system, this would queue for human review
          console.log(`Queued for review: ${discovery.name}`);
        }
      }

      // 5. Create TrustedCapability
      const trusted = this.createTrustedCapability(discovery, guardianResult);

      // 6. Add to capability graph
      this.addToGraph(trusted);

      return trusted;
    } catch (error) {
      console.error(`Failed to ingest ${discovery.name}:`, error);
      return null;
    }
  }

  /**
   * Ingest multiple capabilities in batch
   */
  async ingestBatch(discoveries: DiscoveryResult[]): Promise<TrustedCapability[]> {
    const results: TrustedCapability[] = [];
    
    for (const discovery of discoveries) {
      const trusted = await this.ingest(discovery);
      if (trusted) {
        results.push(trusted);
      }
    }

    return results;
  }

  /**
   * Find duplicate capability in graph
   */
  private findDuplicate(discovery: DiscoveryResult): CapabilityRecord | null {
    // Check by source URL
    const normalizedUrl = this.normalizeUrl(discovery.sourceUrl);
    
    for (const cap of this.graph.getAllCapabilities()) {
      const capUrl = this.normalizeUrl(cap.source.url);
      if (capUrl === normalizedUrl) {
        return cap;
      }
    }

    // Check by name and source type
    for (const cap of this.graph.getAllCapabilities()) {
      if (cap.name.toLowerCase() === discovery.name.toLowerCase() && 
          cap.source.type === discovery.sourceType) {
        return cap;
      }
    }

    return null;
  }

  /**
   * Update existing capability with new discovery data
   */
  private updateExisting(existing: CapabilityRecord, discovery: DiscoveryResult): TrustedCapability {
    // Update metadata
    existing.description = discovery.description;
    existing.updatedAt = new Date();

    // Re-run Guardian evaluation
    const guardianInput = this.prepareGuardianInput(discovery);
    const guardianResult = this.guardian.evaluate(guardianInput);
    
    // Store guardian result in a custom field (extending the record)
    (existing as any).guardianResult = guardianResult;

    return this.createTrustedCapabilityFromRecord(existing, guardianResult);
  }

  /**
   * Prepare Guardian input from DiscoveryResult
   */
  private prepareGuardianInput(discovery: DiscoveryResult): any {
    const metadata = discovery.metadata;
    
    return {
      name: discovery.name,
      description: discovery.description,
      source: discovery.sourceType,
      sourceUrl: discovery.sourceUrl,
      repositoryUrl: metadata?.source.repository,
      license: metadata?.license.name,
      language: undefined,
      topics: [],
      stars: metadata?.provenance.stars,
      forks: metadata?.provenance.forks,
      openIssues: metadata?.provenance.issues,
      updatedAt: discovery.discoveredAt,
      created_at: metadata?.discoveredAt,
      capabilityType: metadata?.capabilityType,
      classificationConfidence: 'MEDIUM' as const,
      privacyProfile: metadata?.privacyProfile,
      securityProfile: metadata?.securityProfile,
      resourceLevel: metadata?.estimatedResourceLevel,
    };
  }

  /**
   * Create TrustedCapability from DiscoveryResult and Guardian result
   */
  private createTrustedCapability(discovery: DiscoveryResult, guardianResult: GuardianResult): TrustedCapability {
    const metadata = discovery.metadata;
    const id = discovery.id;
    const now = new Date();

    const trusted: TrustedCapability = {
      id,
      name: discovery.name,
      description: discovery.description,
      source: discovery.sourceType,
      sourceUrl: discovery.sourceUrl,
      repositoryUrl: metadata?.source.repository || null,
      owner: metadata?.project || null,
      language: null,
      license: metadata?.license.name || null,
      version: metadata?.version || null,
      topics: [],
      updatedAt: discovery.discoveredAt,
      createdAt: metadata?.discoveredAt ? new Date(metadata.discoveredAt) : now,
      stars: metadata?.provenance.stars || null,
      forks: metadata?.provenance.forks || null,
      openIssues: metadata?.provenance.issues || null,
      sourceStatus: metadata?.status === 'active' ? 'active' : 
                    metadata?.status === 'deprecated' ? 'archived' : 
                    metadata?.status === 'abandoned' ? 'disabled' : 'unknown',
      capabilityType: metadata?.capabilityType || 'UNKNOWN',
      classificationConfidence: 'MEDIUM',
      privacyProfile: metadata?.privacyProfile || {
        dataLocal: true,
        dataRemote: false,
        dataTypes: [],
        retention: 'session',
        sharing: [],
        concerns: [],
      },
      securityProfile: metadata?.securityProfile || {
        riskLevel: 'low',
        concerns: [],
        mitigations: [],
        vulnerabilities: [],
        auditStatus: 'none',
      },
      resourceLevel: metadata?.estimatedResourceLevel || {
        ram: 512,
        storage: 100,
        cpu: 'minimal',
        network: 'none',
        estimatedCost: 'free',
        complexity: 'low',
      },
      guardianResult,
      discoveredAt: now,
      lastUpdated: now,
    };

    return trusted;
  }

  /**
   * Create TrustedCapability from existing CapabilityRecord
   */
  private createTrustedCapabilityFromRecord(record: CapabilityRecord, guardianResult: GuardianResult): TrustedCapability {
    const guardianResultRecord = (record as any).guardianResult || guardianResult;

    return {
      id: record.id,
      name: record.name,
      description: record.description,
      source: record.source.type,
      sourceUrl: record.source.url,
      repositoryUrl: record.source.repository || null,
      owner: record.project || null,
      language: null,
      license: record.license.name,
      version: record.version,
      topics: [],
      updatedAt: record.updatedAt,
      createdAt: record.discoveredAt,
      stars: record.provenance.stars || null,
      forks: record.provenance.forks || null,
      openIssues: record.provenance.issues || null,
      sourceStatus: record.status === 'active' ? 'active' : 
                    record.status === 'deprecated' ? 'archived' : 
                    record.status === 'abandoned' ? 'disabled' : 'unknown',
      capabilityType: record.capabilityType,
      classificationConfidence: 'MEDIUM',
      privacyProfile: record.privacyProfile as any,
      securityProfile: record.securityProfile as any,
      resourceLevel: record.estimatedResourceLevel as any,
      guardianResult: guardianResultRecord,
      discoveredAt: record.discoveredAt,
      lastUpdated: record.updatedAt,
    };
  }

  /**
   * Add trusted capability to graph
   */
  private addToGraph(trusted: TrustedCapability): void {
    const record: CapabilityRecord = {
      id: trusted.id,
      name: trusted.name,
      description: trusted.description,
      capabilityType: trusted.capabilityType,
      source: {
        type: trusted.source as any,
        url: trusted.sourceUrl,
        repository: trusted.repositoryUrl || undefined,
      },
      provider: trusted.source,
      project: trusted.owner || 'unknown',
      version: trusted.version || '1.0.0',
      license: {
        type: trusted.license ? 'open-source' : 'unknown',
        name: trusted.license || 'Unknown',
        commercialUse: true,
        modificationAllowed: true,
        distributionAllowed: true,
        attributionRequired: false,
      },
      provenance: {
        source: trusted.source,
        sourceUrl: trusted.sourceUrl,
        maintainers: [trusted.owner || 'unknown'],
        lastCommit: trusted.updatedAt,
        stars: trusted.stars || 0,
        forks: trusted.forks || 0,
        issues: trusted.openIssues || 0,
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
      privacyProfile: trusted.privacyProfile,
      securityProfile: trusted.securityProfile,
      maturity: 'experimental',
      reliability: 0.5,
      discoveredAt: trusted.discoveredAt,
      updatedAt: trusted.lastUpdated,
      status: trusted.sourceStatus === 'active' ? 'active' : 
              trusted.sourceStatus === 'archived' ? 'deprecated' : 
              trusted.sourceStatus === 'disabled' ? 'abandoned' : 'unknown',
      implements: [],
      requires: [],
      compatibleWith: [],
      alternativeTo: [],
      combinesWith: [],
    };

    this.graph.addCapability(record);
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove trailing slash, www, etc.
      let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
      normalized = normalized.replace(/\/$/, ''); // Remove trailing slash
      normalized = normalized.replace(/^https?:\/\/(www\.)?/, ''); // Remove www
      return normalized.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }
}