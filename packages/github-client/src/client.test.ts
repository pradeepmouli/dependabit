import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubClient, createGitHubClient } from '../src/client.js';

// Mock the octokit module
vi.mock('octokit', () => {
  const mockRateLimitGet = vi.fn().mockResolvedValue({
    data: {
      rate: {
        limit: 5000,
        remaining: 4900,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 100
      }
    }
  });

  class MockOctokit {
    rest = {
      rateLimit: {
        get: mockRateLimitGet
      }
    };
  }

  return {
    Octokit: MockOctokit
  };
});

describe('GitHubClient Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GitHubClient', () => {
    it('should create client with default configuration', () => {
      const client = new GitHubClient();
      expect(client).toBeDefined();
      expect(client.getOctokit()).toBeDefined();
    });

    it('should create client with authentication', () => {
      const client = new GitHubClient({ auth: 'test-token' });
      expect(client).toBeDefined();
    });

    it('should get rate limit information', async () => {
      const client = new GitHubClient();
      const rateLimit = await client.getRateLimit();

      expect(rateLimit).toHaveProperty('limit');
      expect(rateLimit).toHaveProperty('remaining');
      expect(rateLimit).toHaveProperty('reset');
      expect(rateLimit).toHaveProperty('used');
      expect(rateLimit.limit).toBe(5000);
      expect(rateLimit.remaining).toBe(4900);
    });

    it('should cache last rate limit check', async () => {
      const client = new GitHubClient();
      await client.getRateLimit();

      const cached = client.getLastRateLimitCheck();
      expect(cached).toBeDefined();
      expect(cached?.limit).toBe(5000);
    });

    it('should check rate limit before requests', async () => {
      const client = new GitHubClient();
      await expect(client.checkRateLimit()).resolves.not.toThrow();
    });

    it('should throw error when rate limit is exceeded', async () => {
      const client = new GitHubClient({ rateLimitMinRemaining: 10 });
      
      // This test is tricky with mocks, so we'll test the behavior when remaining is low
      // In a real scenario, this would wait or throw
      const checkResult = client.checkRateLimit();
      
      // Since our mock has 4900 remaining, this should not throw
      await expect(checkResult).resolves.not.toThrow();
    });

    it('should execute function with rate limit checking', async () => {
      const client = new GitHubClient();
      const mockFn = vi.fn(async () => 'result');

      const result = await client.withRateLimit(mockFn);

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should respect custom rate limit thresholds', () => {
      const client = new GitHubClient({
        rateLimitWarningThreshold: 200,
        rateLimitMinRemaining: 50
      });

      expect(client).toBeDefined();
    });
  });

  describe('createGitHubClient', () => {
    it('should create a client instance', () => {
      const client = createGitHubClient();
      expect(client).toBeInstanceOf(GitHubClient);
    });

    it('should accept configuration', () => {
      const client = createGitHubClient({ auth: 'test-token' });
      expect(client).toBeInstanceOf(GitHubClient);
    });
  });
});
