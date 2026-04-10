[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / stringifyConfig

# Function: stringifyConfig()

> **stringifyConfig**(`config`): `string`

Defined in: [packages/manifest/src/config.ts:26](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/manifest/src/config.ts#L26)

Convert config to YAML string

## Parameters

### config

#### dependencies?

`object`[] = `...`

#### ignore?

\{ `patterns?`: `string`[]; `types?`: (`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \} = `...`

#### ignore.patterns?

`string`[] = `...`

#### ignore.types?

(`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[] = `...`

#### ignore.urls?

`string`[] = `...`

#### ignore.useGitExcludes

`boolean` = `...`

#### issues?

\{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \} = `...`

#### issues.aiAgentAssignment?

\{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \} = `...`

#### issues.aiAgentAssignment.breaking?

`string` = `...`

#### issues.aiAgentAssignment.enabled

`boolean` = `...`

#### issues.aiAgentAssignment.major?

`string` = `...`

#### issues.aiAgentAssignment.minor?

`string` = `...`

#### issues.assignees

`string`[] = `...`

#### issues.bodyTemplate?

`string` = `...`

#### issues.labels

`string`[] = `...`

#### issues.titleTemplate

`string` = `...`

#### llm?

\{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"`; `temperature`: `number`; \} = `...`

#### llm.maxTokens

`number` = `...`

#### llm.model?

`string` = `...`

#### llm.provider

`"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"` = `...`

#### llm.temperature

`number` = `...`

#### monitoring?

\{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \} = `...`

#### monitoring.autoUpdate

`boolean` = `...`

#### monitoring.enabled

`boolean` = `...`

#### monitoring.falsePositiveThreshold

`number` = `...`

#### schedule

\{ `day?`: `"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"`; `interval`: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`; `time?`: `string`; `timezone`: `string`; \} = `...`

#### schedule.day?

`"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"` = `...`

#### schedule.interval

`"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"` = `...`

#### schedule.time?

`string` = `...`

#### schedule.timezone

`string` = `...`

#### version

`"1"` = `...`

## Returns

`string`
