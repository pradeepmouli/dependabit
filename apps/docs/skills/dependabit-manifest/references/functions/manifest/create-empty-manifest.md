# Functions

## Manifest

### `createEmptyManifest`
Creates a minimal, valid manifest with an empty `dependencies` array.

Use this as the starting point when generating a manifest from scratch
(e.g. on first run in a new repository).
```ts
createEmptyManifest(options: { owner: string; name: string; branch: string; commit: string; action?: string; version?: string; llmProvider?: string; llmModel?: string }): { version: "1.0.0"; generatedAt: string; generatedBy: { action: string; version: string; llmProvider: string; llmModel?: string }; repository: { owner: string; name: string; branch: string; commit: string }; dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]; statistics: { totalDependencies: number; byType: Record<string, number>; byAccessMethod: Record<string, number>; byDetectionMethod: Record<string, number>; averageConfidence: number; falsePositiveRate?: number } }
```
**Parameters:**
- `options: { owner: string; name: string; branch: string; commit: string; action?: string; version?: string; llmProvider?: string; llmModel?: string }`
**Returns:** `{ version: "1.0.0"; generatedAt: string; generatedBy: { action: string; version: string; llmProvider: string; llmModel?: string }; repository: { owner: string; name: string; branch: string; commit: string }; dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]; statistics: { totalDependencies: number; byType: Record<string, number>; byAccessMethod: Record<string, number>; byDetectionMethod: Record<string, number>; averageConfidence: number; falsePositiveRate?: number } }` — A new `DependencyManifest` with zeroed statistics.
```ts
const manifest = createEmptyManifest({
  owner: 'my-org', name: 'my-repo',
  branch: 'main', commit: 'abc123',
});
await writeManifest('.dependabit/manifest.json', manifest);
```
