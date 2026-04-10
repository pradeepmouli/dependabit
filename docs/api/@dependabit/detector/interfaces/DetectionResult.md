[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / DetectionResult

# Interface: DetectionResult

Defined in: [detector/src/detector.ts:38](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/detector/src/detector.ts#L38)

## Properties

### dependencies

> **dependencies**: `object`[]

Defined in: [detector/src/detector.ts:39](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/detector/src/detector.ts#L39)

#### accessMethod

> **accessMethod**: `"arxiv"` \| `"context7"` \| `"github-api"` \| `"http"` \| `"openapi"`

#### auth?

> `optional` **auth?**: `object`

##### auth.secretEnvVar?

> `optional` **secretEnvVar?**: `string`

##### auth.type

> **type**: `"basic"` \| `"none"` \| `"oauth"` \| `"token"`

#### changeHistory

> **changeHistory**: `object`[]

#### currentStateHash

> **currentStateHash**: `string`

#### currentVersion?

> `optional` **currentVersion?**: `string`

#### description?

> `optional` **description?**: `string`

#### detectedAt

> **detectedAt**: `string`

#### detectionConfidence

> **detectionConfidence**: `number`

#### detectionMethod

> **detectionMethod**: `"code-comment"` \| `"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"`

#### id

> **id**: `string`

#### lastChanged?

> `optional` **lastChanged?**: `string`

#### lastChecked

> **lastChecked**: `string`

#### monitoring?

> `optional` **monitoring?**: `object`

##### monitoring.checkFrequency

> **checkFrequency**: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

##### monitoring.enabled

> **enabled**: `boolean`

##### monitoring.ignoreChanges

> **ignoreChanges**: `boolean`

##### monitoring.severityOverride?

> `optional` **severityOverride?**: `"breaking"` \| `"major"` \| `"minor"`

#### name

> **name**: `string`

#### referencedIn

> **referencedIn**: `object`[]

#### type

> **type**: `"reference-implementation"` \| `"schema"` \| `"documentation"` \| `"research-paper"` \| `"api-example"` \| `"other"`

#### url

> **url**: `string`

***

### statistics

> **statistics**: `object`

Defined in: [detector/src/detector.ts:40](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/detector/src/detector.ts#L40)

#### filesScanned

> **filesScanned**: `number`

#### llmCalls

> **llmCalls**: `number`

#### totalLatencyMs

> **totalLatencyMs**: `number`

#### totalTokens

> **totalTokens**: `number`

#### urlsFound

> **urlsFound**: `number`
