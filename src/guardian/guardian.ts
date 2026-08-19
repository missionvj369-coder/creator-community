







// Guardian - Trust Evaluation Engine
// Evaluates capabilities for safety, security, privacy, and trust

import { GuardianInput, GuardianResult, TrustStatus, RiskLevel, LicenseStatus } from './types';

export class Guardian {
  private knownReputableSources: Set<string>;
  private knownMaliciousSources: Set<string>;
  private clearLicenses: Set<string>;
  private restrictedLicenses: Set<string>;
  private prohibitedLicenses: Set<string>;

  constructor() {
    // Initialize with known reputable sources
    this.knownReputableSources = new Set([
      'github.com/openai',
      'github.com/facebook',
      'github.com/meta-llama',
      'github.com/huggingface',
      'github.com/microsoft',
      'github.com/google',
      'github.com/apple',
      'github.com/eleutherai',
      'github.com/togethercomputer',
      'github.com/stanford-crfm',
      'github.com/berkeley-abc',
      'github.com/nicholasgasior',
      'github.com/rhasspy',
      'github.com/heligon',
      'github.com/nicolevanderhoeven',
    ]);

    // Initialize with known malicious sources (examples - would be populated from threat intelligence)
    this.knownMaliciousSources = new Set([
      // No known malicious sources in current dataset
    ]);

    // Clear open-source licenses
    this.clearLicenses = new Set([
      'MIT',
      'Apache-2.0',
      'Apache 2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'BSD',
      'ISC',
      'Unlicense',
      'CC0-1.0',
      '0BSD',
    ]);

    // Restricted licenses (require review)
    this.restrictedLicenses = new Set([
      'GPL-2.0',
      'GPL-3.0',
      'LGPL-2.1',
      'LGPL-3.0',
      'AGPL-3.0',
      'MPL-2.0',
      'EPL-1.0',
      'CDDL-1.0',
    ]);

    // Prohibited licenses
    this.prohibitedLicenses = new Set([
      'SSPL',
      'SSPL-1.0',
      'Commons-Closed',
      'BSL-1.1',
    ]);
  }

  /**
   * Evaluate a capability for trust, safety, and suitability
   */
  evaluate(input: GuardianInput): GuardianResult {
    const reasons: string[] = [];
    const warnings: string[] = [];
    const evidence: Record<string, unknown> = {};
    const evaluatedAt = new Date();

    // 1. Evaluate source trust
    const sourceTrust = this.evaluateSourceTrust(input);
    evidence.sourceTrust = sourceTrust;
    if (sourceTrust === 'REPUTABLE') {
      reasons.push('Source is known reputable');
    } else if (sourceTrust === 'MALICIOUS') {
      reasons.push('Source is known malicious');
      warnings.push('CRITICAL: Malicious source detected');
    } else if (sourceTrust === 'UNKNOWN') {
      warnings.push('Source trust unknown - manual review recommended');
    }

    // 2. Evaluate license
    const licenseStatus = this.evaluateLicense(input.license);
    evidence.licenseStatus = licenseStatus;
    if (licenseStatus === 'CLEAR') {
      reasons.push(`License is clear: ${input.license}`);
    } else if (licenseStatus === 'UNKNOWN') {
      warnings.push('License unknown or missing - manual review required');
    } else if (licenseStatus === 'PROHIBITED') {
      reasons.push(`License is prohibited: ${input.license}`);
    } else if (licenseStatus === 'RESTRICTIVE') {
      warnings.push(`License has restrictions: ${input.license}`);
    }

    // 3. Evaluate security risk
    const securityRisk = this.evaluateSecurityRisk(input, warnings);
    evidence.securityRisk = securityRisk;
    if (securityRisk === 'LOW') {
      reasons.push('No known security issues');
    } else if (securityRisk === 'MEDIUM') {
      warnings.push('Medium security risk - review recommended');
    } else if (securityRisk === 'HIGH' || securityRisk === 'CRITICAL') {
      reasons.push('High security risk detected');
    }

    // 4. Evaluate privacy risk
    const privacyRisk = this.evaluatePrivacyRisk(input);
    evidence.privacyRisk = privacyRisk;
    if (privacyRisk === 'LOW') {
      reasons.push('Local-only or clear privacy policy');
    } else if (privacyRisk === 'MEDIUM') {
      warnings.push('Privacy implications require review');
    } else if (privacyRisk === 'HIGH' || privacyRisk === 'CRITICAL') {
      reasons.push('High privacy risk detected');
    }

    // 5. Evaluate execution risk
    const executionRisk = this.evaluateExecutionRisk(input);
    evidence.executionRisk = executionRisk;
    if (executionRisk === 'LOW') {
      reasons.push('No code execution required');
    } else if (executionRisk === 'MEDIUM') {
      warnings.push('Requires sandboxed execution');
    } else if (executionRisk === 'HIGH' || executionRisk === 'CRITICAL') {
      reasons.push('Arbitrary code execution risk');
    }

    // 6. Evaluate dependency risk
    const dependencyRisk = this.evaluateDependencyRisk(input);
    evidence.dependencyRisk = dependencyRisk;
    if (dependencyRisk === 'LOW') {
      reasons.push('Minimal dependencies');
    } else if (dependencyRisk === 'MEDIUM') {
      warnings.push('Multiple dependencies - review recommended');
    } else if (dependencyRisk === 'HIGH' || dependencyRisk === 'CRITICAL') {
      reasons.push('High dependency risk');
    }

    // 7. Calculate overall trust level
    const trustLevel = this.calculateTrustLevel(
      sourceTrust,
      licenseStatus,
      securityRisk,
      privacyRisk,
      executionRisk,
      dependencyRisk
    );
    evidence.trustLevel = trustLevel;

    // 8. Determine final status
    const status = this.determineStatus(
      sourceTrust,
      licenseStatus,
      securityRisk,
      privacyRisk,
      executionRisk,
      dependencyRisk,
      trustLevel
    );

    // 9. Generate recommended action
    const recommendedAction = this.generateRecommendedAction(status, warnings);

    return {
      status,
      trustLevel,
      licenseStatus,
      securityRisk,
      privacyRisk,
      executionRisk,
      dependencyRisk,
      reasons,
      warnings,
      evidence,
      recommendedAction,
      evaluatedAt,
    };
  }

