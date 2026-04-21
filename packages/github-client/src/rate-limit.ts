/**
 * Rate Limit Handler — manages GitHub API rate limits and request budgeting.
 *
 * @remarks
 * Provides a richer interface than {@link GitHubClient} for scenarios where
 * you need to check budget availability before a batch operation, or track
 * rate-limit status across the core, search, and GraphQL API categories.
 *
 * The token is read from `GITHUB_TOKEN` when not provided explicitly.
 *
 * @never
 * - **Primary vs. secondary limits**: GitHub enforces two independent limit
 *   systems.  This handler tracks only the *primary* limit (requests per
 *   hour per token).  Secondary (abuse) limits trigger 403 responses with a
 *   `Retry-After` header and are not handled here — callers must implement
 *   exponential back-off for burst scenarios.
 * - **Cached status TTL**: `getCachedStatus` returns a snapshot up to 60
 *   seconds old.  In fast loops, rely on `getRateLimitStatus` directly for
 *   accurate readings.
 * - **Unauthenticated requests**: if no token is provided and
 *   `GITHUB_TOKEN` is unset, the rate limit is 60 req/h shared across all
 *   unauthenticated requests from the same IP.
 *
 * @module
 */

import { Octokit } from 'octokit';

/**
 * Rate limit snapshot for a single GitHub API category.
 *
 * @remarks
 * `warning` is set automatically when `remaining < limit * 0.1`.
 *
 * @category GitHub Client
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
  /** Present when remaining calls fall below 10 % of the total limit. */
  warning?: string;
}

/**
 * Aggregated rate limit status across GitHub's REST, search, and GraphQL
 * API categories.
 *
 * @category GitHub Client
 */
export interface RateLimitStatus {
  core: RateLimitInfo & { percentageRemaining: number };
  search: RateLimitInfo & { percentageRemaining: number };
  graphql: RateLimitInfo & { percentageRemaining: number };
}

/**
 * Result of a budget reservation attempt via
 * {@link RateLimitHandler.reserveBudget}.
 *
 * @remarks
 * When `reserved` is `false`, `waitTime` (milliseconds until reset) and
 * `reason` explain why the reservation failed.
 *
 * @category GitHub Client
 */
export interface BudgetReservation {
  reserved: boolean;
  reason?: string;
  waitTime?: number;
}

/**
 * Manages GitHub API rate limits and provides budget-reservation utilities
 * for batch operations.
 *
 * @remarks
 * Use {@link RateLimitHandler.reserveBudget} before starting a batch of API
 * calls to verify that sufficient quota exists.  Use
 * {@link RateLimitHandler.waitIfNeeded} as a simpler "wait until safe"
 * primitive.
 *
 * @category GitHub Client
 *
 * @useWhen
 * Coordinating large batches of GitHub API calls (e.g., checking 100+
 * dependencies in one monitor run) where you need pre-flight quota checks.
 *
 * @avoidWhen
 * Making a small number of one-off API calls — use {@link GitHubClient}
 * with its built-in threshold check instead.
 *
 * @never
 * - `reserveBudget` does **not** lock the quota — another process could
 *   consume the reserved capacity between the check and the actual calls.
 * - The handler does not track the search or GraphQL categories
 *   individually for budget reservation; use `getRateLimitStatus` to
 *   inspect those limits manually.
 */
export class RateLimitHandler {
  private octokit: Octokit;
  private lastCheck?: RateLimitStatus;
  private lastCheckTime?: Date;

  constructor(auth?: string) {
    this.octokit = new Octokit({
      auth: auth || process.env['GITHUB_TOKEN']
    });
  }

  /**
   * Checks current rate limit status
   */
  async checkRateLimit(): Promise<RateLimitInfo> {
    const response = await this.octokit.rest.rateLimit.get();
    const { rate } = response.data;

    const info: RateLimitInfo = {
      limit: rate.limit,
      remaining: rate.remaining,
      reset: new Date(rate.reset * 1000),
      used: rate.used
    };

    // Add warning if approaching limit
    if (info.remaining < info.limit * 0.1) {
      info.warning = `Only ${info.remaining} requests remaining. Reset at ${info.reset.toISOString()}`;
    }

    return info;
  }

