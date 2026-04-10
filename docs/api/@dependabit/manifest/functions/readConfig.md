[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / readConfig

# Function: readConfig()

> **readConfig**(`path`): `Promise`\<\{ `dependencies?`: `object`[]; `ignore?`: \{ `patterns?`: `string`[]; `types?`: (`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}; `issues?`: \{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}; `llm?`: \{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"`; `temperature`: `number`; \}; `monitoring?`: \{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}; `schedule`: \{ `day?`: `"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"`; `interval`: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`; `time?`: `string`; `timezone`: `string`; \}; `version`: `"1"`; \}\>

Defined in: [packages/manifest/src/config.ts:9](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/config.ts#L9)

Parse and validate a YAML configuration file

## Parameters

### path

`string`

## Returns

`Promise`\<\{ `dependencies?`: `object`[]; `ignore?`: \{ `patterns?`: `string`[]; `types?`: (`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}; `issues?`: \{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}; `llm?`: \{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"`; `temperature`: `number`; \}; `monitoring?`: \{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}; `schedule`: \{ `day?`: `"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"`; `interval`: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`; `time?`: `string`; `timezone`: `string`; \}; `version`: `"1"`; \}\>
