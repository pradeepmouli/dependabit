---
name: dependabit-manifest
description: Documentation site for dependabit
---

# @dependabit/manifest

Documentation site for dependabit

## When to Use

- Loading an existing manifest to pass to the monitor or detector.
- Applying the output of Detector to an existing manifest without
- losing manually-curated entries or historical change records.
- Parsing config from an in-memory string (e.g., fetched from GitHub API).

**Avoid when:**
- You want to completely replace the existing manifest — just write
- `updated` directly via writeManifest.
- API surface: 23 functions, 1 classes, 15 types, 16 constants

## Pitfalls

- The file is parsed as JSON, not YAML.  Passing a YAML manifest path
- will throw a `SyntaxError`; use `readConfig` for YAML.
- Writing a manifest with `strict: false` can persist invalid data that
- later fails to parse.  Prefer `strict: true` in production pipelines.
- This function performs a **read–modify–write** cycle.  Concurrent calls
- with the same `path` and different `dependencyId` values will race and
- one write will silently overwrite the other.  Use a file lock or
- serialise calls if running multiple monitors in parallel.
- Duplicate URL detection is exact-match only.  Trailing slashes or
- fragment identifiers will not be treated as duplicates.
- Same race condition as updateDependency applies.
- Matching between `existing` and `updated` uses `id` **or** `url`.
- If the URL of a dependency changes (e.g. a redirect is resolved), the
- entry will be treated as new and history will not be preserved.
- `preserveManual: true` can re-add entries that were intentionally
- removed from the repository.  Set it to `false` when performing a
- deliberate full refresh.
- YAML comments are parsed but not preserved in the returned object.
- A subsequent `stringifyConfig` call will lose all comments.
- Duplicate YAML keys are silently overwritten by the YAML parser (last
- value wins) — no warning is emitted.
- YAML comments present in the original file are **not** preserved;
- this function always produces comment-free YAML.

## Configuration

### SizeCheckOptions

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `warnThreshold` | `number` | no | — |  |
| `errorThreshold` | `number` | no | — |  |

## Quick Reference

**validator:** `validateManifest`, `validateDependencyEntry`, `validateConfig`, `safeValidateManifest`, `safeValidateDependencyEntry`, `safeValidateConfig`
**Manifest:** `readManifest`, `writeManifest`, `updateDependency`, `addDependency`, `removeDependency`, `mergeManifests`, `createEmptyManifest`, `readConfig`, `parseConfig`, `stringifyConfig`, `getEffectiveMonitoringRules`, `shouldIgnoreUrl`, `ValidationError`, `DependencyManifest`, `DependencyEntry`, `DependencyType`, `AccessMethod`, `DetectionMethod`, `Severity`, `MonitoringRules`, `DependabitConfig`, `Schedule`, `LLMConfig`, `IssueConfig`, `DependencyOverride`, `ChangeType`, `ChangeDetectionRecord`, `DependabitConfigSchema`
**size-check:** `checkManifestSize`, `formatSize`, `validateManifestObject`, `estimateEntrySize`, `canAddEntry`, `SizeCheckResult`
**schema:** `ManifestVersionSchema`, `AccessMethodSchema`, `DependencyTypeSchema`, `DetectionMethodSchema`, `SeveritySchema`, `AuthConfigSchema`, `MonitoringRulesSchema`, `DependencyEntrySchema`, `DependencyManifestSchema`, `ScheduleSchema`, `LLMConfigSchema`, `IssueConfigSchema`, `DependencyOverrideSchema`, `ChangeTypeSchema`, `ChangeDetectionRecordSchema`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)