  /**
   * Waits if rate limited
   */
  async waitIfNeeded(): Promise<void> {
    const rateLimit = await this.checkRateLimit();

    if (rateLimit.remaining === 0) {
      const waitTime = this.calculateWaitTime(rateLimit);
      if (waitTime > 0) {
        console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds until reset...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Calculates wait time until rate limit resets
   */
  calculateWaitTime(rateLimitInfo: RateLimitInfo): number {
    if (rateLimitInfo.remaining > 0) {
      return 0;
    }

    const now = Date.now();
    const resetTime = rateLimitInfo.reset.getTime();
    const waitTime = Math.max(0, resetTime - now);

    return waitTime;
  }

  /**
   * Attempts to reserve API call budget with proactive checking
   */
  async reserveBudget(
    callsNeeded: number,
    options?: {
      safetyMargin?: number; // Additional buffer (default: 10% of calls needed)
      maxWaitTime?: number; // Max time to wait in ms
    }
  ): Promise<BudgetReservation> {
    const safetyMargin = options?.safetyMargin ?? Math.ceil(callsNeeded * 0.1);
    const totalNeeded = callsNeeded + safetyMargin;

    const rateLimit = await this.checkRateLimit();

    if (rateLimit.remaining >= totalNeeded) {
      return {
        reserved: true
      };
    }

    const waitTime = this.calculateWaitTime(rateLimit);

    // Check if wait time exceeds maximum allowed
    if (options?.maxWaitTime && waitTime > options.maxWaitTime) {
      return {
        reserved: false,
        reason: `Wait time (${Math.ceil(waitTime / 1000)}s) exceeds maximum (${Math.ceil(options.maxWaitTime / 1000)}s)`,
        waitTime
      };
    }

    return {
      reserved: false,
      reason: `Insufficient API quota. Need ${callsNeeded} + ${safetyMargin} margin, have ${rateLimit.remaining}`,
      waitTime
    };
  }

  /**
   * Proactively check if operation can proceed without hitting rate limit
   */
  async canProceed(
    estimatedCalls: number,
    options?: {
      threshold?: number; // Minimum remaining calls (default: 100)
      safetyMargin?: number;
    }
  ): Promise<{ canProceed: boolean; reason?: string }> {
    const threshold = options?.threshold ?? 100;
    const safetyMargin = options?.safetyMargin ?? Math.ceil(estimatedCalls * 0.1);
    const totalNeeded = estimatedCalls + safetyMargin;

    const rateLimit = await this.checkRateLimit();

    // Check if we have enough remaining calls
    if (rateLimit.remaining < totalNeeded) {
      return {
        canProceed: false,
        reason: `Insufficient quota: need ${totalNeeded}, have ${rateLimit.remaining}`
      };
    }

    // Check if we'd drop below threshold
    if (rateLimit.remaining - totalNeeded < threshold) {
      return {
        canProceed: false,
        reason: `Operation would leave only ${rateLimit.remaining - totalNeeded} calls (threshold: ${threshold})`
      };
    }

    return { canProceed: true };
  }

  /**
   * Gets detailed rate limit status for all API categories
   */
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const response = await this.octokit.rest.rateLimit.get();
    const { resources } = response.data;

    const createInfo = (resource: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    }): RateLimitInfo & { percentageRemaining: number } => ({
      limit: resource.limit,
      remaining: resource.remaining,
      reset: new Date(resource.reset * 1000),
      used: resource.used,
      percentageRemaining: resource.limit > 0 ? (resource.remaining / resource.limit) * 100 : 0
    });

    const status: RateLimitStatus = {
      core: createInfo(resources.core),
      search: createInfo(resources.search),
      graphql: createInfo(resources.graphql || { limit: 0, remaining: 0, reset: 0, used: 0 })
    };

    this.lastCheck = status;
    this.lastCheckTime = new Date();

    return status;
  }

  /**
   * Gets cached rate limit status (avoids API call)
   */
  getCachedStatus(): RateLimitStatus | undefined {
    // Return cached status if less than 60 seconds old
    if (this.lastCheck && this.lastCheckTime) {
      const age = Date.now() - this.lastCheckTime.getTime();
      if (age < 60000) {
        return this.lastCheck;
      }
    }
    return undefined;
  }
}
