import { describe, it, expect } from 'vitest';
import {
  routeToAgent,
  getAssigneeLabel,
  type AgentAssignmentConfig
} from '../../src/utils/agent-router.js';
import type { Severity } from '@dependabit/manifest';

describe('Agent Router', () => {
  describe('routeToAgent', () => {
    it('should route breaking changes to configured agent', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {
          breaking: 'copilot',
          major: 'claude',
          minor: 'copilot'
        }
      };

      const result = routeToAgent('breaking', config);

      expect(result).toBe('copilot');
    });

    it('should route major changes to configured agent', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {
          breaking: 'copilot',
          major: 'claude',
          minor: 'copilot'
        }
      };

      const result = routeToAgent('major', config);

      expect(result).toBe('claude');
    });

    it('should route minor changes to configured agent', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {
          breaking: 'copilot',
          major: 'claude',
          minor: 'copilot'
        }
      };

      const result = routeToAgent('minor', config);

      expect(result).toBe('copilot');
    });

    it('should return null when routing is disabled', () => {
      const config: AgentAssignmentConfig = {
        enabled: false,
        severityMapping: {
          breaking: 'copilot'
        }
      };

      const result = routeToAgent('breaking', config);

      expect(result).toBeNull();
    });

    it('should return null when no mapping exists for severity', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {
          breaking: 'copilot'
          // major and minor not specified
        }
      };

      const result = routeToAgent('major', config);

      expect(result).toBeNull();
    });

    it('should return null for unknown severity levels', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {
          breaking: 'copilot',
          major: 'claude',
          minor: 'copilot'
        }
      };

      const result = routeToAgent('unknown' as Severity, config);

      expect(result).toBeNull();
    });

    it('should handle empty severity mapping', () => {
      const config: AgentAssignmentConfig = {
        enabled: true,
        severityMapping: {}
      };

      const result = routeToAgent('breaking', config);

      expect(result).toBeNull();
    });
  });

  describe('getAssigneeLabel', () => {
    it('should generate assignee label for copilot', () => {
      const result = getAssigneeLabel('copilot');

      expect(result).toBe('assigned:copilot');
    });

    it('should generate assignee label for claude', () => {
      const result = getAssigneeLabel('claude');

      expect(result).toBe('assigned:claude');
    });

    it('should handle null agent gracefully', () => {
      const result = getAssigneeLabel(null);

      expect(result).toBeNull();
    });
  });
});
