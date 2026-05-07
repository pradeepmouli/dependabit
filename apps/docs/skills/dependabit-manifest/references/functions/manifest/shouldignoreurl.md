# Functions

## Manifest

### `shouldIgnoreUrl`
Returns `true` if the given URL matches any exclusion rule defined in
`config.ignore` (exact URL list or regex pattern list).

Invalid regex patterns in `config.ignore.patterns` are logged as warnings
via `console.warn` and skipped rather than throwing.
```ts
shouldIgnoreUrl(config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }, url: string): boolean
```
**Parameters:**
- `config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }` — Root `DependabitConfig` object.
- `url: string` — The URL to test.
**Returns:** `boolean` — `true` if the URL should be skipped; `false` otherwise.
