import { Octokit } from 'octokit';

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

/**
 * GitHub client configuration
 */
export interface GitHubClientConfig {
  auth?: string;
  rateLimitWarningThreshold?: number; // Warn when remaining falls below this
  rateLimitMinRemaining?: number; // Wait when remaining falls below this
}

/**
 * GitHub API client wrapper with rate limit handling
 */
export class GitHubClient {
  private octokit: Octokit;
  private rateLimitWarningThreshold: number;
  private rateLimitMinRemaining: number;
  private lastRateLimitCheck?: RateLimitInfo;

  constructor(config: GitHubClientConfig = {}) {
    this.octokit = new Octokit({
      auth: config.auth
    });
    this.rateLimitWarningThreshold = config.rateLimitWarningThreshold ?? 100;
    this.rateLimitMinRemaining = config.rateLimitMinRemaining ?? 10;
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    const response = await this.octokit.rest.rateLimit.get();
    const core = response.data.rate;

    const info: RateLimitInfo = {
      limit: core.limit,
      remaining: core.remaining,
      reset: core.reset,
      used: core.used
    };

    this.lastRateLimitCheck = info;
    return info;
  }

  /**
   * Check rate limit and throw if exceeded; log a warning when remaining is low.
   */
  async checkRateLimit(): Promise<void> {
    const rateLimit = await this.getRateLimit();

    if (rateLimit.remaining <= this.rateLimitMinRemaining) {
      const resetTime = new Date(rateLimit.reset * 1000);
      const waitMs = resetTime.getTime() - Date.now();

      if (waitMs > 0) {
        throw new Error(
          `Rate limit exceeded. ${rateLimit.remaining} requests remaining. Reset at ${resetTime.toISOString()}`
        );
      }
    }

    if (rateLimit.remaining <= this.rateLimitWarningThreshold) {
      console.warn(
        `Rate limit warning: ${rateLimit.remaining}/${rateLimit.limit} requests remaining`
      );
    }
  }

  /**
   * Execute a request with rate limit checking
   */
  async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    await this.checkRateLimit();
    return fn();
  }

  /**
   * Get the underlying Octokit instance
   */
  getOctokit(): Octokit {
    return this.octokit;
  }

  /**
   * Get last known rate limit info (cached)
   */
  getLastRateLimitCheck(): RateLimitInfo | undefined {
    return this.lastRateLimitCheck;
  }
}

/**
 * Create a GitHub client instance
 */
export function createGitHubClient(config?: GitHubClientConfig): GitHubClient {
  return new GitHubClient(config);
}
