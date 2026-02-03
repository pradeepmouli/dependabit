import { describe, it, expect } from 'vitest';
import { parseAgentConfig, type AgentAssignmentConfig } from '../../src/utils/agent-config.js';
import type { DependabitConfig } from '@dependabit/manifest';

describe('Agent Config Parser', () => {
  describe('parseAgentConfig', () => {
    it('should parse agent assignment configuration', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' },
        issues: {
          labels: ['dependabit'],
          assignees: [],
          aiAgentAssignment: {
            enabled: true,
            breaking: 'copilot',
            major: 'claude',
            minor: 'copilot'
          }
        }
      };

      const result = parseAgentConfig(config);

      expect(result.enabled).toBe(true);
      expect(result.severityMapping).toEqual({
        breaking: 'copilot',
        major: 'claude',
        minor: 'copilot'
      });
    });

    it('should return disabled config when aiAgentAssignment is not set', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      const result = parseAgentConfig(config);

      expect(result.enabled).toBe(false);
      expect(result.severityMapping).toEqual({});
    });

    it('should return disabled config when aiAgentAssignment is explicitly disabled', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' },
        issues: {
          labels: ['dependabit'],
          assignees: [],
          aiAgentAssignment: {
            enabled: false,
            breaking: 'copilot'
          }
        }
      };

      const result = parseAgentConfig(config);

      expect(result.enabled).toBe(false);
    });

    it('should handle partial severity mappings', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' },
        issues: {
          labels: ['dependabit'],
          assignees: [],
          aiAgentAssignment: {
            enabled: true,
            breaking: 'copilot'
            // major and minor not specified
          }
        }
      };

      const result = parseAgentConfig(config);

      expect(result.enabled).toBe(true);
      expect(result.severityMapping.breaking).toBe('copilot');
      expect(result.severityMapping.major).toBeUndefined();
      expect(result.severityMapping.minor).toBeUndefined();
    });

    it('should normalize agent names to lowercase', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' },
        issues: {
          labels: ['dependabit'],
          assignees: [],
          aiAgentAssignment: {
            enabled: true,
            breaking: 'COPILOT',
            major: 'Claude',
            minor: 'CoPiLoT'
          }
        }
      };

      const result = parseAgentConfig(config);

      expect(result.severityMapping).toEqual({
        breaking: 'copilot',
        major: 'claude',
        minor: 'copilot'
      });
    });
  });
});