  /**
   * Evaluate source trust based on repository owner
   */
  private evaluateSourceTrust(input: GuardianInput): 'REPUTABLE' | 'UNKNOWN' | 'SUSPICIOUS' | 'MALICIOUS' {
    const sourceKey = `${input.source}:${input.repositoryUrl || input.sourceUrl}`;
    
    if (this.knownMaliciousSources.has(sourceKey)) {
      return 'MALICIOUS';
    }

    if (this.knownReputableSources.has(sourceKey)) {
      return 'REPUTABLE';
    }

    // Check if it's a GitHub repository from a known organization
    if (input.source === 'github' && input.repositoryUrl) {
      const match = input.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const owner = match[1];
        const fullPath = `github.com/${owner}`;
        
        if (this.knownReputableSources.has(fullPath)) {
          return 'REPUTABLE';
        }
      }
    }

    return 'UNKNOWN';
  }

  /**
   * Evaluate license status
   */
  private evaluateLicense(license: string | null | undefined): LicenseStatus {
    if (!license) {
      return 'UNKNOWN';
    }

    const normalizedLicense = license.trim();

    if (this.prohibitedLicenses.has(normalizedLicense)) {
      return 'PROHIBITED';
    }

    if (this.restrictedLicenses.has(normalizedLicense)) {
      return 'RESTRICTIVE';
    }

    if (this.clearLicenses.has(normalizedLicense)) {
      return 'CLEAR';
    }

    // Unknown license - require review
    return 'UNKNOWN';
  }

  /**
   * Evaluate security risk
   */
  private evaluateSecurityRisk(input: GuardianInput, warnings: string[]): RiskLevel {
    // Start with LOW risk
    let risk: RiskLevel = 'LOW';

    // Check for known security indicators
    if (input.openIssues && input.openIssues > 100) {
      risk = this.escalateRisk(risk, 'MEDIUM');
      warnings.push('High number of open issues may indicate security concerns');
    }

    if (input.securityProfile) {
      if (input.securityProfile.vulnerabilities && input.securityProfile.vulnerabilities.length > 0) {
        const criticalVulns = input.securityProfile.vulnerabilities.filter(v => v.severity === 'critical');
        if (criticalVulns.length > 0) {
          risk = this.escalateRisk(risk, 'CRITICAL');
        } else {
          risk = this.escalateRisk(risk, 'HIGH');
        }
      }
    }

    return risk;
  }

  /**
   * Evaluate privacy risk
   */
  private evaluatePrivacyRisk(input: GuardianInput): RiskLevel {
    let risk: RiskLevel = 'LOW';

    // Check privacy profile
    if (input.privacyProfile) {
      if (input.privacyProfile.dataRemote) {
        risk = this.escalateRisk(risk, 'MEDIUM');
      }
      if (input.privacyProfile.sharing && input.privacyProfile.sharing.length > 0) {
        risk = this.escalateRisk(risk, 'HIGH');
      }
    }

    // Check description for privacy-related keywords
    const description = (input.description || '').toLowerCase();
    if (description.includes('cloud') || description.includes('remote')) {
      risk = this.escalateRisk(risk, 'MEDIUM');
    }

    return risk;
  }

  /**
   * Evaluate execution risk
   */
  private evaluateExecutionRisk(input: GuardianInput): RiskLevel {
    let risk: RiskLevel = 'LOW';

    // Check description for execution-related keywords
    const description = (input.description || '').toLowerCase();
    const name = (input.name || '').toLowerCase();

    const executionKeywords = [
      'execute',
      'shell',
      'command',
      'script',
      'binary',
      'install',
      'docker',
      'container',
      'sandbox',
      'vm',
    ];

    const hasExecutionKeyword = executionKeywords.some(keyword => 
      description.includes(keyword) || name.includes(keyword)
    );

    if (hasExecutionKeyword) {
      risk = 'MEDIUM';
    }

    // Check topics for execution-related topics
    if (input.topics) {
      const executionTopics = ['automation', 'orchestration', 'deployment', 'ci-cd'];
      const hasExecutionTopic = input.topics.some(topic => 
        executionTopics.includes(topic.toLowerCase())
      );
      if (hasExecutionTopic) {
        risk = this.escalateRisk(risk, 'MEDIUM');
      }
    }

    return risk;
  }

  /**
   * Evaluate dependency risk
   */
  private evaluateDependencyRisk(input: GuardianInput): RiskLevel {
    let risk: RiskLevel = 'LOW';

    // Check for dependency indicators in description
    const description = (input.description || '').toLowerCase();
    
    if (description.includes('heavy dependencies') || description.includes('many dependencies')) {
      risk = 'MEDIUM';
    }

    // Check language - some languages have more dependency risk
    if (input.language === 'JavaScript' || input.language === 'TypeScript') {
      // Node.js projects often have many dependencies
      risk = this.escalateRisk(risk, 'LOW'); // Keep LOW but could escalate
    }

    return risk;
  }

  /**
   * Calculate overall trust level (0-1)
   */
  private calculateTrustLevel(
    sourceTrust: 'REPUTABLE' | 'UNKNOWN' | 'SUSPICIOUS' | 'MALICIOUS',
    licenseStatus: LicenseStatus,
    securityRisk: RiskLevel,
    privacyRisk: RiskLevel,
    executionRisk: RiskLevel,
    dependencyRisk: RiskLevel
  ): number {
    let trust = 1.0;

    // Source trust impact
    if (sourceTrust === 'REPUTABLE') trust -= 0;
    else if (sourceTrust === 'UNKNOWN') trust -= 0.2;
    else if (sourceTrust === 'SUSPICIOUS') trust -= 0.5;
    else if (sourceTrust === 'MALICIOUS') trust -= 1.0;

    // License impact
    if (licenseStatus === 'CLEAR') trust -= 0;
    else if (licenseStatus === 'UNKNOWN') trust -= 0.15;
    else if (licenseStatus === 'RESTRICTIVE') trust -= 0.1;
    else if (licenseStatus === 'PROHIBITED') trust -= 1.0;

    // Risk impacts
    const riskScores: Record<RiskLevel, number> = {
      'LOW': 0,
      'MEDIUM': 0.1,
      'HIGH': 0.3,
      'CRITICAL': 0.5,
    };

    trust -= riskScores[securityRisk];
    trust -= riskScores[privacyRisk];
    trust -= riskScores[executionRisk];
    trust -= riskScores[dependencyRisk];

    return Math.max(0, Math.min(1, trust));
  }

  /**
   * Determine final status based on all evaluations
   */
  private determineStatus(
    sourceTrust: 'REPUTABLE' | 'UNKNOWN' | 'SUSPICIOUS' | 'MALICIOUS',
    licenseStatus: LicenseStatus,
    securityRisk: RiskLevel,
    privacyRisk: RiskLevel,
    executionRisk: RiskLevel,
    dependencyRisk: RiskLevel,
    trustLevel: number
  ): TrustStatus {
    // Automatic rejections
    if (sourceTrust === 'MALICIOUS') {
      return 'REJECT';
    }
    if (licenseStatus === 'PROHIBITED') {
      return 'REJECT';
    }
    if (securityRisk === 'CRITICAL' || privacyRisk === 'CRITICAL' || executionRisk === 'CRITICAL') {
      return 'REJECT';
    }

    // Automatic acceptance
    if (
      sourceTrust === 'REPUTABLE' &&
      licenseStatus === 'CLEAR' &&
      securityRisk === 'LOW' &&
      privacyRisk === 'LOW' &&
      executionRisk === 'LOW' &&
      dependencyRisk === 'LOW' &&
      trustLevel >= 0.8
    ) {
      return 'ACCEPT';
    }

    // Everything else requires review
    return 'REVIEW';
  }

  /**
   * Generate recommended action based on status and warnings
   */
  private generateRecommendedAction(status: TrustStatus, warnings: string[]): string {
    switch (status) {
      case 'ACCEPT':
        return 'Capability meets trust criteria. Safe for integration after standard validation.';
      case 'REJECT':
        return 'Capability does not meet minimum trust criteria. Do not integrate.';
      case 'REVIEW':
        if (warnings.length > 0) {
          return `Manual review required. Warnings: ${warnings.join('; ')}`;
        }
        return 'Manual review required. Insufficient evidence for automatic decision.';
    }
  }

  /**
   * Escalate risk level
   */
  private escalateRisk(current: RiskLevel, escalation: RiskLevel): RiskLevel {
    const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = levels.indexOf(current);
    const escalationIndex = levels.indexOf(escalation);
    
    if (escalationIndex > currentIndex) {
      return escalation;
    }
    
    return current;
  }
}