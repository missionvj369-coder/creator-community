// 3. EMPATHY - Models human perspective

import { ObservedIntention, Understanding, HumanContext, HumanCapabilityProfile, DeviceProfile } from './types';

export class EmpathyEngine {
  modelHumanContext(
    observed: ObservedIntention,
    understanding: Understanding,
    humanProfile: HumanCapabilityProfile,
    deviceProfile: DeviceProfile
  ): HumanContext {
    const capability = humanProfile.level;
    const technicalKnowledge = humanProfile.technicalExperience;
    const accessibility = this.assessAccessibility(observed, understanding);
    const resourceLimitations = this.identifyResourceLimitations(observed, deviceProfile);
    const likelyFears = this.inferFears(observed, understanding);
    const likelyFriction = this.identifyFriction(observed, humanProfile, deviceProfile);
    const desiredGuidance = humanProfile.desiredControl === 'automated' ? 'minimal' :
                           humanProfile.desiredControl === 'guided' ? 'moderate' : 'detailed';
    
    // Classify information
    const observed_data = this.extractObserved(observed, humanProfile);
    const inferred = this.extractInferred(observed, understanding, humanProfile);
    const unknown = this.extractUnknown(observed, humanProfile);
    
    const confidence = this.calculateConfidence({
      hasProfile: humanProfile.confidence > 0,
      hasDeviceProfile: deviceProfile.confidence > 0,
      observedCount: observed_data.length,
      inferredCount: inferred.length,
      unknownCount: unknown.length,
    });
    
    return {
      capability,
      technicalKnowledge,
      accessibility,
      resourceLimitations,
      likelyFears,
      likelyFriction,
      desiredGuidance,
      observed: observed_data,
      inferred,
      unknown,
      confidence,
    };
  }
  
  private assessAccessibility(observed: ObservedIntention, understanding: Understanding): string[] {
    const accessibility: string[] = [];
    const text = observed.explicitRequest.toLowerCase();
    
    // Check for accessibility needs
    if (text.match(/(?:visual|blind|low vision|screen reader)/i)) {
      accessibility.push('visual impairment: requires screen reader support');
    }
    
    if (text.match(/(?:hearing|deaf|hard of hearing|audio)/i)) {
      accessibility.push('hearing impairment: requires visual alternatives to audio');
    }
    
    if (text.match(/(?:motor|physical|disability|mobility)/i)) {
      accessibility.push('motor impairment: requires keyboard navigation and voice control');
    }
    
    if (text.match(/(?:cognitive|learning|dyslexia|simple)/i)) {
      accessibility.push('cognitive accessibility: requires simple, clear interface');
    }
    
    if (text.match(/(?:elderly|senior|aged|older)/i)) {
      accessibility.push('elderly-friendly: larger text, simple navigation');
    }
    
    if (text.match(/(?:children|kids|young|child)/i)) {
      accessibility.push('child-friendly: intuitive, safe, supervised');
    }
    
    if (text.match(/(?:language|translation|multilingual|non-english)/i)) {
      accessibility.push('language accessibility: multilingual support needed');
    }
    
    if (text.match(/(?:low.?literacy|read|simple language)/i)) {
      accessibility.push('low literacy: visual icons, audio instructions');
    }
    
    // If no specific accessibility needs mentioned, assume general accessibility
    if (accessibility.length === 0) {
      accessibility.push('general: standard web accessibility (WCAG 2.1 AA)');
    }
    
    return accessibility;
  }
  
