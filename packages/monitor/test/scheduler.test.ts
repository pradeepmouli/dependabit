import { describe, it, expect, beforeEach } from 'vitest';
import { Scheduler, type SchedulerOptions } from '../src/scheduler.js';
import type { DependencyEntry, DependabitConfig } from '@dependabit/manifest';

describe('Scheduler', () => {
  let scheduler: Scheduler;
  const now = new Date('2026-01-31T10:00:00Z');

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  describe('shouldCheckDependency', () => {
    it('should check dependency based on daily frequency', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-30T10:00:00Z',
        lastChecked: '2026-01-30T10:00:00Z', // 24 hours ago
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'daily',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(true);
    });

    it('should not check dependency if checked recently', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-31T09:00:00Z',
        lastChecked: '2026-01-31T09:00:00Z', // 1 hour ago
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'daily',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(false);
    });

    it('should respect hourly frequency', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-31T08:00:00Z',
        lastChecked: '2026-01-31T08:00:00Z', // 2 hours ago
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'hourly',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(true);
    });

    it('should respect weekly frequency', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-24T10:00:00Z',
        lastChecked: '2026-01-24T10:00:00Z', // 7 days ago
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'weekly',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(true);
    });

    it('should respect monthly frequency', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2025-12-31T10:00:00Z',
        lastChecked: '2025-12-31T10:00:00Z', // 31 days ago
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'monthly',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(true);
    });

    it('should not check disabled dependencies', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-30T10:00:00Z',
        lastChecked: '2026-01-30T10:00:00Z',
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: false,
          checkFrequency: 'daily',
          ignoreChanges: false
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(false);
    });

    it('should apply config overrides for check frequency', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-31T08:00:00Z',
        lastChecked: '2026-01-31T08:00:00Z', // 2 hours ago
        referencedIn: [],
        changeHistory: []
        // No monitoring specified in dependency
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' },
        dependencies: [
          {
            url: 'https://github.com/test/repo',
            monitoring: {
              enabled: true,
              checkFrequency: 'hourly',
              ignoreChanges: false
            }
          }
        ]
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(true);
    });

    it('should skip dependencies with ignoreChanges flag', () => {
      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/repo',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'Test',
        currentStateHash: 'hash1',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-30T10:00:00Z',
        lastChecked: '2026-01-30T10:00:00Z',
        referencedIn: [],
        changeHistory: [],
        monitoring: {
          enabled: true,
          checkFrequency: 'daily',
          ignoreChanges: true
        }
      };

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.shouldCheckDependency(dependency, config, now);

      expect(result).toBe(false);
    });
  });

  describe('filterDependenciesToCheck', () => {
    it('should filter dependencies based on schedule', () => {
      const dependencies: DependencyEntry[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          url: 'https://github.com/test/repo1',
          type: 'reference-implementation',
          accessMethod: 'github-api',
          name: 'Test1',
          currentStateHash: 'hash1',
          detectionMethod: 'manual',
          detectionConfidence: 1.0,
          detectedAt: '2026-01-30T10:00:00Z',
          lastChecked: '2026-01-30T10:00:00Z', // Should check
          referencedIn: [],
          changeHistory: [],
          monitoring: {
            enabled: true,
            checkFrequency: 'daily',
            ignoreChanges: false
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          url: 'https://github.com/test/repo2',
          type: 'reference-implementation',
          accessMethod: 'github-api',
          name: 'Test2',
          currentStateHash: 'hash2',
          detectionMethod: 'manual',
          detectionConfidence: 1.0,
          detectedAt: '2026-01-31T09:30:00Z',
          lastChecked: '2026-01-31T09:30:00Z', // Too recent
          referencedIn: [],
          changeHistory: [],
          monitoring: {
            enabled: true,
            checkFrequency: 'daily',
            ignoreChanges: false
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          url: 'https://github.com/test/repo3',
          type: 'reference-implementation',
          accessMethod: 'github-api',
          name: 'Test3',
          currentStateHash: 'hash3',
          detectionMethod: 'manual',
          detectionConfidence: 1.0,
          detectedAt: '2026-01-30T10:00:00Z',
          lastChecked: '2026-01-30T10:00:00Z',
          referencedIn: [],
          changeHistory: [],
          monitoring: {
            enabled: false, // Disabled
            checkFrequency: 'daily',
            ignoreChanges: false
          }
        }
      ];

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = scheduler.filterDependenciesToCheck(dependencies, config, now);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('550e8400-e29b-41d4-a716-446655440001');
    });
  });
});
