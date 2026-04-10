[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / readManifest

# Function: readManifest()

> **readManifest**(`path`): `Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>

Defined in: [packages/manifest/src/manifest.ts:9](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/manifest/src/manifest.ts#L9)

Read and parse a manifest file

## Parameters

### path

`string`

## Returns

`Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>
