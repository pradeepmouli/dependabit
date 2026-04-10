[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / validateConfig

# Function: validateConfig()

> **validateConfig**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:65](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/manifest/src/validator.ts#L65)

Validate a dependabit configuration

## Parameters

### data

`unknown`

## Returns

`object`

### dependencies?

> `optional` **dependencies?**: `object`[]

### ignore?

> `optional` **ignore?**: `object`

#### ignore.patterns?

> `optional` **patterns?**: `string`[]

#### ignore.types?

> `optional` **types?**: (`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[]

#### ignore.urls?

> `optional` **urls?**: `string`[]

#### ignore.useGitExcludes

> **useGitExcludes**: `boolean`

### issues?

> `optional` **issues?**: `object`

#### issues.aiAgentAssignment?

> `optional` **aiAgentAssignment?**: `object`

#### issues.aiAgentAssignment.breaking?

> `optional` **breaking?**: `string`

#### issues.aiAgentAssignment.enabled

> **enabled**: `boolean`

#### issues.aiAgentAssignment.major?

> `optional` **major?**: `string`

#### issues.aiAgentAssignment.minor?

> `optional` **minor?**: `string`

#### issues.assignees

> **assignees**: `string`[]

#### issues.bodyTemplate?

> `optional` **bodyTemplate?**: `string`

#### issues.labels

> **labels**: `string`[]

#### issues.titleTemplate

> **titleTemplate**: `string`

### llm?

> `optional` **llm?**: `object`

#### llm.maxTokens

> **maxTokens**: `number`

#### llm.model?

> `optional` **model?**: `string`

#### llm.provider

> **provider**: `"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"`

#### llm.temperature

> **temperature**: `number`

### monitoring?

> `optional` **monitoring?**: `object`

#### monitoring.autoUpdate

> **autoUpdate**: `boolean`

#### monitoring.enabled

> **enabled**: `boolean`

#### monitoring.falsePositiveThreshold

> **falsePositiveThreshold**: `number`

### schedule

> **schedule**: `object`

#### schedule.day?

> `optional` **day?**: `"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"`

#### schedule.interval

> **interval**: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`

#### schedule.time?

> `optional` **time?**: `string`

#### schedule.timezone

> **timezone**: `string`

### version

> **version**: `"1"`

## Throws

if validation fails
