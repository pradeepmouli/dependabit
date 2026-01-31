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
      patterns: z.array(z.string()).optional()
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

// TypeScript types
export type DependencyManifest = z.infer<typeof DependencyManifestSchema>;
export type DependencyEntry = z.infer<typeof DependencyEntrySchema>;
export type DependencyType = z.infer<typeof DependencyTypeSchema>;
export type AccessMethod = z.infer<typeof AccessMethodSchema>;
export type DetectionMethod = z.infer<typeof DetectionMethodSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type MonitoringRules = z.infer<typeof MonitoringRulesSchema>;
export type DependabitConfig = z.infer<typeof DependabitConfigSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type IssueConfig = z.infer<typeof IssueConfigSchema>;
export type DependencyOverride = z.infer<typeof DependencyOverrideSchema>;
export type ChangeType = z.infer<typeof ChangeTypeSchema>;
export type ChangeDetectionRecord = z.infer<typeof ChangeDetectionRecordSchema>;
