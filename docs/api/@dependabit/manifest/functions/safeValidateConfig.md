[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / safeValidateConfig

# Function: safeValidateConfig()

> **safeValidateConfig**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:117](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/manifest/src/validator.ts#L117)

Safe validation for config

## Parameters

### data

`unknown`

## Returns

`object`

### data?

> `optional` **data?**: `object`

#### data.dependencies?

> `optional` **dependencies?**: `object`[]

#### data.ignore?

> `optional` **ignore?**: `object`

#### data.ignore.patterns?

> `optional` **patterns?**: `string`[]

#### data.ignore.types?

> `optional` **types?**: (`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`)[]

#### data.ignore.urls?

> `optional` **urls?**: `string`[]

#### data.ignore.useGitExcludes

> **useGitExcludes**: `boolean`

#### data.issues?

> `optional` **issues?**: `object`

#### data.issues.aiAgentAssignment?

> `optional` **aiAgentAssignment?**: `object`

#### data.issues.aiAgentAssignment.breaking?

> `optional` **breaking?**: `string`

#### data.issues.aiAgentAssignment.enabled

> **enabled**: `boolean`

#### data.issues.aiAgentAssignment.major?

> `optional` **major?**: `string`

#### data.issues.aiAgentAssignment.minor?

> `optional` **minor?**: `string`

#### data.issues.assignees

> **assignees**: `string`[]

#### data.issues.bodyTemplate?

> `optional` **bodyTemplate?**: `string`

#### data.issues.labels

> **labels**: `string`[]

#### data.issues.titleTemplate

> **titleTemplate**: `string`

#### data.llm?

> `optional` **llm?**: `object`

#### data.llm.maxTokens

> **maxTokens**: `number`

#### data.llm.model?

> `optional` **model?**: `string`

#### data.llm.provider

> **provider**: `"github-copilot"` \| `"claude"` \| `"openai"` \| `"azure-openai"`

#### data.llm.temperature

> **temperature**: `number`

#### data.monitoring?

> `optional` **monitoring?**: `object`

#### data.monitoring.autoUpdate

> **autoUpdate**: `boolean`

#### data.monitoring.enabled

> **enabled**: `boolean`

#### data.monitoring.falsePositiveThreshold

> **falsePositiveThreshold**: `number`

#### data.schedule

> **schedule**: `object`

#### data.schedule.day?

> `optional` **day?**: `"monday"` \| `"tuesday"` \| `"wednesday"` \| `"thursday"` \| `"friday"` \| `"saturday"` \| `"sunday"`

#### data.schedule.interval

> **interval**: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`

#### data.schedule.time?

> `optional` **time?**: `string`

#### data.schedule.timezone

> **timezone**: `string`

#### data.version

> **version**: `"1"`

### error?

> `optional` **error?**: [`ValidationError`](../classes/ValidationError.md)

### success

> **success**: `boolean`
