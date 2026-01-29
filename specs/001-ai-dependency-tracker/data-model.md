# Data Model: AI-Powered Dependency Tracking System

**Feature**: 001-ai-dependency-tracker
**Phase**: 1 - Data Model Design
**Date**: 2026-01-29

## Overview

This document defines the core data structures for the dependency tracking system, including manifest schema, configuration schema, and change detection records. All schemas are defined using Zod for runtime validation and TypeScript type generation.

## Manifest Schema

### Purpose
The manifest (`.dependabit/manifest.json`) is the central data structure listing all tracked external dependencies discovered by LLM analysis or manually added.

### Schema Definition

```typescript
import { z } from 'zod';

// Version tracking
export const ManifestVersionSchema = z.literal('1.0.0');

// Dependency types
export const DependencyTypeSchema = z.enum([
  'github-repo',
  'npm-package',
  'documentation-url',
  'api-endpoint',
  'blog-post',
  'research-paper',
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
export const AuthConfigSchema = z.object({
  type: z.enum(['token', 'basic', 'oauth', 'none']),
  secret: z.string().optional(), // GitHub Secret name reference
}).optional();

// Monitoring rules
export const MonitoringRulesSchema = z.object({
  enabled: z.boolean().default(true),
  checkFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  ignoreChanges: z.boolean().default(false),
  severityOverride: SeveritySchema.optional(),
});

// Individual dependency entry
export const DependencyEntrySchema = z.object({
  id: z.string().uuid(), // Unique identifier
  url: z.string().url(), // External resource URL
  type: DependencyTypeSchema,
  name: z.string(), // Human-readable name
  description: z.string().optional(),

  // Version/state tracking
  currentVersion: z.string().optional(), // Semantic version if available
  currentStateHash: z.string(), // SHA256 hash of current state

  // Metadata
  detectionMethod: DetectionMethodSchema,
  detectionConfidence: z.number().min(0).max(1), // 0.0 - 1.0
  detectedAt: z.string().datetime(), // ISO 8601 timestamp
  lastChecked: z.string().datetime(),
  lastChanged: z.string().datetime().optional(),

  // Configuration
  auth: AuthConfigSchema,
  monitoring: MonitoringRulesSchema.optional(),

  // Relationships
  referencedIn: z.array(z.object({
    file: z.string(), // Relative path from repo root
    line: z.number().optional(),
    context: z.string().optional(), // Surrounding text
  })),

  // Change history
  changeHistory: z.array(z.object({
    detectedAt: z.string().datetime(),
    oldVersion: z.string().optional(),
    newVersion: z.string().optional(),
    severity: SeveritySchema,
    issueNumber: z.number().optional(),
  })).default([]),
});

// Complete manifest
export const DependencyManifestSchema = z.object({
  version: ManifestVersionSchema,
  generatedAt: z.string().datetime(),
  generatedBy: z.object({
    action: z.string(), // e.g., "dependabit"
    version: z.string(), // Action version
    llmProvider: z.string(), // e.g., "github-copilot"
    llmModel: z.string().optional(),
  }),

  repository: z.object({
    owner: z.string(),
    name: z.string(),
    branch: z.string(),
    commit: z.string(), // SHA of last analyzed commit
  }),

  dependencies: z.array(DependencyEntrySchema),

  statistics: z.object({
    totalDependencies: z.number(),
    byType: z.record(DependencyTypeSchema, z.number()),
    byDetectionMethod: z.record(DetectionMethodSchema, z.number()),
    averageConfidence: z.number(),
  }),
});

// TypeScript types
export type DependencyManifest = z.infer<typeof DependencyManifestSchema>;
export type DependencyEntry = z.infer<typeof DependencyEntrySchema>;
export type DependencyType = z.infer<typeof DependencyTypeSchema>;
export type DetectionMethod = z.infer<typeof DetectionMethodSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
```

