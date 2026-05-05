# Functions

## Manifest

### `writeManifest`
Serialises a manifest to pretty-printed JSON and writes it to disk.

The directory is created recursively if it does not exist.
When `strict` is `false` (the default) the file is written even if
validation fails; validation errors are returned in the result so callers
can surface them as warnings.
```ts
writeManifest(path: string, manifest: { version: "1.0.0"; generatedAt: string; generatedBy: { action: string; version: string; llmProvider: string; llmModel?: string }; repository: { owner: string; name: string; branch: string; commit: string }; dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]; statistics: { totalDependencies: number; byType: Record<string, number>; byAccessMethod: Record<string, number>; byDetectionMethod: Record<string, number>; averageConfidence: number; falsePositiveRate?: number } }, options?: { strict?: boolean }): Promise<{ validationErrors?: string[] }>
```
**Parameters:**
- `path: string` — Destination file path.
- `manifest: { version: "1.0.0"; generatedAt: string; generatedBy: { action: string; version: string; llmProvider: string; llmModel?: string }; repository: { owner: string; name: string; branch: string; commit: string }; dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]; statistics: { totalDependencies: number; byType: Record<string, number>; byAccessMethod: Record<string, number>; byDetectionMethod: Record<string, number>; averageConfidence: number; falsePositiveRate?: number } }` — Manifest object to write.
- `options: { strict?: boolean }` (optional) — Optional write behaviour overrides.
**Returns:** `Promise<{ validationErrors?: string[] }>` — An object that may contain `validationErrors` if the manifest
  has schema violations and `strict` is `false`.
**Throws:** Only when `options.strict` is `true` and the
  manifest fails validation.
