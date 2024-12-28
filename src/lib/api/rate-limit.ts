interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests and filter old ones
    const requests = (this.requests.get(key) || []).filter(
      (timestamp) => timestamp > windowStart
    );

    if (requests.length >= this.config.maxRequests) {
      return false;
    }

    requests.push(now);
    this.requests.set(key, requests);
    return true;
  }
}

export const downloadLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
});
