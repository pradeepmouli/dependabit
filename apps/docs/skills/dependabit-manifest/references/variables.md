# Variables & Constants

## schema

### `ManifestVersionSchema`
```ts
const ManifestVersionSchema: ZodLiteral<"1.0.0">
```

### `AccessMethodSchema`
```ts
const AccessMethodSchema: ZodEnum<{ context7: "context7"; arxiv: "arxiv"; openapi: "openapi"; github-api: "github-api"; http: "http" }>
```

### `DependencyTypeSchema`
```ts
const DependencyTypeSchema: ZodEnum<{ reference-implementation: "reference-implementation"; schema: "schema"; documentation: "documentation"; research-paper: "research-paper"; api-example: "api-example"; other: "other" }>
```

### `DetectionMethodSchema`
```ts
const DetectionMethodSchema: ZodEnum<{ llm-analysis: "llm-analysis"; manual: "manual"; package-json: "package-json"; requirements-txt: "requirements-txt"; code-comment: "code-comment" }>
```

### `SeveritySchema`
```ts
const SeveritySchema: ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>
```

### `AuthConfigSchema`
```ts
const AuthConfigSchema: ZodOptional<ZodObject<{ type: ZodEnum<{ token: "token"; oauth: "oauth"; basic: "basic"; none: "none" }>; secretEnvVar: ZodOptional<ZodString> }, $strip>>
```

### `MonitoringRulesSchema`
```ts
const MonitoringRulesSchema: ZodObject<{ enabled: ZodDefault<ZodBoolean>; checkFrequency: ZodDefault<ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>>; ignoreChanges: ZodDefault<ZodBoolean>; severityOverride: ZodOptional<ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>> }, $strip>
```

### `DependencyEntrySchema`
```ts
const DependencyEntrySchema: ZodObject<{ id: ZodString; url: ZodString; type: ZodEnum<{ reference-implementation: "reference-implementation"; schema: "schema"; documentation: "documentation"; research-paper: "research-paper"; api-example: "api-example"; other: "other" }>; accessMethod: ZodEnum<{ context7: "context7"; arxiv: "arxiv"; openapi: "openapi"; github-api: "github-api"; http: "http" }>; name: ZodString; description: ZodOptional<ZodString>; currentVersion: ZodOptional<ZodString>; currentStateHash: ZodString; detectionMethod: ZodEnum<{ llm-analysis: "llm-analysis"; manual: "manual"; package-json: "package-json"; requirements-txt: "requirements-txt"; code-comment: "code-comment" }>; detectionConfidence: ZodNumber; detectedAt: ZodString; lastChecked: ZodString; lastChanged: ZodOptional<ZodString>; auth: ZodOptional<ZodObject<{ type: ZodEnum<{ token: "token"; oauth: "oauth"; basic: "basic"; none: "none" }>; secretEnvVar: ZodOptional<ZodString> }, $strip>>; monitoring: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; checkFrequency: ZodDefault<ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>>; ignoreChanges: ZodDefault<ZodBoolean>; severityOverride: ZodOptional<ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>> }, $strip>>; referencedIn: ZodArray<ZodObject<{ file: ZodString; line: ZodOptional<ZodNumber>; context: ZodOptional<ZodString> }, $strip>>; changeHistory: ZodDefault<ZodArray<ZodObject<{ detectedAt: ZodString; oldVersion: ZodOptional<ZodString>; newVersion: ZodOptional<ZodString>; severity: ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>; issueNumber: ZodOptional<ZodNumber>; falsePositive: ZodDefault<ZodBoolean> }, $strip>>> }, $strip>
```

