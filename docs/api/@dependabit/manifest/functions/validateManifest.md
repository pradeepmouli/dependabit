[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / validateManifest

# Function: validateManifest()

> **validateManifest**(`data`): `object`

Defined in: [packages/manifest/src/validator.ts:35](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/manifest/src/validator.ts#L35)

Validate a dependency manifest

## Parameters

### data

`unknown`

## Returns

`object`

### dependencies

> **dependencies**: `object`[]

### generatedAt

> **generatedAt**: `string`

### generatedBy

> **generatedBy**: `object`

#### generatedBy.action

> **action**: `string`

#### generatedBy.llmModel?

> `optional` **llmModel?**: `string`

#### generatedBy.llmProvider

> **llmProvider**: `string`

#### generatedBy.version

> **version**: `string`

### repository

> **repository**: `object`

#### repository.branch

> **branch**: `string`

#### repository.commit

> **commit**: `string`

#### repository.name

> **name**: `string`

#### repository.owner

> **owner**: `string`

### statistics

> **statistics**: `object`

#### statistics.averageConfidence

> **averageConfidence**: `number`

#### statistics.byAccessMethod

> **byAccessMethod**: `Record`\<`string`, `number`\>

#### statistics.byDetectionMethod

> **byDetectionMethod**: `Record`\<`string`, `number`\>

#### statistics.byType

> **byType**: `Record`\<`string`, `number`\>

#### statistics.falsePositiveRate?

> `optional` **falsePositiveRate?**: `number`

#### statistics.totalDependencies

> **totalDependencies**: `number`

### version

> **version**: `"1.0.0"` = `ManifestVersionSchema`

## Throws

if validation fails
