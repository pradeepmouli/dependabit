# Classes

## Monitor

### `Monitor`
Orchestrates dependency checking across multiple access methods.
```ts
constructor(): Monitor
```
**Methods:**
- `checkDependency(dependency: DependencyConfig): Promise<CheckResult>` — Checks a single dependency for changes
- `checkAll(dependencies: DependencyConfig[]): Promise<CheckResult[]>` — Checks multiple dependencies, respecting monitoring rules
- `registerChecker(accessMethod: string, checker: Checker): void` — Registers a custom checker for an access method
```ts
import { Monitor } from '@dependabit/monitor';

const monitor = new Monitor();
const results = await monitor.checkAll(dependencies);
for (const result of results) {
  if (result.hasChanged) {
    console.log(`${result.dependency.url} changed with severity ${result.severity}`);
  }
}
```

### `GitHubRepoChecker`
Contract for all dependency checker implementations.
*implements `Checker`*
```ts
constructor(): GitHubRepoChecker
```
**Methods:**
- `fetch(config: AccessConfig): Promise<DependencySnapshot>` — Fetches latest release information from a GitHub repository
- `compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection>` — Compares two snapshots to detect version/state changes

### `URLContentChecker`
Contract for all dependency checker implementations.
*implements `Checker`*
```ts
constructor(): URLContentChecker
```
**Methods:**
- `fetch(config: AccessConfig): Promise<DependencySnapshot>` — Fetches and hashes URL content
- `compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection>` — Compares two snapshots to detect content changes

### `OpenAPIChecker`
Contract for all dependency checker implementations.
*implements `Checker`*
```ts
constructor(): OpenAPIChecker
```
**Methods:**
- `fetch(config: AccessConfig): Promise<DependencySnapshot>` — Fetches and parses OpenAPI specification
- `compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection>` — Compares two OpenAPI snapshots with semantic diffing

## comparator

### `StateComparator`
```ts
constructor(): StateComparator
```
**Methods:**
- `compare(oldState: DependencySnapshot, newState: DependencySnapshot): ChangeDetection` — Compares two dependency snapshots to detect changes

## severity

### `SeverityClassifier`
```ts
constructor(): SeverityClassifier
```
**Methods:**
- `classify(changes: ChangeDetection): Severity` — Classifies the severity of a change based on version changes and change types

## scheduler

### `Scheduler`
Scheduler for per-dependency monitoring

Determines which dependencies should be checked based on:
- Check frequency (hourly, daily, weekly, monthly)
- Last checked timestamp
- Enabled/disabled status
- IgnoreChanges flag
- Config overrides
```ts
constructor(): Scheduler
```
**Methods:**
- `shouldCheckDependency(dependency: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }, config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }, currentTime: Date): boolean` — Check if a dependency should be checked now
- `filterDependenciesToCheck(dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[], config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }, currentTime: Date): { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[]` — Filter dependencies that should be checked
- `getNextCheckTime(dependency: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }, config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }): Date` — Get next check time for a dependency
- `getScheduleSummary(dependencies: { id: string; url: string; type: "reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other"; accessMethod: "context7" | "arxiv" | "openapi" | "github-api" | "http"; name: string; currentStateHash: string; detectionMethod: "llm-analysis" | "manual" | "package-json" | "requirements-txt" | "code-comment"; detectionConfidence: number; detectedAt: string; lastChecked: string; referencedIn: { file: string; line?: number; context?: string }[]; changeHistory: { detectedAt: string; severity: "breaking" | "major" | "minor"; falsePositive: boolean; oldVersion?: string; newVersion?: string; issueNumber?: number }[]; description?: string; currentVersion?: string; lastChanged?: string; auth?: { type: "token" | "oauth" | "basic" | "none"; secretEnvVar?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" } }[], config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }): { hourly: number; daily: number; weekly: number; monthly: number; disabled: number }` — Get schedule summary for all dependencies
