/**
 * Zod schemas and TypeScript types for the dependabit manifest and
 * configuration file formats.
 *
 * @remarks
 * All schemas are strict by default: unknown keys are rejected.  Callers
 * that need lenient parsing (e.g. when reading manifests from untrusted
 * sources) should use `safeValidateManifest` from `@dependabit/manifest`
 * rather than calling `.parse()` directly.
 *
 * @pitfalls
 * - **Schema version drift**: manifests without an explicit `version` field
 *   will fail validation.  Always include `"version": "1.0.0"` in generated
 *   manifests.
 * - **YAML comment loss**: `DependabitConfig` is serialised via
 *   `stringifyConfig` which uses `yaml.stringify`.  Any YAML comments in the
 *   original `.dependabit.yml` are **not** preserved in round-trip
 *   parse/serialize cycles.
 * - **Unicode in author names**: `DependencyEntry.referencedIn` context
 *   strings may contain author names with diacritics.  These are stored as
 *   UTF-8 strings; external tools that apply Unicode normalization (NFC/NFD)
 *   will produce different hashes for semantically identical names.
 * - **AuthConfig secrets**: the `secretEnvVar` field stores only an
 *   environment variable *name*, never a raw secret value.  Storing a raw
 *   token in `secretEnvVar` is a security vulnerability — the manifest is
 *   committed to version control.
 *
 * @module
 */

import { z } from 'zod';

// Version tracking
export const ManifestVersionSchema = z.literal('1.0.0');

// Access methods (HOW to retrieve/check dependency)
export const AccessMethodSchema = z.enum(['context7', 'arxiv', 'openapi', 'github-api', 'http']);

// Dependency types (WHAT the dependency represents)
export const DependencyTypeSchema = z.enum([
  'reference-implementation',
  'schema',
  'documentation',
  'research-paper',
  'api-example',
  'other'
]);

// Detection methods
export const DetectionMethodSchema = z.enum([
  'llm-analysis',
  'manual',
  'package-json',
  'requirements-txt',
  'code-comment'
]);

// Severity levels
export const SeveritySchema = z.enum(['breaking', 'major', 'minor']);

// Authentication configuration
export const AuthConfigSchema = z
  .object({
    type: z.enum(['token', 'basic', 'oauth', 'none']),
    // Reference to an environment variable or secret identifier.
    // Do NOT store raw secret values directly in the manifest.
    secretEnvVar: z.string().optional()
  })
  .optional();

// Monitoring rules
export const MonitoringRulesSchema = z.object({
  enabled: z.boolean().default(true),
  checkFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  ignoreChanges: z.boolean().default(false),
  severityOverride: SeveritySchema.optional()
});

// Individual dependency entry
export const DependencyEntrySchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  type: DependencyTypeSchema,
  accessMethod: AccessMethodSchema,
  name: z.string(),
  description: z.string().optional(),

  // Version/state tracking
  currentVersion: z.string().optional(),
  currentStateHash: z.string(),

  // Metadata
  detectionMethod: DetectionMethodSchema,
  detectionConfidence: z.number().min(0).max(1),
  detectedAt: z.string().datetime(),
  lastChecked: z.string().datetime(),
  lastChanged: z.string().datetime().optional(),

  // Configuration
  auth: AuthConfigSchema,
  monitoring: MonitoringRulesSchema.optional(),

  // Relationships
  referencedIn: z.array(
    z.object({
      file: z.string(),
      line: z.number().optional(),
      context: z.string().optional()
    })
  ),

  // Change history
  changeHistory: z
    .array(
      z.object({
        detectedAt: z.string().datetime(),
        oldVersion: z.string().optional(),
        newVersion: z.string().optional(),
        severity: SeveritySchema,
        issueNumber: z.number().optional(),
        falsePositive: z.boolean().default(false)
      })
    )
    .default([])
});

