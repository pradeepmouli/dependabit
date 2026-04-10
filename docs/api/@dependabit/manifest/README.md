[**Documentation v0.1.16**](../../README.md)

***

[Documentation](../../README.md) / @dependabit/manifest

# @dependabit/manifest

Manifest schema and validation for dependency tracking.

## Overview

This package provides the core schema definitions and validation logic for the dependency manifest format used by dependabit.

## Features

- Zod-based schema validation
- Manifest CRUD operations
- Config file parsing and validation
- Type-safe manifest handling

## Installation

```bash
pnpm add @dependabit/manifest
```

## Usage

```typescript
import { DependencyManifestSchema } from '@dependabit/manifest';

// Coming soon in Phase 2
```

## License

MIT

## Classes

- [ValidationError](classes/ValidationError.md)

## Interfaces

- [SizeCheckOptions](interfaces/SizeCheckOptions.md)
- [SizeCheckResult](interfaces/SizeCheckResult.md)

## Type Aliases

- [AccessMethod](type-aliases/AccessMethod.md)
- [ChangeDetectionRecord](type-aliases/ChangeDetectionRecord.md)
- [ChangeType](type-aliases/ChangeType.md)
- [DependabitConfig](type-aliases/DependabitConfig.md)
- [DependencyEntry](type-aliases/DependencyEntry.md)
- [DependencyManifest](type-aliases/DependencyManifest.md)
- [DependencyOverride](type-aliases/DependencyOverride.md)
- [DependencyType](type-aliases/DependencyType.md)
- [DetectionMethod](type-aliases/DetectionMethod.md)
- [IssueConfig](type-aliases/IssueConfig.md)
- [LLMConfig](type-aliases/LLMConfig.md)
- [MonitoringRules](type-aliases/MonitoringRules.md)
- [Schedule](type-aliases/Schedule.md)
- [Severity](type-aliases/Severity.md)

## Variables

- [AccessMethodSchema](variables/AccessMethodSchema.md)
- [AuthConfigSchema](variables/AuthConfigSchema.md)
- [ChangeDetectionRecordSchema](variables/ChangeDetectionRecordSchema.md)
- [ChangeTypeSchema](variables/ChangeTypeSchema.md)
- [DependabitConfigSchema](variables/DependabitConfigSchema.md)
- [DependencyEntrySchema](variables/DependencyEntrySchema.md)
- [DependencyManifestSchema](variables/DependencyManifestSchema.md)
- [DependencyOverrideSchema](variables/DependencyOverrideSchema.md)
- [DependencyTypeSchema](variables/DependencyTypeSchema.md)
- [DetectionMethodSchema](variables/DetectionMethodSchema.md)
- [IssueConfigSchema](variables/IssueConfigSchema.md)
- [LLMConfigSchema](variables/LLMConfigSchema.md)
- [ManifestVersionSchema](variables/ManifestVersionSchema.md)
- [MonitoringRulesSchema](variables/MonitoringRulesSchema.md)
- [ScheduleSchema](variables/ScheduleSchema.md)
- [SeveritySchema](variables/SeveritySchema.md)

## Functions

- [addDependency](functions/addDependency.md)
- [canAddEntry](functions/canAddEntry.md)
- [checkManifestSize](functions/checkManifestSize.md)
- [createEmptyManifest](functions/createEmptyManifest.md)
- [estimateEntrySize](functions/estimateEntrySize.md)
- [formatSize](functions/formatSize.md)
- [getEffectiveMonitoringRules](functions/getEffectiveMonitoringRules.md)
- [mergeManifests](functions/mergeManifests.md)
- [parseConfig](functions/parseConfig.md)
- [readConfig](functions/readConfig.md)
- [readManifest](functions/readManifest.md)
- [removeDependency](functions/removeDependency.md)
- [safeValidateConfig](functions/safeValidateConfig.md)
- [safeValidateDependencyEntry](functions/safeValidateDependencyEntry.md)
- [safeValidateManifest](functions/safeValidateManifest.md)
- [shouldIgnoreUrl](functions/shouldIgnoreUrl.md)
- [stringifyConfig](functions/stringifyConfig.md)
- [updateDependency](functions/updateDependency.md)
- [validateConfig](functions/validateConfig.md)
- [validateDependencyEntry](functions/validateDependencyEntry.md)
- [validateManifest](functions/validateManifest.md)
- [validateManifestObject](functions/validateManifestObject.md)
- [writeManifest](functions/writeManifest.md)