  private identifyResourceLimitations(observed: ObservedIntention, device: DeviceProfile): string[] {
    const limitations: string[] = [];
    
    // Device-based limitations
    if (device.ramTotal < 4096) {
      limitations.push('low RAM: cannot run memory-intensive applications');
    }
    
    if (device.storageTotal < 10000) {
      limitations.push('limited storage: cannot store large datasets or models');
    }
    
    if (!device.acceleration || !device.acceleration.localModels) {
      limitations.push('no local AI: cannot run AI models locally');
    }
    
    if (!device.network || (!device.network.offlineCapable && device.network.type === 'unknown')) {
      limitations.push('unreliable network: requires offline-first design');
    }
    
    if (device.runtimeCapabilities && device.runtimeCapabilities.localLLM === false) {
      limitations.push('no local LLM: must use remote AI services if needed');
    }
    
    // Intention-based limitations
    const text = observed.explicitRequest.toLowerCase();
    
    if (text.match(/(?:cheap|free|low cost|budget)/i)) {
      limitations.push('budget constraint: limited financial resources');
    }
    
    if (text.match(/(?:quick|fast|rapid|immediate)/i)) {
      limitations.push('time constraint: limited development time');
    }
    
    if (text.match(/(?:simple|easy|minimal)/i)) {
      limitations.push('complexity constraint: needs simple solution');
    }
    
    if (text.match(/(?:solo|alone|by myself|single person)/i)) {
      limitations.push('single person: limited human resources');
    }
    
    if (text.match(/(?:beginner|new|learning|no experience)/i)) {
      limitations.push('beginner skill level: needs guided, simple implementation');
    }
    
    return limitations;
  }
  
  private inferFears(observed: ObservedIntention, understanding: Understanding): string[] {
    const fears: string[] = [];
    const text = observed.explicitRequest.toLowerCase();
    
    // Infer fears based on context
    if (text.match(/(?:privacy|private|personal|data|information)/i)) {
      fears.push('privacy concern: worried about data misuse');
    }
    
    if (text.match(/(?:complex|complicated|difficult|hard)/i)) {
      fears.push('complexity fear: intimidated by technical complexity');
    }
    
    if (text.match(/(?:fail|failure|risk|danger|wrong)/i)) {
      fears.push('failure fear: concerned about project failure');
    }
    
    if (text.match(/(?:time|deadline|rush|quick)/i)) {
      fears.push('time pressure: worried about insufficient time');
    }
    
    if (text.match(/(?:money|cost|budget|expensive|afford)/i)) {
      fears.push('financial concern: worried about costs');
    }
    
    if (text.match(/(?:community|public|others|people)/i)) {
      fears.push('social risk: concerned about community reaction');
    }
    
    if (text.match(/(?:legal|regulation|compliance|permit)/i)) {
      fears.push('legal concern: worried about regulatory issues');
    }
    
    if (text.match(/(?:scale|large|grow|many)/i)) {
      fears.push('scalability fear: worried about handling growth');
    }
    
    if (text.match(/(?:maintain|maintenance|ongoing|sustain)/i)) {
      fears.push('sustainability fear: worried about long-term maintenance');
    }
    
    // If no specific fears detected, add general concerns
    if (fears.length === 0) {
      fears.push('uncertainty: general concern about unknown challenges');
    }
    
    return fears;
  }
  
  private identifyFriction(
    observed: ObservedIntention,
    humanProfile: HumanCapabilityProfile,
    device: DeviceProfile
  ): string[] {
    const friction: string[] = [];
    
    // Human capability friction
    if (humanProfile.level === 'beginner') {
      friction.push('beginner barrier: steep learning curve for technical implementation');
    }
    
    if (humanProfile.technicalExperience && humanProfile.technicalExperience < 3) {
      friction.push('limited technical skills: requires simplified tools and guidance');
    }
    
    if (humanProfile.desiredControl === 'automated' && humanProfile.level !== 'expert') {
      friction.push('control mismatch: wants automation but lacks expertise to configure it');
    }
    
    if (humanProfile.complexityTolerance && humanProfile.complexityTolerance < 3) {
      friction.push('low complexity tolerance: needs simple, straightforward solution');
    }
    
    // Device friction
    if (device.ramTotal && device.ramTotal < 8192) {
      friction.push('device limitation: may struggle with modern development tools');
    }
    
    if (device.runtimeCapabilities && !device.runtimeCapabilities.node && !device.runtimeCapabilities.python) {
      friction.push('no runtime: cannot run development environments');
    }
    
    if (device.runtimeCapabilities && !device.runtimeCapabilities.browser) {
      friction.push('no browser: cannot use web-based tools');
    }
    
    // Context friction
    const text = observed.explicitRequest.toLowerCase();
    
    if (text.match(/(?:community|multiple|many|group)/i)) {
      friction.push('coordination friction: requires aligning multiple stakeholders');
    }
    
    if (text.match(/(?:data|track|monitor|measure)/i)) {
      friction.push('data friction: requires data collection and management');
    }
    
    if (text.match(/(?:legal|permit|license|regulation)/i)) {
      friction.push('regulatory friction: requires legal compliance work');
    }
    
    if (text.match(/(?:scale|large|grow|expand)/i)) {
      friction.push('scaling friction: requires planning for growth');
    }
    
    return friction;
  }
  
