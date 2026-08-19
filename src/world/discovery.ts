// Discovery Provider Interface
// Generic interface for capability discovery from various sources

import { DiscoveryCache, CacheEntry } from './cache';

export interface DiscoveryProvider {
  name: string;
  type: 'github' | 'model-registry' | 'api-docs' | 'package-registry' | 'mcp-server' | 'official-catalog';
  
  discover(query?: string): Promise<DiscoveryResult[]>;
  fetchMetadata(capabilityId: string): Promise<CapabilityMetadata | null>;
  getUpdates(since?: Date): Promise<DiscoveryResult[]>;
  validateSource(sourceUrl: string): Promise<boolean>;
}

export interface DiscoveryResult {
  id: string;
  name: string;
  description: string;
  sourceType: DiscoveryProvider['type'];
  sourceUrl: string;
  discoveredAt: Date;
  confidence: number; // 0-1, how confident we are this is a valid capability
  metadata?: CapabilityMetadata;
}

export interface CapabilityMetadata {
  id: string;
  name: string;
  description: string;
  capabilityType: string;
  
  source: {
    type: DiscoveryProvider['type'];
    url: string;
    repository?: string;
    documentationUrl?: string;
  };
  
  provider: string;
  project: string;
  version: string;
  
  license: LicenseInfo;
  provenance: ProvenanceInfo;
  
  inputTypes: string[];
  outputTypes: string[];
  
  hardwareRequirements: HardwareRequirements;
  softwareRequirements: SoftwareRequirements;
  
  capabilities: {
    local: boolean;
    remote: boolean;
    hybrid: boolean;
  };
  
  apiRequired: boolean;
  authenticationRequired: boolean;
  
  estimatedResourceLevel: ResourceLevel;
  
  privacyProfile: PrivacyProfile;
  securityProfile: SecurityProfile;
  
  maturity: 'experimental' | 'beta' | 'stable' | 'mature';
  reliability: number; // 0-1
  
  discoveredAt: Date;
  updatedAt: Date;
  
  status: 'active' | 'deprecated' | 'abandoned' | 'unknown';
}

export interface LicenseInfo {
  type: 'open-source' | 'source-available' | 'commercial' | 'restricted' | 'unknown';
  name: string;
  spdxId?: string;
  url?: string;
  commercialUse: boolean;
  modificationAllowed: boolean;
  distributionAllowed: boolean;
  attributionRequired: boolean;
}

export interface ProvenanceInfo {
  source: string;
  sourceUrl: string;
  maintainers: string[];
  lastCommit?: Date;
  stars?: number;
  forks?: number;
  issues?: number;
  verified: boolean;
}

export interface HardwareRequirements {
  minRam?: number; // MB
  recommendedRam?: number; // MB
  minStorage?: number; // MB
  gpuRequired: boolean;
  minVram?: number; // MB
  cpuCores?: number;
  specialHardware?: string[];
}

export interface SoftwareRequirements {
  runtimes: string[];
  dependencies: string[];
  os: string[];
  containerSupport: boolean;
  specialRequirements?: string[];
}

export interface ResourceLevel {
  ram: number; // MB
  storage: number; // MB
  cpu: 'minimal' | 'standard' | 'high' | 'extreme';
  network: 'none' | 'optional' | 'required' | 'high-bandwidth';
  estimatedCost: 'free' | 'freemium' | 'paid' | 'enterprise';
  complexity: 'low' | 'medium' | 'high';
}

export interface PrivacyProfile {
  dataLocal: boolean;
  dataRemote: boolean;
  dataTypes: string[];
  retention: string;
  sharing: string[];
  concerns: string[];
  gdprCompliant?: boolean;
  hipaaCompliant?: boolean;
}

export interface SecurityProfile {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  concerns: string[];
  mitigations: string[];
  vulnerabilities: SecurityVulnerability[];
  auditStatus: 'none' | 'partial' | 'complete';
  lastAudit?: Date;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'patched' | 'mitigated';
  discoveredAt: Date;
}

export { DiscoveryCache, CacheEntry, CacheStats } from './cache';

// Discovery Manager coordinates multiple providers
export class DiscoveryManager {
  private providers: Map<string, DiscoveryProvider> = new Map();
  private cache: DiscoveryCache;

  constructor(cache: DiscoveryCache) {
    this.cache = cache;
  }

  registerProvider(provider: DiscoveryProvider): void {
    this.providers.set(provider.name, provider);
  }

  async discover(query?: string): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        const providerResults = await provider.discover(query);
        results.push(...providerResults);
      } catch (error) {
        console.error(`Discovery failed for provider ${provider.name}:`, error);
      }
    }
    
    return results;
  }

  async fetchMetadata(capabilityId: string): Promise<CapabilityMetadata | null> {
    // Try cache first
    const cached = await this.cache.get<CapabilityMetadata>(capabilityId);
    if (cached && !this.isStale(cached)) {
      return cached;
    }

    // Try each provider
    for (const provider of this.providers.values()) {
      try {
        const metadata = await provider.fetchMetadata(capabilityId);
        if (metadata) {
          await this.cache.set<CapabilityMetadata>(capabilityId, metadata);
          return metadata;
        }
      } catch (error) {
        console.error(`Metadata fetch failed for provider ${provider.name}:`, error);
      }
    }

    return null;
  }

  async getUpdates(since: Date): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        const updates = await provider.getUpdates(since);
        results.push(...updates);
      } catch (error) {
        console.error(`Update check failed for provider ${provider.name}:`, error);
      }
    }
    
    return results;
  }

  private isStale(metadata: CapabilityMetadata): boolean {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return Date.now() - metadata.updatedAt.getTime() > maxAge;
  }
}