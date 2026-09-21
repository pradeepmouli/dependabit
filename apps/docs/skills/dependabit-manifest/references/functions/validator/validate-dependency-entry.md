# Functions

## validator

### `validateDependencyEntry`
Validate a dependency entry
```ts
validateDependencyEntry(data: unknown): { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }
```
**Parameters:**
- `data: unknown`
**Returns:** `{ id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }`
**Throws:** if validation fails
