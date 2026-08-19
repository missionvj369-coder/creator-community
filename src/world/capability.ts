// Capability Record Model
// Normalized representation of a discovered capability

export interface CapabilityRecord {
  id: string;
  name: string;
  description: string;
  capabilityType: string;
  
  source: {
    type: 'github' | 'model-registry' | 'api-docs' | 'package-registry' | 'mcp-server' | 'official-catalog';
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
  
  // Graph relationships
  implements: string[]; // capability IDs this implements
  requires: string[]; // capability IDs this requires
  compatibleWith: string[]; // capability IDs this works with
  alternativeTo: string[]; // capability IDs this replaces
  combinesWith: string[]; // capability IDs this can combine with
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

// Capability Graph
export class CapabilityGraph {
  private capabilities: Map<string, CapabilityRecord> = new Map();
  private relationships: Map<string, Set<string>> = new Map();

  addCapability(capability: CapabilityRecord): void {
    this.capabilities.set(capability.id, capability);
  }

  getCapability(id: string): CapabilityRecord | undefined {
    return this.capabilities.get(id);
  }

  getAllCapabilities(): CapabilityRecord[] {
    return Array.from(this.capabilities.values());
  }

  addRelationship(fromId: string, toId: string, type: RelationshipType): void {
    const key = `${fromId}:${type}`;
    if (!this.relationships.has(key)) {
      this.relationships.set(key, new Set());
    }
    this.relationships.get(key)!.add(toId);
  }

  getRelationships(fromId: string, type: RelationshipType): string[] {
    const key = `${fromId}:${type}`;
    return Array.from(this.relationships.get(key) || []);
  }

  findCapabilitiesByType(type: string): CapabilityRecord[] {
    return this.getAllCapabilities().filter(c => c.capabilityType === type);
  }

  findCapabilitiesByInputType(inputType: string): CapabilityRecord[] {
    return this.getAllCapabilities().filter(c => c.inputTypes.includes(inputType));
  }

  findCapabilitiesByOutputType(outputType: string): CapabilityRecord[] {
    return this.getAllCapabilities().filter(c => c.outputTypes.includes(outputType));
  }

  findAlternatives(capabilityId: string): CapabilityRecord[] {
    const capability = this.getCapability(capabilityId);
    if (!capability) return [];
    
    return capability.alternativeTo
      .map(id => this.getCapability(id))
      .filter((c): c is CapabilityRecord => c !== undefined);
  }

  findCompatible(capabilityId: string): CapabilityRecord[] {
    const capability = this.getCapability(capabilityId);
    if (!capability) return [];
    
    return capability.compatibleWith
      .map(id => this.getCapability(id))
      .filter((c): c is CapabilityRecord => c !== undefined);
  }

  findCombinations(capabilityId: string): CapabilityRecord[] {
    const capability = this.getCapability(capabilityId);
    if (!capability) return [];
    
    return capability.combinesWith
      .map(id => this.getCapability(id))
      .filter((c): c is CapabilityRecord => c !== undefined);
  }
}

export type RelationshipType = 
  | 'implements'
  | 'requires'
  | 'compatible_with'
  | 'alternative_to'
  | 'combines_with';