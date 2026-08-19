// World Intelligence Module
// Discovers and understands external technological capabilities

export { DiscoveryManager, DiscoveryProvider, DiscoveryResult, CapabilityMetadata } from './discovery';
export { CapabilityGraph, CapabilityRecord, RelationshipType } from './capability';
export { PossibilityEngine, PossibilityRecord, PossibilityStatus } from './possibility';
export { DiscoveryCache, CacheEntry, CacheStats } from './cache';
export { createMockCapabilities, buildCapabilityGraph } from './mock-data';
