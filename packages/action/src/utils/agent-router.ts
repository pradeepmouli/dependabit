import type { Severity } from '@dependabit/manifest';
import type { AgentAssignmentConfig } from './agent-config';
/**
 * Route issue to appropriate AI agent based on severity
 *
 * Uses severity-to-agent mapping from configuration to determine
 * which AI agent should be assigned to handle the issue.
 *
 * @param severity Change severity (breaking, major, minor)
 * @param config Agent assignment configuration
 * @returns Agent name (e.g., 'copilot', 'claude') or null if not configured
 */
export function routeToAgent(severity: Severity, config: AgentAssignmentConfig): string | null {
  if (!config.enabled) {
    return null;
  }

  const agent = config.severityMapping[severity];
  return agent || null;
}

/**
 * Generate assignee label for issue
 *
 * Creates a label in format "assigned:agent" that can be used
 * to trigger agent-specific workflows or assign the issue.
 *
 * @param agent Agent name or null
 * @returns Label string or null
 */
export function getAssigneeLabel(agent: string | null): string | null {
  if (!agent) {
    return null;
  }

  return `assigned:${agent}`;
}

/**
 * Get all configured agents
 *
 * Returns list of unique agent names configured in the severity mapping
 *
 * @param config Agent assignment configuration
 * @returns Array of agent names
 */
export function getConfiguredAgents(config: AgentAssignmentConfig): string[] {
  if (!config.enabled) {
    return [];
  }

  const agents = new Set<string>();

  if (config.severityMapping.breaking) {
    agents.add(config.severityMapping.breaking);
  }

  if (config.severityMapping.major) {
    agents.add(config.severityMapping.major);
  }

  if (config.severityMapping.minor) {
    agents.add(config.severityMapping.minor);
  }

  return Array.from(agents);
}