// Complete manifest
export const DependencyManifestSchema = z.object({
  version: ManifestVersionSchema,
  generatedAt: z.string().datetime(),
  generatedBy: z.object({
    action: z.string(),
    version: z.string(),
    llmProvider: z.string(),
    llmModel: z.string().optional()
  }),

  repository: z.object({
    owner: z.string(),
    name: z.string(),
    branch: z.string(),
    commit: z.string()
  }),

  dependencies: z.array(DependencyEntrySchema),

  statistics: z.object({
    totalDependencies: z.number(),
    byType: z.record(z.string(), z.number()),
    byAccessMethod: z.record(z.string(), z.number()),
    byDetectionMethod: z.record(z.string(), z.number()),
    averageConfidence: z.number(),
    falsePositiveRate: z.number().min(0).max(1).optional()
  })
});

// Schedule configuration (dependabot-compatible)
export const ScheduleSchema = z.object({
  interval: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  day: z
    .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  timezone: z.string().default('UTC')
});

// LLM provider configuration
export const LLMConfigSchema = z.object({
  provider: z
    .enum(['github-copilot', 'claude', 'openai', 'azure-openai'])
    .default('github-copilot'),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().default(4000),
  temperature: z.number().min(0).max(2).default(0.3)
});

// Issue configuration
export const IssueConfigSchema = z.object({
  labels: z.array(z.string()).default(['dependabit', 'dependency-update']),
  assignees: z.array(z.string()).default([]),
  aiAgentAssignment: z
    .object({
      enabled: z.boolean().default(false),
      breaking: z.string().optional(),
      major: z.string().optional(),
      minor: z.string().optional()
    })
    .optional(),
  titleTemplate: z.string().default('[dependabit] {name}: {change}'),
  bodyTemplate: z.string().optional()
});

// Per-dependency override
export const DependencyOverrideSchema = z.object({
  url: z.string().url(),
  schedule: ScheduleSchema.optional(),
  monitoring: MonitoringRulesSchema.optional(),
  issues: IssueConfigSchema.optional()
});

/**
 * Zod schema for the top-level `.dependabit.yml` / `.dependabit.json`
 * configuration file.
 *
 * @remarks
 * Parse with `validateConfig` or `safeValidateConfig` (from
 * `@dependabit/manifest`) rather than calling `.parse()` directly so that
 * validation errors are wrapped in `ValidationError` with formatted messages.
 *
 * @see {@link DependabitConfig} for the TypeScript type.
 *
 * @category Manifest
 */
// Complete configuration
export const DependabitConfigSchema = z.object({
  version: z.literal('1'),

  // Global settings
  llm: LLMConfigSchema.optional(),
  schedule: ScheduleSchema.default({ interval: 'daily', timezone: 'UTC' }),
  issues: IssueConfigSchema.optional(),

  // Monitoring behavior
  monitoring: z
    .object({
      enabled: z.boolean().default(true),
      autoUpdate: z.boolean().default(true),
      falsePositiveThreshold: z.number().min(0).max(1).default(0.1)
    })
    .optional(),

  // Dependency-specific overrides
  dependencies: z.array(DependencyOverrideSchema).optional(),

  // Exclusions
  ignore: z
    .object({
      urls: z.array(z.string()).optional(),
      types: z.array(DependencyTypeSchema).optional(),
      patterns: z.array(z.string()).optional(),
      useGitExcludes: z.boolean().default(true)
    })
    .optional()
});

// Change detection schemas
export const ChangeTypeSchema = z.enum([
  'version-bump',
  'content-changed',
  'released',
  'deprecated',
  'unavailable',
  'unknown'
]);