### Example Manifest

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-01-29T10:30:00Z",
  "generatedBy": {
    "action": "dependabit",
    "version": "1.0.0",
    "llmProvider": "github-copilot",
    "llmModel": "gpt-4"
  },
  "repository": {
    "owner": "pradeepmouli",
    "name": "dependabit",
    "branch": "main",
    "commit": "abc123def456"
  },
  "dependencies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://github.com/microsoft/TypeScript",
      "type": "github-repo",
      "name": "TypeScript",
      "description": "TypeScript compiler and language services",
      "currentVersion": "5.9.3",
      "currentStateHash": "sha256:abc123...",
      "detectionMethod": "package-json",
      "detectionConfidence": 1.0,
      "detectedAt": "2026-01-29T10:30:00Z",
      "lastChecked": "2026-01-29T10:30:00Z",
      "monitoring": {
        "enabled": true,
        "checkFrequency": "daily",
        "ignoreChanges": false
      },
      "referencedIn": [
        {
          "file": "package.json",
          "line": 15,
          "context": "\"typescript\": \"^5.9.3\""
        }
      ],
      "changeHistory": []
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "url": "https://vitest.dev/guide/",
      "type": "documentation-url",
      "name": "Vitest Documentation",
      "description": "Testing framework documentation",
      "currentStateHash": "sha256:def456...",
      "detectionMethod": "llm-analysis",
      "detectionConfidence": 0.85,
      "detectedAt": "2026-01-29T10:30:00Z",
      "lastChecked": "2026-01-29T10:30:00Z",
      "monitoring": {
        "enabled": true,
        "checkFrequency": "weekly",
        "ignoreChanges": false
      },
      "referencedIn": [
        {
          "file": "README.md",
          "line": 42,
          "context": "See [Vitest docs](https://vitest.dev/guide/) for testing patterns"
        }
      ],
      "changeHistory": []
    }
  ],
  "statistics": {
    "totalDependencies": 2,
    "byType": {
      "github-repo": 1,
      "documentation-url": 1
    },
    "byDetectionMethod": {
      "package-json": 1,
      "llm-analysis": 1
    },
    "averageConfidence": 0.925
  }
}
```

## Configuration Schema

### Purpose
The configuration file (`.dependabit/config.yml`) defines monitoring behavior, schedules, and global settings in a dependabot-style format.

### Schema Definition

```typescript
import { z } from 'zod';

// Schedule configuration (dependabot-compatible)
export const ScheduleSchema = z.object({
  interval: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:MM format
  timezone: z.string().default('UTC'),
});

// LLM provider configuration
export const LLMConfigSchema = z.object({
  provider: z.enum(['github-copilot', 'claude', 'openai', 'azure-openai']).default('github-copilot'),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().default(4000),
  temperature: z.number().min(0).max(2).default(0.3),
});

// Issue configuration
export const IssueConfigSchema = z.object({
  labels: z.array(z.string()).default(['dependabit', 'dependency-update']),
  assignees: z.array(z.string()).default([]),
  aiAgentAssignment: z.object({
    enabled: z.boolean().default(false),
    breaking: z.string().optional(), // GitHub username or "copilot"
    major: z.string().optional(),
    minor: z.string().optional(),
  }).optional(),
  titleTemplate: z.string().default('[dependabit] {name}: {change}'),
  bodyTemplate: z.string().optional(),
});

// Per-dependency override
export const DependencyOverrideSchema = z.object({
  url: z.string().url(),
  schedule: ScheduleSchema.optional(),
  monitoring: MonitoringRulesSchema.optional(),
  issues: IssueConfigSchema.optional(),
});

// Complete configuration
export const DependabitConfigSchema = z.object({
  version: z.literal('1'),

  // Global settings
  llm: LLMConfigSchema.optional(),
  schedule: ScheduleSchema.default({ interval: 'daily', timezone: 'UTC' }),
  issues: IssueConfigSchema.optional(),

  // Monitoring behavior
  monitoring: z.object({
    enabled: z.boolean().default(true),
    autoUpdate: z.boolean().default(true), // Auto-update manifest on push
    falsePositiveThreshold: z.number().min(0).max(1).default(0.1),
  }).optional(),

  // Dependency-specific overrides
  dependencies: z.array(DependencyOverrideSchema).optional(),

  // Exclusions
  ignore: z.object({
    urls: z.array(z.string()).optional(),
    types: z.array(DependencyTypeSchema).optional(),
    patterns: z.array(z.string()).optional(), // Regex patterns
  }).optional(),
});

export type DependabitConfig = z.infer<typeof DependabitConfigSchema>;
```

### Example Configuration

```yaml
version: "1"

llm:
  provider: github-copilot
  model: gpt-4
  maxTokens: 4000
  temperature: 0.3

schedule:
  interval: daily
  time: "02:00"
  timezone: America/Los_Angeles

issues:
  labels:
    - dependabit
    - dependency-update
  assignees:
    - pradeepmouli
  aiAgentAssignment:
    enabled: true
    breaking: copilot
    major: claude
    minor: copilot

monitoring:
  enabled: true
  autoUpdate: true
  falsePositiveThreshold: 0.1

dependencies:
  - url: "https://github.com/microsoft/TypeScript"
    schedule:
      interval: hourly
    issues:
      labels:
        - critical
        - typescript

  - url: "https://vitest.dev/guide/"
    schedule:
      interval: weekly
      day: monday
    monitoring:
      ignoreChanges: false

