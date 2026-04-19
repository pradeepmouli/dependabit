import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { type DependabitConfig } from './schema.js';
import { validateConfig } from './validator.js';

/**
 * Reads a YAML configuration file from disk, parses it, and validates it
 * against `DependabitConfigSchema`.
 *
 * @param path - Path to the `.dependabit.yml` (or `.json`) file.
 * @returns The validated `DependabitConfig` object.
 *
 * @throws {ValidationError} If the YAML does not match the config schema.
 * @throws {Error} If the file cannot be read.
 *
 * @category Manifest
 *
 * @pitfalls
 * - YAML comments are parsed but not preserved in the returned object.
 *   A subsequent `stringifyConfig` call will lose all comments.
 * - Duplicate YAML keys are silently overwritten by the YAML parser (last
 *   value wins) — no warning is emitted.
 */
export async function readConfig(path: string): Promise<DependabitConfig> {
  const content = await readFile(path, 'utf-8');
  const data = YAML.parse(content);
  return validateConfig(data);
}

/**
 * Parses a YAML string into a validated `DependabitConfig`.
 *
 * @param yaml - Raw YAML or JSON string.
 * @returns Validated config object.
 *
 * @throws {ValidationError} If the parsed data does not satisfy the schema.
 *
 * @category Manifest
 *
 * @useWhen
 * Parsing config from an in-memory string (e.g., fetched from GitHub API).
 */
export function parseConfig(yaml: string): DependabitConfig {
  const data = YAML.parse(yaml);
  return validateConfig(data);
}

/**
 * Serialises a validated `DependabitConfig` to a YAML string.
 *
 * @param config - The config to serialise.
 * @returns YAML string representation.
 *
 * @throws {ValidationError} If `config` fails schema validation before
 *   serialisation.
 *
 * @category Manifest
 *
 * @pitfalls
 * - YAML comments present in the original file are **not** preserved;
 *   this function always produces comment-free YAML.
 */
export function stringifyConfig(config: DependabitConfig): string {
  // Validate before stringifying
  validateConfig(config);
  return YAML.stringify(config);
}

/**
 * Resolves the effective monitoring rules for a specific dependency URL by
 * merging global config defaults with any per-URL override defined in
 * `config.dependencies`.
 *
 * @param config - Root `DependabitConfig` object.
 * @param dependencyUrl - The exact URL of the dependency to look up.
 * @returns Resolved `enabled`, `checkFrequency`, and `ignoreChanges` values.
 *
 * @remarks
 * Override matching is performed by exact URL equality.  A trailing slash
 * or query parameter difference between the stored URL and the override URL
 * will cause the override to be silently ignored.
 *
 * @category Manifest
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
        override.monitoring.checkFrequency ?? override.schedule?.interval ?? globalCheckFrequency,
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
 * Returns `true` if the given URL matches any exclusion rule defined in
 * `config.ignore` (exact URL list or regex pattern list).
 *
 * @param config - Root `DependabitConfig` object.
 * @param url - The URL to test.
 * @returns `true` if the URL should be skipped; `false` otherwise.
 *
 * @remarks
 * Invalid regex patterns in `config.ignore.patterns` are logged as warnings
 * via `console.warn` and skipped rather than throwing.
 *
 * @category Manifest
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
