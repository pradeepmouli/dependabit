import { describe, it, expect, beforeEach } from 'vitest';
import { StateComparator } from '../src/comparator.js';

describe('StateComparator', () => {
  let comparator: StateComparator;

  beforeEach(() => {
    comparator = new StateComparator();
  });

  describe('compare', () => {
    it('should detect state hash changes', () => {
      const oldState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-01')
      };

      const newState = {
        stateHash: 'def456',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-02')
      };

      const result = comparator.compare(oldState, newState);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('stateHash');
    });

    it('should detect version changes', () => {
      const oldState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-01')
      };

      const newState = {
        stateHash: 'abc123',
        version: 'v2.0.0',
        fetchedAt: new Date('2024-01-02')
      };

      const result = comparator.compare(oldState, newState);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('version');
    });

    it('should return no change when states match', () => {
      const oldState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-01')
      };

      const newState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-02')
      };

      const result = comparator.compare(oldState, newState);

      expect(result.hasChanged).toBe(false);
      expect(result.changes).toHaveLength(0);
    });

    it('should detect multiple changes', () => {
      const oldState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        metadata: { author: 'Alice' },
        fetchedAt: new Date('2024-01-01')
      };

      const newState = {
        stateHash: 'def456',
        version: 'v2.0.0',
        metadata: { author: 'Bob' },
        fetchedAt: new Date('2024-01-02')
      };

      const result = comparator.compare(oldState, newState);

      expect(result.hasChanged).toBe(true);
      expect(result.changes.length).toBeGreaterThan(1);
    });

    it('should handle missing version in old state', () => {
      const oldState = {
        stateHash: 'abc123',
        fetchedAt: new Date('2024-01-01')
      };

      const newState = {
        stateHash: 'abc123',
        version: 'v1.0.0',
        fetchedAt: new Date('2024-01-02')
      };

      const result = comparator.compare(oldState, newState);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('version');
    });
  });
});
