[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / writeManifest

# Function: writeManifest()

> **writeManifest**(`path`, `manifest`, `options?`): `Promise`\<\{ `validationErrors?`: `string`[]; \}\>

Defined in: [packages/manifest/src/manifest.ts:18](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/manifest/src/manifest.ts#L18)

Write a manifest to file

## Parameters

### path

`string`

### manifest

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

#### strict?

`boolean`

## Returns

`Promise`\<\{ `validationErrors?`: `string`[]; \}\>
