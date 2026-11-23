/**
 * Sliding Window Edge Rate Limiter
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export class SlidingWindowRateLimiter {
  private maxRequests: number;
  private windowSeconds: number;
  private inMemoryStore = new Map<string, number[]>();

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowSeconds * 1000;

    let timestamps = this.inMemoryStore.get(identifier) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetSeconds = Math.max(
        1,
        Math.ceil((oldest + this.windowSeconds * 1000 - now) / 1000),
      );
      this.inMemoryStore.set(identifier, timestamps);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
      };
    }

    timestamps.push(now);
    this.inMemoryStore.set(identifier, timestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetSeconds: this.windowSeconds,
    };
  }
}