ignore:
  urls:
    - "https://example.com/deprecated-docs"
  types:
    - blog-post
  patterns:
    - ".*\\.example\\.com.*"
```

## Change Detection Record Schema

### Purpose
Tracks detected changes for logging, reporting, and issue creation.

### Schema Definition

```typescript
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
    checkedAt: z.string().datetime(),
  }),
  newState: z.object({
    version: z.string().optional(),
    hash: z.string(),
    checkedAt: z.string().datetime(),
  }),

  // Change description (LLM-generated)
  summary: z.string(),
  details: z.string().optional(),
  breakingChanges: z.array(z.string()).optional(),

  // Action taken
  issueCreated: z.boolean().default(false),
  issueNumber: z.number().optional(),
  issueUrl: z.string().url().optional(),
});

export type ChangeDetectionRecord = z.infer<typeof ChangeDetectionRecordSchema>;
```

### Example Change Record

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2026-01-30T08:15:00Z",
  "dependencyId": "550e8400-e29b-41d4-a716-446655440000",
  "dependencyUrl": "https://github.com/microsoft/TypeScript",
  "dependencyName": "TypeScript",
  "changeType": "released",
  "severity": "major",
  "oldState": {
    "version": "5.9.3",
    "hash": "sha256:abc123...",
    "checkedAt": "2026-01-29T10:30:00Z"
  },
  "newState": {
    "version": "5.10.0",
    "hash": "sha256:xyz789...",
    "checkedAt": "2026-01-30T08:15:00Z"
  },
  "summary": "TypeScript 5.10.0 released with new language features",
  "details": "Includes improved type inference, better error messages, and performance optimizations. See release notes for migration guide.",
  "breakingChanges": [
    "Changed behavior of type narrowing in certain edge cases",
    "Deprecated --target ES3 and ES5 options"
  ],
  "issueCreated": true,
  "issueNumber": 42,
  "issueUrl": "https://github.com/pradeepmouli/dependabit/issues/42"
}
```

## Entity Relationships

```
DependabitConfig (config.yml)
    ↓ defines
Schedule & Rules
    ↓ applied to
DependencyManifest (manifest.json)
    ↓ contains
DependencyEntry[]
    ↓ monitored via
ChangeDetectionRecord[]
    ↓ triggers
GitHub Issue
```

## Validation Rules

### Manifest Validation

1. **Version compatibility**: Reject unknown manifest versions
2. **UUID uniqueness**: All dependency IDs must be unique
3. **URL validity**: All URLs must be valid and accessible
4. **Hash format**: State hashes must be valid SHA256
5. **Timestamp order**: `detectedAt <= lastChecked <= lastChanged`
6. **Confidence range**: Detection confidence between 0.0 and 1.0
7. **Statistics consistency**: Totals must match array lengths

### Configuration Validation

1. **Schedule conflicts**: Per-dependency schedules override globals
2. **LLM provider**: Must be supported provider
3. **Timezone**: Must be valid IANA timezone
4. **Time format**: HH:MM in 24-hour format
5. **Override URLs**: Must reference existing or discoverable dependencies

### Cross-Validation

1. **Auth secrets**: Referenced secrets must exist in GitHub repository
2. **Assignees**: GitHub usernames must be valid
3. **AI agents**: Must be supported agents (copilot, claude, etc.)
4. **Label format**: Must match GitHub label requirements

## Migration Strategy

### Version 1.0.0 → 1.1.0 (hypothetical)

If schema changes are needed:

1. Add `schemaVersion` field to detect version
2. Implement migration function: `migrateManifest(v1.0.0) → v1.1.0`
3. Preserve backward compatibility for reads
4. Auto-migrate on first write
5. Log migration warnings

```typescript
function migrateManifest(manifest: any): DependencyManifest {
  if (manifest.version === '1.0.0') {
    // Add new fields with defaults
    // Transform deprecated fields
    return { ...manifest, version: '1.1.0' };
  }
  return manifest;
}
```

## Storage & Performance

### File Locations

- **Manifest**: `.dependabit/manifest.json` (tracked by git)
- **Config**: `.dependabit/config.yml` (tracked by git)
- **Logs**: GitHub Actions workflow logs (not in repo)
- **Cache**: GitHub Actions cache (temporary, not in repo)

### Size Constraints

- **Manifest**: Target <1MB, warn at >5MB, fail at >10MB
- **Per entry**: ~1KB average, max 10KB with full history
- **100 dependencies**: ~100KB manifest size

### Performance Targets

- **Parse manifest**: <100ms
- **Validate manifest**: <200ms
- **Write manifest**: <500ms
- **Load config**: <50ms

## Next Steps

This data model will be implemented in the `@dependabit/manifest` package with full Zod validation, TypeScript types, and comprehensive unit tests.
