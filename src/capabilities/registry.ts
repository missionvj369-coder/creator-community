// Capability Registry - Manages discovered and loaded capabilities
// Provides lookup, filtering, and querying of available capabilities

import type { Capability } from '../types';
import type { CapabilityMetadata } from '../world/discovery';

export interface RegistryQuery {
  type?: string[];
  capabilities?: string[];
  minFeasibility?: number;
  maxCost?: 'free' | 'freemium' | 'paid';
  platforms?: string[];
  licenses?: string[];
  tags?: string[];
}

export interface RegistryStats {
  totalCapabilities: number;
  byType: Record<string, number>;
  byPlatform: Record<string, number>;
  byLicense: Record<string, number>;
  lastUpdated: Date;
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();
  private metadata: Map<string, CapabilityMetadata> = new Map();
  private indexes: Map<string, Set<string>> = new Map(); // For fast lookup

  constructor() {
    // Initialize indexes
    this.indexes.set('type', new Set());
    this.indexes.set('capabilities', new Set());
    this.indexes.set('platform', new Set());
    this.indexes.set('license', new Set());
  }

  // Register a new capability
  register(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
    
    // Update indexes
    this.indexes.get('type')!.add(capability.type);
    this.indexes.get('license')!.add(capability.license);
    
    capability.capabilities.forEach(cap => {
      this.indexes.get('capabilities')!.add(cap);
    });
    
    capability.compatibility.platforms.forEach(platform => {
      this.indexes.get('platform')!.add(platform);
    });
  }

  // Register metadata from discovery
  registerMetadata(metadata: CapabilityMetadata): void {
    this.metadata.set(metadata.id, metadata);
  }

  // Get capability by ID
  get(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  // Get metadata by ID
  getMetadata(id: string): CapabilityMetadata | undefined {
    return this.metadata.get(id);
  }

  // Query capabilities with filters
  query(query: RegistryQuery): Capability[] {
    let results = Array.from(this.capabilities.values());

    // Filter by type
    if (query.type && query.type.length > 0) {
      results = results.filter(cap => query.type!.includes(cap.type));
    }

    // Filter by capabilities (must have ALL specified capabilities)
    if (query.capabilities && query.capabilities.length > 0) {
      results = results.filter(cap => 
        query.capabilities!.every(req => cap.capabilities.includes(req))
      );
    }

    // Filter by cost
    if (query.maxCost) {
      const costOrder = { 'free': 0, 'freemium': 1, 'paid': 2 };
      const maxCostValue = costOrder[query.maxCost];
      results = results.filter(cap => {
        const capCost = costOrder[cap.cost.type];
        return capCost <= maxCostValue;
      });
    }

    // Filter by platforms
    if (query.platforms && query.platforms.length > 0) {
      results = results.filter(cap => 
        cap.compatibility.platforms.some(p => query.platforms!.includes(p))
      );
    }

    // Filter by licenses
    if (query.licenses && query.licenses.length > 0) {
      results = results.filter(cap => query.licenses!.includes(cap.license));
    }

    return results;
  }

  // Search by text query
  search(query: string): Capability[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.capabilities.values()).filter(cap => 
      cap.name.toLowerCase().includes(lowerQuery) ||
      cap.description.toLowerCase().includes(lowerQuery) ||
      cap.capabilities.some(c => c.toLowerCase().includes(lowerQuery))
    );
  }

  // Get all capabilities of a specific type
  getByType(type: string): Capability[] {
    return Array.from(this.capabilities.values()).filter(cap => cap.type === type);
  }

  // Get all capabilities that provide a specific capability
  getByCapability(capability: string): Capability[] {
    return Array.from(this.capabilities.values()).filter(cap => 
      cap.capabilities.includes(capability)
    );
  }

  // Get statistics
  getStats(): RegistryStats {
    const capabilities = Array.from(this.capabilities.values());
    
    const byType: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    const byLicense: Record<string, number> = {};

    capabilities.forEach(cap => {
      byType[cap.type] = (byType[cap.type] || 0) + 1;
      byLicense[cap.license] = (byLicense[cap.license] || 0) + 1;
      cap.compatibility.platforms.forEach(platform => {
        byPlatform[platform] = (byPlatform[platform] || 0) + 1;
      });
    });

    return {
      totalCapabilities: capabilities.length,
      byType,
      byPlatform,
      byLicense,
      lastUpdated: new Date(),
    };
  }

  // Get all capabilities
  getAll(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  // Get count
  get count(): number {
    return this.capabilities.size;
  }

  // Clear registry
  clear(): void {
    this.capabilities.clear();
    this.metadata.clear();
    this.indexes.forEach(index => index.clear());
  }

  // Check if capability exists
  has(id: string): boolean {
    return this.capabilities.has(id);
  }

  // Remove capability
  remove(id: string): boolean {
    return this.capabilities.delete(id);
  }
}

// Singleton instance
export const capabilityRegistry = new CapabilityRegistry();