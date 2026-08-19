// Discovery Cache
// Caches discovered capabilities to avoid repeated network requests

export interface CacheEntry<T> {
  data: T;
  cachedAt: Date;
  lastChecked: Date;
  lastChanged: Date;
  contentHash?: string;
  status: 'fresh' | 'stale' | 'deprecated';
}

export class DiscoveryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxAge: number; // milliseconds
  private maxSize: number;

  constructor(maxAgeDays: number = 7, maxSize: number = 10000) {
    this.maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if stale
    if (this.isStale(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, data: T): Promise<void> {
    const now = new Date();
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      lastChecked: now,
      lastChanged: now,
      status: 'fresh',
    };

    // Evict old entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  async update(key: string, updates: Partial<CacheEntry<any>>): Promise<void> {
    const entry = this.cache.get(key);
    if (!entry) {
      return;
    }

    const updatedEntry: CacheEntry<any> = {
      ...entry,
      ...updates,
      lastChecked: new Date(),
    };

    this.cache.set(key, updatedEntry);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateAll(): Promise<void> {
    this.cache.clear();
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = new Date();
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(e => !this.isStale(e)).length,
      staleEntries: entries.filter(e => this.isStale(e)).length,
      oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.cachedAt.getTime()))) : null,
      newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.cachedAt.getTime()))) : null,
    };
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.lastChecked.getTime() > this.maxAge;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.cachedAt.getTime() < oldestTime) {
        oldestTime = entry.cachedAt.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

export interface CacheStats {
  totalEntries: number;
  freshEntries: number;
  staleEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}