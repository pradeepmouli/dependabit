import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitHandler } from '../src/rate-limit.js';

describe('RateLimitHandler', () => {
  let handler: RateLimitHandler;

  beforeEach(() => {
    handler = new RateLimitHandler();
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should return rate limit status', async () => {
      const result = await handler.checkRateLimit();

      expect(result).toBeDefined();
      expect(result.limit).toBeGreaterThan(0);
      expect(result.remaining).toBeDefined();
      expect(result.reset).toBeInstanceOf(Date);
    });

    it('should warn when approaching rate limit', async () => {
      const result = await handler.checkRateLimit();

      if (result.remaining < result.limit * 0.1) {
        expect(result.warning).toBeDefined();
      }
    });
  });

  describe('waitIfNeeded', () => {
    it('should not wait when rate limit is sufficient', async () => {
      const startTime = Date.now();
      await handler.waitIfNeeded();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should calculate wait time when rate limited', async () => {
      const rateLimitInfo = {
        limit: 5000,
        remaining: 0,
        reset: new Date(Date.now() + 60000) // 1 minute from now
      };

      const waitTime = handler.calculateWaitTime(rateLimitInfo);

      expect(waitTime).toBeGreaterThan(0);
      expect(waitTime).toBeLessThanOrEqual(60000);
    });

    it('should return 0 wait time when not rate limited', () => {
      const rateLimitInfo = {
        limit: 5000,
        remaining: 4000,
        reset: new Date(Date.now() + 3600000)
      };

      const waitTime = handler.calculateWaitTime(rateLimitInfo);

      expect(waitTime).toBe(0);
    });
  });

  describe('reserveBudget', () => {
    it('should reserve API call budget', async () => {
      const result = await handler.reserveBudget(10);

      expect(result).toBeDefined();
      expect(result.reserved).toBe(true);
    });

    it('should reject when insufficient budget', async () => {
      const result = await handler.reserveBudget(10000);

      expect(result.reserved).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should provide wait time when budget unavailable', async () => {
      const result = await handler.reserveBudget(10000);

      if (!result.reserved) {
        expect(result.waitTime).toBeDefined();
      }
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', async () => {
      const status = await handler.getRateLimitStatus();

      expect(status).toBeDefined();
      expect(status.core).toBeDefined();
      expect(status.search).toBeDefined();
      expect(status.graphql).toBeDefined();
    });

    it('should include percentage remaining', async () => {
      const status = await handler.getRateLimitStatus();

      expect(status.core.percentageRemaining).toBeDefined();
      expect(status.core.percentageRemaining).toBeGreaterThanOrEqual(0);
      expect(status.core.percentageRemaining).toBeLessThanOrEqual(100);
    });
  });
});
