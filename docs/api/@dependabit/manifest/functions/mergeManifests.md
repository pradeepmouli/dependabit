[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / mergeManifests

# Function: mergeManifests()

> **mergeManifests**(`existing`, `updated`, `options?`): `object`

Defined in: [packages/manifest/src/manifest.ts:140](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/manifest/src/manifest.ts#L140)

Merge two manifests, preserving manual entries
Manual entries are those with detectionMethod === 'manual'

## Parameters

### existing

#### dependencies

`object`[] = `...`

#### generatedAt

`string` = `...`

#### generatedBy

\{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \} = `...`

#### generatedBy.action

`string` = `...`

#### generatedBy.llmModel?

`string` = `...`

#### generatedBy.llmProvider

`string` = `...`

#### generatedBy.version

`string` = `...`

#### repository

\{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \} = `...`

#### repository.branch

`string` = `...`

#### repository.commit

`string` = `...`

#### repository.name

`string` = `...`

#### repository.owner

`string` = `...`

#### statistics

\{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \} = `...`

#### statistics.averageConfidence

`number` = `...`

#### statistics.byAccessMethod

`Record`\<`string`, `number`\> = `...`

#### statistics.byDetectionMethod

`Record`\<`string`, `number`\> = `...`

#### statistics.byType

`Record`\<`string`, `number`\> = `...`

#### statistics.falsePositiveRate?

`number` = `...`

#### statistics.totalDependencies

`number` = `...`

#### version

`"1.0.0"` = `ManifestVersionSchema`

### updated

#### dependencies

`object`[] = `...`

#### generatedAt

`string` = `...`

#### generatedBy

\{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \} = `...`

#### generatedBy.action

`string` = `...`

#### generatedBy.llmModel?

`string` = `...`

#### generatedBy.llmProvider

`string` = `...`

#### generatedBy.version

`string` = `...`

#### repository

\{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \} = `...`

#### repository.branch

`string` = `...`

#### repository.commit

`string` = `...`

#### repository.name

`string` = `...`

#### repository.owner

`string` = `...`

#### statistics

\{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \} = `...`

#### statistics.averageConfidence

`number` = `...`

#### statistics.byAccessMethod

`Record`\<`string`, `number`\> = `...`

#### statistics.byDetectionMethod

`Record`\<`string`, `number`\> = `...`

#### statistics.byType

`Record`\<`string`, `number`\> = `...`

#### statistics.falsePositiveRate?

`number` = `...`

#### statistics.totalDependencies

`number` = `...`

#### version

`"1.0.0"` = `ManifestVersionSchema`

### options?

#### preserveHistory?

`boolean`

#### preserveManual?

`boolean`

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
