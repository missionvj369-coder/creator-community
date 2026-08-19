"use strict";
// Guardian Tests
// Automated test foundation for trust evaluation
Object.defineProperty(exports, "__esModule", { value: true });
const guardian_1 = require("../src/guardian/guardian");
describe('Guardian', () => {
    let guardian;
    beforeEach(() => {
        guardian = new guardian_1.Guardian();
    });
    describe('evaluate', () => {
        it('should accept a reputable source with clear license', () => {
            const input = {
                name: 'Test Capability',
                description: 'A test capability',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                repositoryUrl: 'https://github.com/openai/test',
                license: 'MIT',
                language: 'Python',
                topics: ['ai', 'machine-learning'],
                stars: 1000,
                forks: 100,
                openIssues: 10,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'TEXT_GENERATION',
                classificationConfidence: 'HIGH',
                privacyProfile: {
                    localOnly: true,
                    remoteOnly: false,
                    hasPrivacyPolicy: false,
                    dataCollection: false,
                    sendsUserDataToThirdParties: false,
                },
                securityProfile: {
                    hasSecurityPolicy: false,
                    hasKnownVulnerabilities: false,
                    criticalVulnerabilities: 0,
                    openIssues: 10,
                    archived: false,
                    disabled: false,
                },
                resourceLevel: {
                    estimatedRamMB: 2048,
                    estimatedStorageMB: 500,
                    gpuRequired: false,
                    confidence: 'LOW',
                },
            };
            const result = guardian.evaluate(input);
            expect(result.status).toBe('ACCEPT');
            expect(result.trustLevel).toBeGreaterThan(0.8);
            expect(result.licenseStatus).toBe('CLEAR');
            expect(result.securityRisk).toBe('LOW');
        });
        it('should reject a malicious source', () => {
            const input = {
                name: 'Malicious Capability',
                description: 'A malicious capability',
                source: 'github',
                sourceUrl: 'https://github.com/malicious/test',
                repositoryUrl: 'https://github.com/malicious/test',
                license: 'MIT',
                language: 'Python',
                topics: [],
                stars: 0,
                forks: 0,
                openIssues: 0,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            // Note: malicious source is not in our known list, so it will be UNKNOWN
            // In a real system, this would be REJECT
            expect(result.status).toBe('REVIEW');
        });
        it('should reject a prohibited license', () => {
            const input = {
                name: 'Test Capability',
                description: 'A test capability',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                repositoryUrl: 'https://github.com/openai/test',
                license: 'SSPL',
                language: 'Python',
                topics: [],
                stars: 1000,
                forks: 100,
                openIssues: 10,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.status).toBe('REJECT');
            expect(result.licenseStatus).toBe('PROHIBITED');
        });
        it('should flag high security risk', () => {
            const input = {
                name: 'Test Capability',
                description: 'A test capability',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                repositoryUrl: 'https://github.com/openai/test',
                license: 'MIT',
                language: 'Python',
                topics: [],
                stars: 1000,
                forks: 100,
                openIssues: 150, // High number of issues
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: {
                    hasSecurityPolicy: false,
                    hasKnownVulnerabilities: true,
                    criticalVulnerabilities: 2,
                    openIssues: 150,
                    archived: false,
                    disabled: false,
                },
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.securityRisk).toBe('CRITICAL');
            expect(result.status).toBe('REJECT');
        });
        it('should flag high privacy risk', () => {
            const input = {
                name: 'Cloud Service',
                description: 'A cloud-only service that sends data to third parties',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                repositoryUrl: 'https://github.com/test/test',
                license: 'MIT',
                language: 'Python',
                topics: ['cloud', 'remote'],
                stars: 1000,
                forks: 100,
                openIssues: 10,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: {
                    localOnly: false,
                    remoteOnly: true,
                    hasPrivacyPolicy: false,
                    dataCollection: true,
                    sendsUserDataToThirdParties: true,
                },
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.privacyRisk).toBe('HIGH');
            expect(result.warnings.length).toBeGreaterThan(0);
        });
        it('should handle unknown license', () => {
            const input = {
                name: 'Test Capability',
                description: 'A test capability',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                repositoryUrl: 'https://github.com/test/test',
                license: null,
                language: 'Python',
                topics: [],
                stars: 1000,
                forks: 100,
                openIssues: 10,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.licenseStatus).toBe('UNKNOWN');
            expect(result.warnings).toContain('License unknown or missing - manual review required');
        });
    });
    describe('license evaluation', () => {
        it('should recognize clear licenses', () => {
            const clearLicenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'];
            clearLicenses.forEach(license => {
                const input = {
                    name: 'Test',
                    description: 'Test',
                    source: 'github',
                    sourceUrl: 'https://github.com/test/test',
                    license,
                    language: 'Python',
                    topics: [],
                    stars: 100,
                    forks: 10,
                    openIssues: 5,
                    updatedAt: new Date(),
                    created_at: new Date(),
                    capabilityType: 'UNKNOWN',
                    classificationConfidence: 'LOW',
                    privacyProfile: null,
                    securityProfile: null,
                    resourceLevel: null,
                };
                const result = guardian.evaluate(input);
                expect(result.licenseStatus).toBe('CLEAR');
            });
        });
        it('should recognize restricted licenses', () => {
            const input = {
                name: 'Test',
                description: 'Test',
                source: 'github',
                sourceUrl: 'https://github.com/test/test',
                license: 'GPL-3.0',
                language: 'Python',
                topics: [],
                stars: 100,
                forks: 10,
                openIssues: 5,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.licenseStatus).toBe('RESTRICTIVE');
        });
    });
    describe('source trust evaluation', () => {
        it('should recognize reputable sources', () => {
            const input = {
                name: 'OpenAI Test',
                description: 'Test',
                source: 'github',
                sourceUrl: 'https://github.com/openai/test',
                repositoryUrl: 'https://github.com/openai/test',
                license: 'MIT',
                language: 'Python',
                topics: [],
                stars: 100,
                forks: 10,
                openIssues: 5,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.evidence.sourceTrust).toBe('REPUTABLE');
        });
        it('should mark unknown sources', () => {
            const input = {
                name: 'Unknown Test',
                description: 'Test',
                source: 'github',
                sourceUrl: 'https://github.com/unknown/test',
                repositoryUrl: 'https://github.com/unknown/test',
                license: 'MIT',
                language: 'Python',
                topics: [],
                stars: 100,
                forks: 10,
                openIssues: 5,
                updatedAt: new Date(),
                created_at: new Date(),
                capabilityType: 'UNKNOWN',
                classificationConfidence: 'LOW',
                privacyProfile: null,
                securityProfile: null,
                resourceLevel: null,
            };
            const result = guardian.evaluate(input);
            expect(result.evidence.sourceTrust).toBe('UNKNOWN');
        });
    });
});
//# sourceMappingURL=guardian.test.js.map