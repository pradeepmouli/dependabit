import { describe, it, expect } from 'vitest';
import { Context7Checker } from './checker.js';
import type { Context7Snapshot } from './checker.js';

describe('Context7Checker', () => {
  describe('compare', () => {
    const checker = new Context7Checker();

    const createSnapshot = (version: string): Context7Snapshot => ({
      version,
      stateHash: 'hash123',
      fetchedAt: new Date('2024-01-01'),
      metadata: {
        libraryId: 'test-lib',
        libraryName: 'Test Library',
        lastUpdated: '2024-01-01T00:00:00Z'
      }
    });

    it('should detect breaking change for major version bump', async () => {
      const prev = createSnapshot('1.0.0');
      const curr = createSnapshot('2.0.0');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('breaking');
      expect(result.changes).toContain('version');
    });

    it('should detect major change for minor version bump', async () => {
      const prev = createSnapshot('1.0.0');
      const curr = createSnapshot('1.1.0');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('major');
      expect(result.changes).toContain('version');
    });

    it('should detect minor change for patch version bump', async () => {
      const prev = createSnapshot('1.0.0');
      const curr = createSnapshot('1.0.1');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('minor');
      expect(result.changes).toContain('version');
    });

    it('should handle versions with v prefix', async () => {
      const prev = createSnapshot('v1.0.0');
      const curr = createSnapshot('v2.0.0');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('breaking');
    });

    it('should handle non-semver versions gracefully', async () => {
      const prev = createSnapshot('unknown');
      const curr = createSnapshot('latest');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('minor'); // Conservative default
      expect(result.changes).toContain('version');
    });

    it('should handle partial version numbers', async () => {
      const prev = createSnapshot('1.2');
      const curr = createSnapshot('2.0');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('breaking');
    });

    it('should not report change when versions are identical', async () => {
      const prev = createSnapshot('1.0.0');
      const curr = createSnapshot('1.0.0');
      const result = await checker.compare(prev, curr);

      expect(result.changes).not.toContain('version');
    });

    it('should handle prerelease versions', async () => {
      const prev = createSnapshot('1.0.0');
      const curr = createSnapshot('2.0.0-beta.1');
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.severity).toBe('breaking');
    });

    it('should detect content changes when hash differs', async () => {
      const prev: Context7Snapshot = {
        version: '1.0.0',
        stateHash: 'hash123',
        fetchedAt: new Date('2024-01-01'),
        metadata: {
          libraryId: 'test-lib',
          libraryName: 'Test Library',
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };
      const curr: Context7Snapshot = {
        ...prev,
        stateHash: 'hash456'
      };
      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('content');
    });
  });
});
