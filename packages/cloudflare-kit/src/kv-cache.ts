/**
 * High-Speed Edge KV Cache with Stale-While-Revalidate support
 */

export interface KVCacheBinding {
  get(key: string, type?: "text" | "json"): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface CacheEntry<T> {
  value: T;
  storedAt: number;
  ttlSeconds: number;
}

export class EdgeKVCache {
  private kv: KVCacheBinding;

  constructor(kv: KVCacheBinding) {
    this.kv = kv;
  }

  /**
   * Reads from KV with stale-while-revalidate background refresh.
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    try {
      const raw = (await this.kv.get(key, "json")) as CacheEntry<T> | null;
      const now = Math.floor(Date.now() / 1000);

      if (raw?.storedAt && now - raw.storedAt < ttlSeconds) {
        return raw.value;
      }

      // Revalidate
      const fresh = await fetcher();
      const entry: CacheEntry<T> = {
        value: fresh,
        storedAt: now,
        ttlSeconds,
      };

      // Store in background with 2x grace period for stale serving
      this.kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds * 2 }).catch(() => {});

      return fresh;
    } catch {
      return fetcher();
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      storedAt: Math.floor(Date.now() / 1000),
      ttlSeconds,
    };
    await this.kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
