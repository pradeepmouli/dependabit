# Types & Enums

## Manifest

### `DependencyManifest`
A fully-validated dependency manifest document.
```ts
z.infer<typeof DependencyManifestSchema>
```

### `DependencyEntry`
A single tracked external dependency inside a DependencyManifest.
```ts
z.infer<typeof DependencyEntrySchema>
```

### `DependencyType`
Semantic category of an external dependency.
```ts
z.infer<typeof DependencyTypeSchema>
```

### `AccessMethod`
The protocol/service used to fetch and compare a dependency's state.
```ts
z.infer<typeof AccessMethodSchema>
```

### `DetectionMethod`
How a dependency was originally discovered.
```ts
z.infer<typeof DetectionMethodSchema>
```

### `Severity`
Change severity level used in notifications and issue creation.
```ts
z.infer<typeof SeveritySchema>
```

### `MonitoringRules`
Per-dependency monitoring rules (check frequency, enable/disable).
```ts
z.infer<typeof MonitoringRulesSchema>
```

### `DependabitConfig`
Root configuration object parsed from `.dependabit.yml`.
```ts
z.infer<typeof DependabitConfigSchema>
```

### `Schedule`
Check schedule (cron-like, compatible with Dependabot syntax).
```ts
z.infer<typeof ScheduleSchema>
```

### `LLMConfig`
LLM provider configuration stored inside the manifest's `generatedBy`
section and in `DependabitConfig.llm`.
```ts
z.infer<typeof LLMConfigSchema>
```

### `IssueConfig`
Configuration for GitHub issue creation on change detection.
```ts
z.infer<typeof IssueConfigSchema>
```

### `DependencyOverride`
A per-URL configuration override inside `DependabitConfig.dependencies`.
```ts
z.infer<typeof DependencyOverrideSchema>
```

### `ChangeType`
Classification of the kind of change detected during monitoring.
```ts
z.infer<typeof ChangeTypeSchema>
```

### `ChangeDetectionRecord`
A persisted record of a single change detection event.
```ts
z.infer<typeof ChangeDetectionRecordSchema>
```

## size-check

### `SizeCheckResult`
Manifest size validation and warnings
Checks manifest size and warns when approaching limits
**Properties:**
- `sizeBytes: number`
- `sizeMB: number`
- `status: "error" | "ok" | "warning"`
- `message: string` (optional)
