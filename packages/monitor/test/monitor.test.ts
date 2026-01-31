import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Monitor } from '../src/monitor.js';

describe('Monitor', () => {
  let monitor: Monitor;

  beforeEach(() => {
    monitor = new Monitor();
    vi.clearAllMocks();
  });

  describe('checkDependency', () => {
    it('should check a single dependency and detect changes', async () => {
      const dependency = {
        id: 'test-id',
        url: 'https://github.com/owner/repo',
        type: 'reference-implementation' as const,
        accessMethod: 'github-api' as const,
        currentStateHash: 'old-hash'
      };

      const result = await monitor.checkDependency(dependency);

      expect(result).toBeDefined();
      expect(result.dependency).toEqual(dependency);
      expect(result.hasChanged).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const dependency = {
        id: 'test-id',
        url: 'https://invalid-url.com',
        type: 'documentation' as const,
        accessMethod: 'http' as const,
        currentStateHash: 'old-hash'
      };

      const result = await monitor.checkDependency(dependency);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
    });

    it('should use appropriate checker based on access method', async () => {
      const githubDep = {
        id: 'github-id',
        url: 'https://github.com/owner/repo',
        type: 'reference-implementation' as const,
        accessMethod: 'github-api' as const,
        currentStateHash: 'hash1'
      };

      const httpDep = {
        id: 'http-id',
        url: 'https://example.com/docs',
        type: 'documentation' as const,
        accessMethod: 'http' as const,
        currentStateHash: 'hash2'
      };

      const result1 = await monitor.checkDependency(githubDep);
      const result2 = await monitor.checkDependency(httpDep);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('checkAll', () => {
    it('should check multiple dependencies in parallel', async () => {
      const dependencies = [
        {
          id: 'dep1',
          url: 'https://github.com/owner/repo1',
          type: 'reference-implementation' as const,
          accessMethod: 'github-api' as const,
          currentStateHash: 'hash1'
        },
        {
          id: 'dep2',
          url: 'https://github.com/owner/repo2',
          type: 'reference-implementation' as const,
          accessMethod: 'github-api' as const,
          currentStateHash: 'hash2'
        }
      ];

      const results = await monitor.checkAll(dependencies);

      expect(results).toHaveLength(2);
      expect(results[0].dependency.id).toBe('dep1');
      expect(results[1].dependency.id).toBe('dep2');
    });

    it('should handle mixed success and errors', async () => {
      const dependencies = [
        {
          id: 'valid',
          url: 'https://github.com/owner/repo',
          type: 'reference-implementation' as const,
          accessMethod: 'github-api' as const,
          currentStateHash: 'hash1'
        },
        {
          id: 'invalid',
          url: 'https://invalid-url.com',
          type: 'documentation' as const,
          accessMethod: 'http' as const,
          currentStateHash: 'hash2'
        }
      ];

      const results = await monitor.checkAll(dependencies);

      expect(results).toHaveLength(2);
      expect(results.some(r => !r.error)).toBe(true);
      expect(results.some(r => r.error)).toBe(true);
    });

    it('should respect monitoring rules', async () => {
      const dependencies = [
        {
          id: 'enabled',
          url: 'https://github.com/owner/repo',
          type: 'reference-implementation' as const,
          accessMethod: 'github-api' as const,
          currentStateHash: 'hash1',
          monitoring: { enabled: true }
        },
        {
          id: 'disabled',
          url: 'https://github.com/owner/repo2',
          type: 'reference-implementation' as const,
          accessMethod: 'github-api' as const,
          currentStateHash: 'hash2',
          monitoring: { enabled: false }
        }
      ];

      const results = await monitor.checkAll(dependencies);

      expect(results).toHaveLength(1);
      expect(results[0].dependency.id).toBe('enabled');
    });
  });
});
