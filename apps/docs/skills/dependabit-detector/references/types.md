# Types & Enums

## Detector

### `LLMProvider`
Contract that all LLM provider implementations must satisfy.

### `LLMResponse`
The structured response returned by LLMProvider.analyze.
**Properties:**
- `dependencies: DetectedDependency[]`
- `usage: LLMUsageMetadata`
- `rawResponse: string` (optional) — Raw model output; present only when the provider preserves it.

### `RateLimitInfo`
Rate limit information returned by LLMProvider.getRateLimit.
**Properties:**
- `remaining: number`
- `limit: number`
- `resetAt: Date`

### `DetectedDependency`
A single dependency detected by the LLM.
**Properties:**
- `url: string`
- `name: string`
- `description: string` (optional)
- `type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"`
- `confidence: number` — Detection confidence in the range [0.0, 1.0].
- `reasoning: string` (optional) — LLM's explanation of why this was classified as a dependency.

### `LLMUsageMetadata`
Token usage and latency metadata included in every LLMResponse.
**Properties:**
- `promptTokens: number`
- `completionTokens: number`
- `totalTokens: number`
- `model: string`
- `latencyMs: number`

### `DetectionResult`
The result produced by Detector.detectDependencies or
Detector.analyzeFiles.
**Properties:**
- `dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]` — Discovered dependency entries ready for merging into a manifest.
- `statistics: { filesScanned: number; urlsFound: number; llmCalls: number; totalTokens: number; totalLatencyMs: number }` — Diagnostic counters for the scan run.

## readme

### `ExtractedReference`
README Parser
Extracts URLs and references from README and markdown files
**Properties:**
- `url: string`
- `context: string`
- `line: number` (optional)
- `type: "markdown-link" | "bare-url" | "reference-link"`

## code-comments

### `CommentReference`
Code Comment Parser
Extracts URLs and references from code comments
**Properties:**
- `url: string`
- `context: string`
- `file: string`
- `line: number`
- `commentType: "single-line" | "multi-line" | "jsdoc"`

## package-files

### `PackageMetadata`
Package File Parser
Extracts metadata and references from package manager files
EXCLUDES actual dependencies (handled by dependabot)
**Properties:**
- `repository: string` (optional)
- `homepage: string` (optional)
- `documentation: string` (optional)
- `urls: string[]`

## diff-parser

### `DiffParseResult`
**Properties:**
- `additions: string[]`
- `deletions: string[]`

### `ExtractedContent`
**Properties:**
- `urls: string[]`
- `packageDeps: string[]`

### `ChangedFilesResult`
**Properties:**
- `relevantFiles: string[]`
- `packageFiles: string[]`
- `documentationFiles: string[]`