### `DependencyManifestSchema`
```ts
const DependencyManifestSchema: ZodObject<{ version: ZodLiteral<"1.0.0">; generatedAt: ZodString; generatedBy: ZodObject<{ action: ZodString; version: ZodString; llmProvider: ZodString; llmModel: ZodOptional<ZodString> }, $strip>; repository: ZodObject<{ owner: ZodString; name: ZodString; branch: ZodString; commit: ZodString }, $strip>; dependencies: ZodArray<ZodObject<{ id: ZodString; url: ZodString; type: ZodEnum<{ reference-implementation: "reference-implementation"; schema: "schema"; documentation: "documentation"; research-paper: "research-paper"; api-example: "api-example"; other: "other" }>; accessMethod: ZodEnum<{ context7: "context7"; arxiv: "arxiv"; openapi: "openapi"; github-api: "github-api"; http: "http" }>; name: ZodString; description: ZodOptional<ZodString>; currentVersion: ZodOptional<ZodString>; currentStateHash: ZodString; detectionMethod: ZodEnum<{ llm-analysis: "llm-analysis"; manual: "manual"; package-json: "package-json"; requirements-txt: "requirements-txt"; code-comment: "code-comment" }>; detectionConfidence: ZodNumber; detectedAt: ZodString; lastChecked: ZodString; lastChanged: ZodOptional<ZodString>; auth: ZodOptional<ZodObject<{ type: ZodEnum<{ token: "token"; oauth: "oauth"; basic: "basic"; none: "none" }>; secretEnvVar: ZodOptional<ZodString> }, $strip>>; monitoring: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; checkFrequency: ZodDefault<ZodEnum<{ hourly: ...; daily: ...; weekly: ...; monthly: ... }>>; ignoreChanges: ZodDefault<ZodBoolean>; severityOverride: ZodOptional<ZodEnum<{ breaking: ...; major: ...; minor: ... }>> }, $strip>>; referencedIn: ZodArray<ZodObject<{ file: ZodString; line: ZodOptional<ZodNumber>; context: ZodOptional<ZodString> }, $strip>>; changeHistory: ZodDefault<ZodArray<ZodObject<{ detectedAt: ZodString; oldVersion: ZodOptional<ZodString>; newVersion: ZodOptional<ZodString>; severity: ZodEnum<{ breaking: ...; major: ...; minor: ... }>; issueNumber: ZodOptional<ZodNumber>; falsePositive: ZodDefault<ZodBoolean> }, $strip>>> }, $strip>>; statistics: ZodObject<{ totalDependencies: ZodNumber; byType: ZodRecord<ZodString, ZodNumber>; byAccessMethod: ZodRecord<ZodString, ZodNumber>; byDetectionMethod: ZodRecord<ZodString, ZodNumber>; averageConfidence: ZodNumber; falsePositiveRate: ZodOptional<ZodNumber> }, $strip> }, $strip>
```

### `ScheduleSchema`
```ts
const ScheduleSchema: ZodObject<{ interval: ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>; day: ZodOptional<ZodEnum<{ monday: "monday"; tuesday: "tuesday"; wednesday: "wednesday"; thursday: "thursday"; friday: "friday"; saturday: "saturday"; sunday: "sunday" }>>; time: ZodOptional<ZodString>; timezone: ZodDefault<ZodString> }, $strip>
```

### `LLMConfigSchema`
```ts
const LLMConfigSchema: ZodObject<{ provider: ZodDefault<ZodEnum<{ github-copilot: "github-copilot"; claude: "claude"; openai: "openai"; azure-openai: "azure-openai" }>>; model: ZodOptional<ZodString>; maxTokens: ZodDefault<ZodNumber>; temperature: ZodDefault<ZodNumber> }, $strip>
```

### `IssueConfigSchema`
```ts
const IssueConfigSchema: ZodObject<{ labels: ZodDefault<ZodArray<ZodString>>; assignees: ZodDefault<ZodArray<ZodString>>; aiAgentAssignment: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; breaking: ZodOptional<ZodString>; major: ZodOptional<ZodString>; minor: ZodOptional<ZodString> }, $strip>>; titleTemplate: ZodDefault<ZodString>; bodyTemplate: ZodOptional<ZodString> }, $strip>
```

### `DependencyOverrideSchema`
```ts
const DependencyOverrideSchema: ZodObject<{ url: ZodString; schedule: ZodOptional<ZodObject<{ interval: ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>; day: ZodOptional<ZodEnum<{ monday: "monday"; tuesday: "tuesday"; wednesday: "wednesday"; thursday: "thursday"; friday: "friday"; saturday: "saturday"; sunday: "sunday" }>>; time: ZodOptional<ZodString>; timezone: ZodDefault<ZodString> }, $strip>>; monitoring: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; checkFrequency: ZodDefault<ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>>; ignoreChanges: ZodDefault<ZodBoolean>; severityOverride: ZodOptional<ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>> }, $strip>>; issues: ZodOptional<ZodObject<{ labels: ZodDefault<ZodArray<ZodString>>; assignees: ZodDefault<ZodArray<ZodString>>; aiAgentAssignment: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; breaking: ZodOptional<ZodString>; major: ZodOptional<ZodString>; minor: ZodOptional<ZodString> }, $strip>>; titleTemplate: ZodDefault<ZodString>; bodyTemplate: ZodOptional<ZodString> }, $strip>> }, $strip>
```

