import { Octokit } from 'octokit';

/**
 * Rate limit information returned by GitHub's REST API.
 *
 * @remarks
 * `reset` is a Unix timestamp (seconds since epoch) indicating when the
 * rate limit window resets.
 *
 * @category GitHub Client
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

/**
 * Configuration for the {@link GitHubClient} wrapper.
 *
 * @config
 * @category GitHub Client
 *
 * @pitfalls
 * - **Fine-grained vs. classic tokens**: fine-grained personal access tokens
 *   restrict API access to selected repositories and scopes.  Some endpoints
 *   (e.g. `rateLimit.get()`) are available to unauthenticated requests, but
 *   commit and issue APIs require the appropriate scope.  A missing scope
 *   surfaces as a `403 Forbidden`, not a `401 Unauthorized`.
 * - **Unauthenticated requests**: omitting `auth` allows unauthenticated
 *   requests with a shared rate limit of 60 req/h per IP.  For CI
 *   environments with multiple jobs sharing an IP this can exhaust quickly.
 */
export interface GitHubClientConfig {
  auth?: string;
  rateLimitWarningThreshold?: number; // Warn when remaining falls below this
  rateLimitMinRemaining?: number; // Wait when remaining falls below this
}

/**
 * Thin wrapper around Octokit that adds proactive rate-limit checking.
 *
 * @remarks
 * This class is intentionally minimal — it exposes the underlying Octokit
 * instance via {@link GitHubClient.getOctokit} so callers can use the full
 * Octokit API without re-implementing every method.
 *
 * Rate-limit state is cached per-instance; create one `GitHubClient` per
 * GitHub token and reuse it to benefit from the cache.
 *
 * @category GitHub Client
 *
 * @useWhen
 * Making authenticated GitHub API calls from the monitor or action packages
 * where you need integrated rate-limit protection.
 *
 * @avoidWhen
 * You need a full Octokit feature set with plugins (e.g., pagination,
 * throttling) — instantiate `Octokit` directly and pass it to
 * `GitHubClient` via the constructor is not possible; use the separate
 * `RateLimitHandler` for advanced budget management.
 *
 * @pitfalls
 * - **Primary vs. secondary rate limits**: `checkRateLimit` only checks the
 *   primary REST API rate limit.  GitHub also enforces secondary (abuse)
 *   rate limits on burst patterns (many requests in a short window).  A
 *   403 with `Retry-After` header indicates a secondary limit — this class
 *   does **not** handle that automatically.
 * - **Rate limit cache**: `getLastRateLimitCheck` returns a potentially
 *   stale value; it is updated only when `getRateLimit` or `checkRateLimit`
 *   is called.  Do not use it as a real-time indicator.
 *
 * @example
 * ```ts
 * import { GitHubClient } from '@dependabit/github-client';
 *
 * const client = new GitHubClient({ auth: process.env.GITHUB_TOKEN });
 * const octokit = client.getOctokit();
 * const { data } = await octokit.rest.repos.get({ owner: 'my-org', repo: 'my-repo' });
 * ```
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
