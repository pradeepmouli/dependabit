/**
 * Rate Limit Handler
 * Manages GitHub API rate limits and request budgeting
 */

import { Octokit } from 'octokit';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
  warning?: string;
}

export interface RateLimitStatus {
  core: RateLimitInfo & { percentageRemaining: number };
  search: RateLimitInfo & { percentageRemaining: number };
  graphql: RateLimitInfo & { percentageRemaining: number };
}

export interface BudgetReservation {
  reserved: boolean;
  reason?: string;
  waitTime?: number;
}

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
  async reserveBudget(callsNeeded: number, options?: {
    safetyMargin?: number; // Additional buffer (default: 10% of calls needed)
    maxWaitTime?: number; // Max time to wait in ms
  }): Promise<BudgetReservation> {
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
  async canProceed(estimatedCalls: number, options?: {
    threshold?: number; // Minimum remaining calls (default: 100)
    safetyMargin?: number;
  }): Promise<{ canProceed: boolean; reason?: string }> {
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
