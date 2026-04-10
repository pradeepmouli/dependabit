[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / validateDependencyEntry

# Function: validateDependencyEntry()

> **validateDependencyEntry**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:50](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/manifest/src/validator.ts#L50)

Validate a dependency entry

## Parameters

### data

`unknown`

## Returns

`object`

### accessMethod

> **accessMethod**: `"context7"` \| `"arxiv"` \| `"openapi"` \| `"github-api"` \| `"http"` = `AccessMethodSchema`

### auth?

> `optional` **auth?**: `object` = `AuthConfigSchema`

#### auth.secretEnvVar?

> `optional` **secretEnvVar?**: `string`

#### auth.type

> **type**: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`

### changeHistory

> **changeHistory**: `object`[]

### currentStateHash

> **currentStateHash**: `string`

### currentVersion?

> `optional` **currentVersion?**: `string`

### description?

> `optional` **description?**: `string`

### detectedAt

> **detectedAt**: `string`

### detectionConfidence

> **detectionConfidence**: `number`

### detectionMethod

> **detectionMethod**: `"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"` \| `"code-comment"` = `DetectionMethodSchema`

### id

> **id**: `string`

### lastChanged?

> `optional` **lastChanged?**: `string`

### lastChecked

> **lastChecked**: `string`

### monitoring?

> `optional` **monitoring?**: `object`

#### monitoring.checkFrequency

> **checkFrequency**: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`

#### monitoring.enabled

> **enabled**: `boolean`

#### monitoring.ignoreChanges

> **ignoreChanges**: `boolean`

#### monitoring.severityOverride?

> `optional` **severityOverride?**: `"breaking"` \| `"major"` \| `"minor"`

### name

> **name**: `string`

### referencedIn

> **referencedIn**: `object`[]

### type

> **type**: `"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"` = `DependencyTypeSchema`

### url

> **url**: `string`

## Throws

if validation fails