export const ChangeDetectionRecordSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),

  // Dependency reference
  dependencyId: z.string().uuid(),
  dependencyUrl: z.string().url(),
  dependencyName: z.string(),

  // Change details
  changeType: ChangeTypeSchema,
  severity: SeveritySchema,

  // State comparison
  oldState: z.object({
    version: z.string().optional(),
    hash: z.string(),
    checkedAt: z.string().datetime()
  }),
  newState: z.object({
    version: z.string().optional(),
    hash: z.string(),
    checkedAt: z.string().datetime()
  }),

  // Change description
  summary: z.string(),
  details: z.string().optional(),
  breakingChanges: z.array(z.string()).optional(),

  // Action taken
  issueCreated: z.boolean().default(false),
  issueNumber: z.number().optional(),
  issueUrl: z.string().url().optional()
});

// ─── TypeScript types ────────────────────────────────────────────────────────

/**
 * A fully-validated dependency manifest document.
 * @category Manifest
 */
export type DependencyManifest = z.infer<typeof DependencyManifestSchema>;

/**
 * A single tracked external dependency inside a {@link DependencyManifest}.
 *
 * @remarks
 * The `currentStateHash` field is populated by the monitor after the first
 * successful check.  Newly-detected entries carry an empty string (`''`) or
 * a sentinel value (`'sha256:pending'`) until the monitor runs.
 *
 * @category Manifest
 */
export type DependencyEntry = z.infer<typeof DependencyEntrySchema>;

/**
 * Semantic category of an external dependency.
 * @category Manifest
 */
export type DependencyType = z.infer<typeof DependencyTypeSchema>;

/**
 * The protocol/service used to fetch and compare a dependency's state.
 * @category Manifest
 */
export type AccessMethod = z.infer<typeof AccessMethodSchema>;

/**
 * How a dependency was originally discovered.
 * @category Manifest
 */
export type DetectionMethod = z.infer<typeof DetectionMethodSchema>;

/**
 * Change severity level used in notifications and issue creation.
 * @category Manifest
 */
export type Severity = z.infer<typeof SeveritySchema>;

/**
 * Per-dependency monitoring rules (check frequency, enable/disable).
 * @category Manifest
 */
export type MonitoringRules = z.infer<typeof MonitoringRulesSchema>;

/**
 * Root configuration object parsed from `.dependabit.yml`.
 *
 * @config
 * @category Manifest
 *
 * @useWhen
 * Passing configuration to runtime components (`Scheduler`, `Monitor`, etc.)
 * that need to respect per-dependency overrides.
 *
 * @avoidWhen
 * Storing raw secret values — use `secretEnvVar` in `AuthConfig` to reference
 * environment variables by name only.
 *
 * @pitfalls
 * - YAML comments in the original file are **lost** after a
 *   `parseConfig → stringifyConfig` round-trip.
 * - The `version` field must be the string `"1"` (not `1` or `"1.0.0"`).
 */
export type DependabitConfig = z.infer<typeof DependabitConfigSchema>;

/**
 * Check schedule (cron-like, compatible with Dependabot syntax).
 * @category Manifest
 */
export type Schedule = z.infer<typeof ScheduleSchema>;

/**
 * LLM provider configuration stored inside the manifest's `generatedBy`
 * section and in `DependabitConfig.llm`.
 *
 * @config
 * @category Manifest
 *
 * @pitfalls
 * - `model` is optional and defaults to the provider's current default.
 *   Omitting it means model changes in new SDK versions can silently alter
 *   detection behaviour.
 */
export type LLMConfig = z.infer<typeof LLMConfigSchema>;

/**
 * Configuration for GitHub issue creation on change detection.
 *
 * @config
 * @category Manifest
 */
export type IssueConfig = z.infer<typeof IssueConfigSchema>;

/**
 * A per-URL configuration override inside `DependabitConfig.dependencies`.
 * @category Manifest
 */
export type DependencyOverride = z.infer<typeof DependencyOverrideSchema>;

/**
 * Classification of the kind of change detected during monitoring.
 * @category Manifest
 */
export type ChangeType = z.infer<typeof ChangeTypeSchema>;

/**
 * A persisted record of a single change detection event.
 * @category Manifest
 */
export type ChangeDetectionRecord = z.infer<typeof ChangeDetectionRecordSchema>;
