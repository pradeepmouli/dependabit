# Functions

## Manifest

### `getEffectiveMonitoringRules`
Resolves the effective monitoring rules for a specific dependency URL by
merging global config defaults with any per-URL override defined in
`config.dependencies`.

Override matching is performed by exact URL equality.  A trailing slash
or query parameter difference between the stored URL and the override URL
will cause the override to be silently ignored.
```ts
getEffectiveMonitoringRules(config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }, dependencyUrl: string): { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean }
```
**Parameters:**
- `config: { version: "1"; schedule: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; llm?: { provider: "github-copilot" | "claude" | "openai" | "azure-openai"; maxTokens: number; temperature: number; model?: string }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string }; monitoring?: { enabled: boolean; autoUpdate: boolean; falsePositiveThreshold: number }; dependencies?: { url: string; schedule?: { interval: "hourly" | "daily" | "weekly" | "monthly"; timezone: string; day?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"; time?: string }; monitoring?: { enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean; severityOverride?: "breaking" | "major" | "minor" }; issues?: { labels: string[]; assignees: string[]; titleTemplate: string; aiAgentAssignment?: { enabled: boolean; breaking?: string; major?: string; minor?: string }; bodyTemplate?: string } }[]; ignore?: { useGitExcludes: boolean; urls?: string[]; types?: ("reference-implementation" | "schema" | "documentation" | "research-paper" | "api-example" | "other")[]; patterns?: string[] } }` — Root `DependabitConfig` object.
- `dependencyUrl: string` — The exact URL of the dependency to look up.
**Returns:** `{ enabled: boolean; checkFrequency: "hourly" | "daily" | "weekly" | "monthly"; ignoreChanges: boolean }` — Resolved `enabled`, `checkFrequency`, and `ignoreChanges` values.
