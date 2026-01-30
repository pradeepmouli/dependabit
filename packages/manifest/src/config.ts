import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { type DependabitConfig } from './schema.js';
import { validateConfig } from './validator.js';

/**
 * Parse and validate a YAML configuration file
 */
export async function readConfig(path: string): Promise<DependabitConfig> {
  const content = await readFile(path, 'utf-8');
  const data = YAML.parse(content);
  return validateConfig(data);
}

/**
 * Parse YAML string to config
 */
export function parseConfig(yaml: string): DependabitConfig {
  const data = YAML.parse(yaml);
  return validateConfig(data);
}

/**
 * Convert config to YAML string
 */
export function stringifyConfig(config: DependabitConfig): string {
  // Validate before stringifying
  validateConfig(config);
  return YAML.stringify(config);
}

/**
 * Get effective monitoring rules for a dependency
 * Merges global config with dependency-specific overrides
 */
export function getEffectiveMonitoringRules(
  config: DependabitConfig,
  dependencyUrl: string
): {
  enabled: boolean;
  checkFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  ignoreChanges: boolean;
} {
  // Start with global defaults
  const globalEnabled = config.monitoring?.enabled ?? true;
  const globalCheckFrequency = config.schedule?.interval ?? 'daily';

  // Find dependency-specific override
  const override = config.dependencies?.find((dep) => dep.url === dependencyUrl);

  if (override?.monitoring) {
    return {
      enabled: override.monitoring.enabled ?? globalEnabled,
      checkFrequency:
        override.monitoring.checkFrequency ??
        override.schedule?.interval ??
        globalCheckFrequency,
      ignoreChanges: override.monitoring.ignoreChanges ?? false
    };
  }

  return {
    enabled: globalEnabled,
    checkFrequency: globalCheckFrequency,
    ignoreChanges: false
  };
}

/**
 * Check if a URL should be ignored based on config
 */
export function shouldIgnoreUrl(config: DependabitConfig, url: string): boolean {
  if (!config.ignore) {
    return false;
  }

  // Check exact URL matches
  if (config.ignore.urls?.includes(url)) {
    return true;
  }

  // Check regex patterns with error handling
  if (config.ignore.patterns) {
    for (const pattern of config.ignore.patterns) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(url)) {
          return true;
        }
      } catch {
        // Invalid regex pattern - log warning but continue
        console.warn(`Invalid regex pattern in config.ignore.patterns: ${pattern}`);
      }
    }
  }

  return false;
}
