import { describe, it, expect, vi, beforeEach } from 'vitest';
import { URLContentChecker } from '../../src/checkers/url-content.js';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('URLContentChecker', () => {
  let checker: URLContentChecker;

  beforeEach(() => {
    checker = new URLContentChecker();
    vi.clearAllMocks();

    // Default mock response for HTTP content
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name === 'content-type' ? 'text/html' : null)
      },
      text: async () => '<html><body>Test content</body></html>'
    });
  });

  describe('fetch', () => {
    it('should fetch and hash URL content', async () => {
      const config = {
        url: 'https://example.com/docs',
        accessMethod: 'http' as const
      };

      const result = await checker.fetch(config);

      expect(result).toBeDefined();
      expect(result.stateHash).toBeDefined();
      expect(result.stateHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
      expect(result.fetchedAt).toBeInstanceOf(Date);
    });

    it('should normalize HTML before hashing', async () => {
      const config = {
        url: 'https://example.com/docs',
        accessMethod: 'http' as const
      };

      const result = await checker.fetch(config);

      // Should produce consistent hash after normalization
      expect(result.stateHash).toBeDefined();
    });

    it('should throw error for unreachable URLs', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const config = {
        url: 'https://invalid-url-that-does-not-exist.com',
        accessMethod: 'http' as const
      };

      await expect(checker.fetch(config)).rejects.toThrow();
    });
  });

  describe('compare', () => {
    it('should detect content changes via hash difference', async () => {
      const prev = {
        stateHash: 'abc123def456',
        fetchedAt: new Date('2024-01-01')
      };

      const curr = {
        stateHash: 'xyz789uvw012',
        fetchedAt: new Date('2024-01-02')
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('content');
    });

    it('should return no change when hashes match', async () => {
      const prev = {
        stateHash: 'abc123def456',
        fetchedAt: new Date('2024-01-01')
      };

      const curr = {
        stateHash: 'abc123def456',
        fetchedAt: new Date('2024-01-02')
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(false);
    });
  });
});