  private extractObserved(observed: ObservedIntention, humanProfile: HumanCapabilityProfile): string[] {
    const observed_data: string[] = [];
    
    // From observation
    if (observed.availableResources.length > 0) {
      observed_data.push(`User has access to: ${observed.availableResources.join(', ')}`);
    }
    
    if (observed.constraints.length > 0) {
      observed_data.push(`User constraints: ${observed.constraints.join(', ')}`);
    }
    
    if (observed.urgency !== 'unknown') {
      observed_data.push(`Urgency level: ${observed.urgency}`);
    }
    
    // From human profile
    observed_data.push(`Skill level: ${humanProfile.level}`);
    observed_data.push(`Technical experience: ${humanProfile.technicalExperience}/10`);
    observed_data.push(`Desired control: ${humanProfile.desiredControl}`);
    observed_data.push(`Desired guidance: ${humanProfile.desiredGuidance}`);
    
    return observed_data;
  }
  
  private extractInferred(
    observed: ObservedIntention,
    understanding: Understanding,
    humanProfile: HumanCapabilityProfile
  ): string[] {
    const inferred: string[] = [];
    
    // Infer from context
    if (observed.urgency === 'high') {
      inferred.push('User likely has time pressure and stress');
    }
    
    if (observed.missingInformation.length > 3) {
      inferred.push('User may not have fully thought through requirements');
    }
    
    if (humanProfile.level === 'beginner') {
      inferred.push('User likely needs step-by-step guidance');
    }
    
    if (humanProfile.complexityTolerance < 5) {
      inferred.push('User prefers simple, working solutions over complex features');
    }
    
    if (understanding.risks.length > 3) {
      inferred.push('Project has significant risk factors that may overwhelm user');
    }
    
    if (observed.constraints.some(c => c.match(/(?:cheap|free|budget)/i))) {
      inferred.push('User is budget-conscious and may prioritize cost over features');
    }
    
    return inferred;
  }
  
  private extractUnknown(observed: ObservedIntention, humanProfile: HumanCapabilityProfile): string[] {
    const unknown: string[] = [];
    
    // Unknown human factors
    if (!observed.explicitRequest.match(/(?:beginner|expert|experience|skill|knowledge)/i)) {
      unknown.push('actual technical skill level unconfirmed');
    }
    
    if (!observed.explicitRequest.match(/(?:time|hours|day|week|month)/i)) {
      unknown.push('available time commitment unknown');
    }
    
    if (!observed.explicitRequest.match(/(?:budget|cost|price|afford|\$)/i)) {
      unknown.push('budget constraints unknown');
    }
    
    if (!observed.explicitRequest.match(/(?:team|solo|alone|group|people)/i)) {
      unknown.push('team size and composition unknown');
    }
    
    if (!observed.explicitRequest.match(/(?:fear|worry|concern|anxious|nervous)/i)) {
      unknown.push('emotional state and concerns unknown');
    }
    
    if (humanProfile.confidence < 0.7) {
      unknown.push('human profile accuracy uncertain - may need refinement');
    }
    
    return unknown;
  }
  
  private calculateConfidence(metrics: {
    hasProfile: boolean;
    hasDeviceProfile: boolean;
    observedCount: number;
    inferredCount: number;
    unknownCount: number;
  }): number {
    let confidence = 0.4; // Lower base confidence for human factors
    
    if (metrics.hasProfile) confidence += 0.2;
    if (metrics.hasDeviceProfile) confidence += 0.1;
    if (metrics.observedCount > 0) confidence += 0.1;
    
    // Reduce for unknowns
    confidence -= metrics.unknownCount * 0.03;
    
    // Cap inference bonus
    if (metrics.inferredCount > 0 && metrics.inferredCount < 5) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
}