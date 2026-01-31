import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubRepoChecker } from '../../src/checkers/github-repo.js';

describe('GitHubRepoChecker', () => {
  let checker: GitHubRepoChecker;

  beforeEach(() => {
    checker = new GitHubRepoChecker();
    vi.clearAllMocks();
  });

  describe('fetch', () => {
    it('should fetch latest release information', async () => {
      const config = {
        url: 'https://github.com/owner/repo',
        accessMethod: 'github-api' as const
      };

      const result = await checker.fetch(config);

      expect(result).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.stateHash).toBeDefined();
      expect(result.fetchedAt).toBeInstanceOf(Date);
    });

    it('should handle repositories without releases', async () => {
      const config = {
        url: 'https://github.com/owner/no-releases',
        accessMethod: 'github-api' as const
      };

      const result = await checker.fetch(config);

      expect(result).toBeDefined();
      expect(result.version).toBeUndefined();
    });

    it('should throw error for invalid GitHub URL', async () => {
      const config = {
        url: 'https://example.com/not-github',
        accessMethod: 'github-api' as const
      };

      await expect(checker.fetch(config)).rejects.toThrow();
    });
  });

  describe('compare', () => {
    it('should detect version changes', async () => {
      const prev = {
        version: 'v1.0.0',
        stateHash: 'hash1',
        fetchedAt: new Date('2024-01-01')
      };

      const curr = {
        version: 'v1.1.0',
        stateHash: 'hash2',
        fetchedAt: new Date('2024-01-02')
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('version');
    });

    it('should return no change when versions match', async () => {
      const prev = {
        version: 'v1.0.0',
        stateHash: 'hash1',
        fetchedAt: new Date('2024-01-01')
      };

      const curr = {
        version: 'v1.0.0',
        stateHash: 'hash1',
        fetchedAt: new Date('2024-01-02')
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(false);
    });
  });
});
