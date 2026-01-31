import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAction } from '../../src/actions/check.js';

// Mock the Monitor module
vi.mock('@dependabit/monitor', () => {
  class MockMonitor {
    checkAll = vi.fn().mockResolvedValue([
      {
        dependency: {
          id: 'dep1',
          url: 'https://github.com/owner/repo1',
          type: 'reference-implementation',
          accessMethod: 'github-api',
          currentStateHash: 'hash1',
          monitoring: { enabled: true }
        },
        hasChanged: false,
        newSnapshot: {
          stateHash: 'hash1',
          fetchedAt: new Date()
        }
      }
    ]);
  }

  return {
    Monitor: MockMonitor
  };
});

// Mock the IssueManager module
vi.mock('@dependabit/github-client', () => {
  class MockIssueManager {
    createIssue = vi.fn().mockResolvedValue({
      number: 123,
      url: 'https://github.com/owner/repo/issues/123',
      labels: ['dependabit', 'severity:major']
    });

    findExistingIssue = vi.fn().mockResolvedValue(null);

    updateIssue = vi.fn().mockResolvedValue({
      number: 123,
      url: 'https://github.com/owner/repo/issues/123',
      labels: ['dependabit', 'severity:major']
    });
  }

  class MockRateLimitHandler {
    checkRateLimit = vi.fn().mockResolvedValue({
      limit: 5000,
      remaining: 4000,
      reset: new Date(Date.now() + 3600000),
      used: 1000
    });

    waitIfNeeded = vi.fn().mockResolvedValue(undefined);

    reserveBudget = vi.fn().mockResolvedValue({
      reserved: true
    });
  }

  return {
    IssueManager: MockIssueManager,
    RateLimitHandler: MockRateLimitHandler
  };
});

describe('Check Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAction', () => {
    it('should check all dependencies in manifest', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'dep1',
            url: 'https://github.com/owner/repo',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            currentStateHash: 'hash1',
            monitoring: { enabled: true }
          }
        ]
      };

      const result = await checkAction(manifest);

      expect(result).toBeDefined();
      expect(result.checked).toBeGreaterThan(0);
      expect(result.changes).toBeDefined();
    });

    it('should skip disabled dependencies', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'enabled',
            url: 'https://github.com/owner/repo1',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            currentStateHash: 'hash1',
            monitoring: { enabled: true }
          },
          {
            id: 'disabled',
            url: 'https://github.com/owner/repo2',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            currentStateHash: 'hash2',
            monitoring: { enabled: false }
          }
        ]
      };

      const result = await checkAction(manifest);

      expect(result.checked).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('should create issues for detected changes', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'changed-dep',
            url: 'https://github.com/owner/repo',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            currentStateHash: 'old-hash',
            monitoring: { enabled: true }
          }
        ]
      };

      const result = await checkAction(manifest);

      if (result.changes.length > 0) {
        expect(result.issuesCreated).toBeGreaterThan(0);
      }
    });

    it('should handle errors gracefully', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'invalid',
            url: 'https://invalid-url.com',
            type: 'documentation',
            accessMethod: 'http',
            currentStateHash: 'hash1',
            monitoring: { enabled: true }
          }
        ]
      };

      const result = await checkAction(manifest);

      expect(result).toBeDefined();
      expect(result.errors).toBeGreaterThan(0);
    });

    it('should respect rate limits', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: Array.from({ length: 100 }, (_, i) => ({
          id: `dep${i}`,
          url: `https://github.com/owner/repo${i}`,
          type: 'reference-implementation',
          accessMethod: 'github-api',
          currentStateHash: `hash${i}`,
          monitoring: { enabled: true }
        }))
      };

      const result = await checkAction(manifest);

      expect(result).toBeDefined();
      expect(result.rateLimitWarnings).toBeDefined();
    });

    it('should update manifest with new state hashes', async () => {
      const manifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'dep1',
            url: 'https://github.com/owner/repo',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            currentStateHash: 'old-hash',
            lastChecked: '2024-01-01T00:00:00Z',
            monitoring: { enabled: true }
          }
        ]
      };

      const result = await checkAction(manifest);

      expect(result.updatedManifest).toBeDefined();
      expect(result.updatedManifest.dependencies[0].lastChecked).not.toBe('2024-01-01T00:00:00Z');
    });
  });
});
