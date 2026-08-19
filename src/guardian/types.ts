// Guardian Types

import { PrivacyProfile, SecurityProfile } from '../world/capability';

export type TrustStatus = 'ACCEPT' | 'REVIEW' | 'REJECT';
export type LicenseStatus = 'CLEAR' | 'UNKNOWN' | 'RESTRICTIVE' | 'PROHIBITED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SourceTrust = 'REPUTABLE' | 'UNKNOWN' | 'SUSPICIOUS' | 'MALICIOUS';

export interface GuardianResult {
  status: TrustStatus;
  trustLevel: number; // 0-1
  licenseStatus: LicenseStatus;
  securityRisk: RiskLevel;
  privacyRisk: RiskLevel;
  executionRisk: RiskLevel;
  dependencyRisk: RiskLevel;
  reasons: string[];
  warnings: string[];
  evidence: Record<string, unknown>;
  recommendedAction: string;
  evaluatedAt: Date;
}

export interface GuardianInput {
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  license?: string | null;
  repositoryUrl?: string | null;
  language?: string | null;
  topics?: string[];
  stars?: number | null;
  forks?: number | null;
  openIssues?: number | null;
  updatedAt?: Date | null;
  created_at?: Date | null;
  capabilityType?: string | null;
  classificationConfidence?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  privacyProfile?: PrivacyProfile | null;
  securityProfile?: SecurityProfile | null;
  resourceLevel?: Record<string, unknown> | null;
}

export interface TrustedCapability {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  repositoryUrl?: string | null;
  owner?: string | null;
  language?: string | null;
  license?: string | null;
  version?: string | null;
  topics?: string[];
  updatedAt: Date;
  createdAt: Date;
  stars?: number | null;
  forks?: number | null;
  openIssues?: number | null;
  sourceStatus: 'active' | 'archived' | 'disabled' | 'unknown';
  capabilityType: string;
  classificationConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  privacyProfile: PrivacyProfile;
  securityProfile: SecurityProfile;
  resourceLevel: Record<string, unknown>;
  guardianResult: GuardianResult;
  discoveredAt: Date;
  lastUpdated: Date;
}
