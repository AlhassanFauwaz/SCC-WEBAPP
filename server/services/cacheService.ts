/**
 * In-Memory Cache Service for Wikidata Responses
 * Provides caching for API responses to reduce server load and improve response times
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private static readonly MAX_CACHE_SIZE = 100; // Maximum number of cache entries

  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 1 hour)
   */
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is valid
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   * @param key Cache key
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ key: string; age: number; expiresIn: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      expiresIn: entry.expiresAt - Date.now(),
    }));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries,
    };
  }

  /**
   * Evict oldest cache entry
   */
  private static evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean expired entries
   */
  static cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Clean expired entries every 5 minutes
setInterval(() => {
  CacheService.cleanExpired();
}, 5 * 60 * 1000);

