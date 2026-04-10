[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / addDependency

# Function: addDependency()

> **addDependency**(`path`, `dependency`): `Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>

Defined in: [packages/manifest/src/manifest.ts:80](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/manifest/src/manifest.ts#L80)

Add a new dependency to the manifest

## Parameters

### path

`string`

### dependency

#### accessMethod

`"context7"` \| `"arxiv"` \| `"openapi"` \| `"github-api"` \| `"http"` = `AccessMethodSchema`

#### auth?

\{ `secretEnvVar?`: `string`; `type`: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`; \} = `AuthConfigSchema`

#### auth.secretEnvVar?

`string` = `...`

#### auth.type

`"token"` \| `"basic"` \| `"oauth"` \| `"none"` = `...`

#### changeHistory

`object`[] = `...`

#### currentStateHash

`string` = `...`

#### currentVersion?

`string` = `...`

#### description?

`string` = `...`

#### detectedAt

`string` = `...`

#### detectionConfidence

`number` = `...`

#### detectionMethod

`"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"` \| `"code-comment"` = `DetectionMethodSchema`

#### id

`string` = `...`

#### lastChanged?

`string` = `...`

#### lastChecked

`string` = `...`

#### monitoring?

\{ `checkFrequency`: `"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"`; `enabled`: `boolean`; `ignoreChanges`: `boolean`; `severityOverride?`: `"breaking"` \| `"major"` \| `"minor"`; \} = `...`

#### monitoring.checkFrequency

`"hourly"` \| `"daily"` \| `"weekly"` \| `"monthly"` = `...`

#### monitoring.enabled

`boolean` = `...`

#### monitoring.ignoreChanges

`boolean` = `...`

#### monitoring.severityOverride?

`"breaking"` \| `"major"` \| `"minor"` = `...`

#### name

`string` = `...`

#### referencedIn

`object`[] = `...`

#### type

`"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"` = `DependencyTypeSchema`

#### url

`string` = `...`

## Returns

`Promise`\<\{ `dependencies`: `object`[]; `generatedAt`: `string`; `generatedBy`: \{ `action`: `string`; `llmModel?`: `string`; `llmProvider`: `string`; `version`: `string`; \}; `repository`: \{ `branch`: `string`; `commit`: `string`; `name`: `string`; `owner`: `string`; \}; `statistics`: \{ `averageConfidence`: `number`; `byAccessMethod`: `Record`\<`string`, `number`\>; `byDetectionMethod`: `Record`\<`string`, `number`\>; `byType`: `Record`\<`string`, `number`\>; `falsePositiveRate?`: `number`; `totalDependencies`: `number`; \}; `version`: `"1.0.0"`; \}\>
