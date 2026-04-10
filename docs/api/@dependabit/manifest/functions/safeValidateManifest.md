[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / safeValidateManifest

# Function: safeValidateManifest()

> **safeValidateManifest**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:79](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/manifest/src/validator.ts#L79)

Safe validation that returns success/error result

## Parameters

### data

`unknown`

## Returns

`object`

### data?

> `optional` **data?**: `object`

#### data.dependencies

> **dependencies**: `object`[]

#### data.generatedAt

> **generatedAt**: `string`

#### data.generatedBy

> **generatedBy**: `object`

#### data.generatedBy.action

> **action**: `string`

#### data.generatedBy.llmModel?

> `optional` **llmModel?**: `string`

#### data.generatedBy.llmProvider

> **llmProvider**: `string`

#### data.generatedBy.version

> **version**: `string`

#### data.repository

> **repository**: `object`

#### data.repository.branch

> **branch**: `string`

#### data.repository.commit

> **commit**: `string`

#### data.repository.name

> **name**: `string`

#### data.repository.owner

> **owner**: `string`

#### data.statistics

> **statistics**: `object`

#### data.statistics.averageConfidence

> **averageConfidence**: `number`

#### data.statistics.byAccessMethod

> **byAccessMethod**: `Record`\<`string`, `number`\>

#### data.statistics.byDetectionMethod

> **byDetectionMethod**: `Record`\<`string`, `number`\>

#### data.statistics.byType

> **byType**: `Record`\<`string`, `number`\>

#### data.statistics.falsePositiveRate?

> `optional` **falsePositiveRate?**: `number`

#### data.statistics.totalDependencies

> **totalDependencies**: `number`

#### data.version

> **version**: `"1.0.0"` = `ManifestVersionSchema`

### error?

> `optional` **error?**: [`ValidationError`](../classes/ValidationError.md)

### success

> **success**: `boolean`
