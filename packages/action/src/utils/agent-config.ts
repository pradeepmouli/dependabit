import type { DependabitConfig, Severity } from '@dependabit/manifest';

/**
 * Agent assignment configuration
 */
export interface AgentAssignmentConfig {
  enabled: boolean;
  severityMapping: {
    breaking?: string;
    major?: string;
    minor?: string;
  };
}

/**
 * Parse AI agent assignment configuration from config
 *
 * Extracts severity-to-agent mapping from config.yml:
 *
 * ```yaml
 * issues:
 *   aiAgentAssignment:
 *     enabled: true
 *     breaking: copilot
 *     major: claude
 *     minor: copilot
 * ```
 *
 * @param config Dependabit configuration
 * @returns Agent assignment configuration
 */
export function parseAgentConfig(config: DependabitConfig): AgentAssignmentConfig {
  const aiAgentAssignment = config.issues?.aiAgentAssignment;

  if (!aiAgentAssignment || !aiAgentAssignment.enabled) {
    return {
      enabled: false,
      severityMapping: {}
    };
  }

  // Normalize agent names to lowercase
  const severityMapping: Record<string, string> = {};

  if (aiAgentAssignment.breaking) {
    severityMapping['breaking'] = aiAgentAssignment.breaking.toLowerCase();
  }

  if (aiAgentAssignment.major) {
    severityMapping['major'] = aiAgentAssignment.major.toLowerCase();
  }

  if (aiAgentAssignment.minor) {
    severityMapping['minor'] = aiAgentAssignment.minor.toLowerCase();
  }

  return {
    enabled: true,
    severityMapping
  };
}
