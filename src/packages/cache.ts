/**
 * Package Cache
 * Caches loaded packages for performance
 */

import { PackageType } from '../bridges/types';
import { logger } from '../utils/logger';

/**
 * Cache entry for a loaded package
 */
interface CacheEntry {
  package: any; // The loaded package/module
  type: PackageType;
  loadedAt: number;
  accessCount: number;
  lastAccess: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  maxSize?: number; // Maximum number of cached packages
  maxAge?: number; // Maximum age in milliseconds
  evictionPolicy?: 'LRU' | 'LFU' | 'FIFO'; // Eviction policy
}

/**
 * Package cache for performance optimization
 */
export class PackageCache {
  private static instance: PackageCache;
  private cache: Map<string, CacheEntry> = new Map();
  private config: Required<CacheConfig>;

  private constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      maxAge: config.maxAge || 30 * 60 * 1000, // 30 minutes default
      evictionPolicy: config.evictionPolicy || 'LRU',
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: CacheConfig): PackageCache {
    if (!PackageCache.instance) {
      PackageCache.instance = new PackageCache(config);
    }
    return PackageCache.instance;
  }

  /**
   * Get cached package
   */
  get(packageName: string, type: PackageType): any | null {
    const key = this.createKey(packageName, type);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      logger.debug(`Cache entry expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();

    logger.debug(`Cache hit: ${key} (accessed ${entry.accessCount} times)`);
    return entry.package;
  }

  /**
   * Set cached package
   */
  set(packageName: string, type: PackageType, packageObj: any): void {
    const key = this.createKey(packageName, type);

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const entry: CacheEntry = {
      package: packageObj,
      type,
      loadedAt: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
    };

    this.cache.set(key, entry);
    logger.debug(`Cached package: ${key}`);
  }

  /**
   * Check if package is cached
   */
  has(packageName: string, type: PackageType): boolean {
    const key = this.createKey(packageName, type);
    const entry = this.cache.get(key);

    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove package from cache
   */
  delete(packageName: string, type: PackageType): boolean {
    const key = this.createKey(packageName, type);
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Removed from cache: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cleared package cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{
      key: string;
      type: PackageType;
      age: number;
      accessCount: number;
      lastAccess: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      type: entry.type,
      age: Date.now() - entry.loadedAt,
      accessCount: entry.accessCount,
      lastAccess: entry.lastAccess,
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries,
    };
  }

  /**
   * Evict entries based on policy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    if (this.config.evictionPolicy === 'LRU') {
      // Least Recently Used
      let oldestAccess = Infinity;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.lastAccess < oldestAccess) {
          oldestAccess = entry.lastAccess;
          keyToEvict = key;
        }
      }
    } else if (this.config.evictionPolicy === 'LFU') {
      // Least Frequently Used
      let lowestCount = Infinity;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.accessCount < lowestCount) {
          lowestCount = entry.accessCount;
          keyToEvict = key;
        }
      }
    } else if (this.config.evictionPolicy === 'FIFO') {
      // First In First Out
      let oldestLoad = Infinity;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.loadedAt < oldestLoad) {
          oldestLoad = entry.loadedAt;
          keyToEvict = key;
        }
      }
    }

    if (keyToEvict) {
      logger.debug(`Evicting from cache (${this.config.evictionPolicy}): ${keyToEvict}`);
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const age = Date.now() - entry.loadedAt;
    return age > this.config.maxAge;
  }

  /**
   * Create cache key
   */
  private createKey(packageName: string, type: PackageType): string {
    return `${type}:${packageName}`;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.loadedAt > this.config.maxAge) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned ${cleaned} expired cache entries`);
    }

    return cleaned;
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    return totalAccesses / entries.length;
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    if (config.maxSize !== undefined) {
      this.config.maxSize = config.maxSize;
      // Evict if over new max size
      while (this.cache.size > this.config.maxSize) {
        this.evict();
      }
    }
    if (config.maxAge !== undefined) {
      this.config.maxAge = config.maxAge;
      this.cleanExpired();
    }
    if (config.evictionPolicy !== undefined) {
      this.config.evictionPolicy = config.evictionPolicy;
    }

    logger.info('Cache configuration updated', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config };
  }
}
