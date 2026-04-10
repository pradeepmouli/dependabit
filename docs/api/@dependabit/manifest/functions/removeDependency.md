[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / removeDependency

# Function: removeDependency()

> **removeDependency**(`path`, `dependencyId`): `Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>

Defined in: [packages/manifest/src/manifest.ts:113](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/manifest/src/manifest.ts#L113)

Remove a dependency from the manifest

## Parameters

### path

`string`

### dependencyId

`string`

## Returns

`Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>