### `ChangeTypeSchema`
```ts
const ChangeTypeSchema: ZodEnum<{ unknown: "unknown"; version-bump: "version-bump"; content-changed: "content-changed"; released: "released"; deprecated: "deprecated"; unavailable: "unavailable" }>
```

### `ChangeDetectionRecordSchema`
```ts
const ChangeDetectionRecordSchema: ZodObject<{ id: ZodString; timestamp: ZodString; dependencyId: ZodString; dependencyUrl: ZodString; dependencyName: ZodString; changeType: ZodEnum<{ unknown: "unknown"; version-bump: "version-bump"; content-changed: "content-changed"; released: "released"; deprecated: "deprecated"; unavailable: "unavailable" }>; severity: ZodEnum<{ breaking: "breaking"; major: "major"; minor: "minor" }>; oldState: ZodObject<{ version: ZodOptional<ZodString>; hash: ZodString; checkedAt: ZodString }, $strip>; newState: ZodObject<{ version: ZodOptional<ZodString>; hash: ZodString; checkedAt: ZodString }, $strip>; summary: ZodString; details: ZodOptional<ZodString>; breakingChanges: ZodOptional<ZodArray<ZodString>>; issueCreated: ZodDefault<ZodBoolean>; issueNumber: ZodOptional<ZodNumber>; issueUrl: ZodOptional<ZodString> }, $strip>
```

## Manifest

### `DependabitConfigSchema`
Zod schema for the top-level `.dependabit.yml` / `.dependabit.json`
configuration file.
```ts
const DependabitConfigSchema: ZodObject<{ version: ZodLiteral<"1">; llm: ZodOptional<ZodObject<{ provider: ZodDefault<ZodEnum<{ github-copilot: "github-copilot"; claude: "claude"; openai: "openai"; azure-openai: "azure-openai" }>>; model: ZodOptional<ZodString>; maxTokens: ZodDefault<ZodNumber>; temperature: ZodDefault<ZodNumber> }, $strip>>; schedule: ZodDefault<ZodObject<{ interval: ZodEnum<{ hourly: "hourly"; daily: "daily"; weekly: "weekly"; monthly: "monthly" }>; day: ZodOptional<ZodEnum<{ monday: "monday"; tuesday: "tuesday"; wednesday: "wednesday"; thursday: "thursday"; friday: "friday"; saturday: "saturday"; sunday: "sunday" }>>; time: ZodOptional<ZodString>; timezone: ZodDefault<ZodString> }, $strip>>; issues: ZodOptional<ZodObject<{ labels: ZodDefault<ZodArray<ZodString>>; assignees: ZodDefault<ZodArray<ZodString>>; aiAgentAssignment: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; breaking: ZodOptional<ZodString>; major: ZodOptional<ZodString>; minor: ZodOptional<ZodString> }, $strip>>; titleTemplate: ZodDefault<ZodString>; bodyTemplate: ZodOptional<ZodString> }, $strip>>; monitoring: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; autoUpdate: ZodDefault<ZodBoolean>; falsePositiveThreshold: ZodDefault<ZodNumber> }, $strip>>; dependencies: ZodOptional<ZodArray<ZodObject<{ url: ZodString; schedule: ZodOptional<ZodObject<{ interval: ZodEnum<{ hourly: ...; daily: ...; weekly: ...; monthly: ... }>; day: ZodOptional<ZodEnum<(...)>>; time: ZodOptional<ZodString>; timezone: ZodDefault<ZodString> }, $strip>>; monitoring: ZodOptional<ZodObject<{ enabled: ZodDefault<ZodBoolean>; checkFrequency: ZodDefault<ZodEnum<(...)>>; ignoreChanges: ZodDefault<ZodBoolean>; severityOverride: ZodOptional<ZodEnum<(...)>> }, $strip>>; issues: ZodOptional<ZodObject<{ labels: ZodDefault<ZodArray<(...)>>; assignees: ZodDefault<ZodArray<(...)>>; aiAgentAssignment: ZodOptional<ZodObject<(...), (...)>>; titleTemplate: ZodDefault<ZodString>; bodyTemplate: ZodOptional<ZodString> }, $strip>> }, $strip>>>; ignore: ZodOptional<ZodObject<{ urls: ZodOptional<ZodArray<ZodString>>; types: ZodOptional<ZodArray<ZodEnum<{ reference-implementation: "reference-implementation"; schema: "schema"; documentation: "documentation"; research-paper: "research-paper"; api-example: "api-example"; other: "other" }>>>; patterns: ZodOptional<ZodArray<ZodString>>; useGitExcludes: ZodDefault<ZodBoolean> }, $strip>> }, $strip>
```
