# Configuration

## DependabitConfig

Root configuration object parsed from `.dependabit.yml`.

### Use when
- Passing configuration to runtime components (`Scheduler`, `Monitor`, etc.) that need to respect per-dependency overrides.

### NEVER
- YAML comments in the original file are **lost** after a `parseConfig → stringifyConfig` round-trip.
- The `version` field must be the string `"1"` (not `1` or `"1.0.0"`).

## LLMConfig

LLM provider configuration stored inside the manifest's `generatedBy`
section and in `DependabitConfig.llm`.

### NEVER
- `model` is optional and defaults to the provider's current default. Omitting it means model changes in new SDK versions can silently alter detection behaviour.

## IssueConfig

Configuration for GitHub issue creation on change detection.

## SizeCheckOptions

### Properties

#### warnThreshold



**Type:** `number`

#### errorThreshold



**Type:** `number`