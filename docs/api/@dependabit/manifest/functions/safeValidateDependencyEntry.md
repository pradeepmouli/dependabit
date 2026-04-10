[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / safeValidateDependencyEntry

# Function: safeValidateDependencyEntry()

> **safeValidateDependencyEntry**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:98](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/validator.ts#L98)

Safe validation for dependency entry

## Parameters

### data

`unknown`

## Returns

`object`

### data?

> `optional` **data?**: `object`

#### data.accessMethod

> **accessMethod**: `"context7"` \| `"arxiv"` \| `"openapi"` \| `"github-api"` \| `"http"` = `AccessMethodSchema`

#### data.auth?

> `optional` **auth?**: `object` = `AuthConfigSchema`

#### data.auth.secretEnvVar?

> `optional` **secretEnvVar?**: `string`

#### data.auth.type

> **type**: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`

#### data.changeHistory

> **changeHistory**: `object`[]

#### data.currentStateHash

> **currentStateHash**: `string`

#### data.currentVersion?

> `optional` **currentVersion?**: `string`

#### data.description?

> `optional` **description?**: `string`

#### data.detectedAt

> **detectedAt**: `string`

#### data.detectionConfidence

> **detectionConfidence**: `number`

#### data.detectionMethod

> **detectionMethod**: `"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"` \| `"code-comment"` = `DetectionMethodSchema`

#### data.id

> **id**: `string`

#### data.lastChanged?

> `optional` **lastChanged?**: `string`

#### data.lastChecked

> **lastChecked**: `string`

#### data.monitoring?

> `optional` **monitoring?**: `object`

#### data.monitoring.checkFrequency

> **checkFrequency**: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`

#### data.monitoring.enabled

> **enabled**: `boolean`

#### data.monitoring.ignoreChanges

> **ignoreChanges**: `boolean`

#### data.monitoring.severityOverride?

> `optional` **severityOverride?**: `"breaking"` \| `"major"` \| `"minor"`

#### data.name

> **name**: `string`

#### data.referencedIn

> **referencedIn**: `object`[]

#### data.type

> **type**: `"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"` = `DependencyTypeSchema`

#### data.url

> **url**: `string`

### error?

> `optional` **error?**: [`ValidationError`](../classes/ValidationError.md)

### success

> **success**: `boolean`
