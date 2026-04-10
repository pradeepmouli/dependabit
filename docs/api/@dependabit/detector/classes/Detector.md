[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / Detector

# Class: Detector

Defined in: [detector/src/detector.ts:65](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/detector.ts#L65)

Main detector class

## Constructors

### Constructor

> **new Detector**(`options`): `Detector`

Defined in: [detector/src/detector.ts:71](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/detector.ts#L71)

#### Parameters

##### options

[`DetectorOptions`](../interfaces/DetectorOptions.md)

#### Returns

`Detector`

## Methods

### analyzeFiles()

> **analyzeFiles**(`filePaths`): `Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Defined in: [detector/src/detector.ts:836](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/detector.ts#L836)

Analyze only specific files for dependencies (for incremental updates)
This is more efficient than full repository scan when only few files changed

#### Parameters

##### filePaths

`string`[]

#### Returns

`Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

***

### detectDependencies()

> **detectDependencies**(): `Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>

Defined in: [detector/src/detector.ts:115](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/detector.ts#L115)

Detect all external dependencies in the repository

Implementation follows a hybrid approach:
1. Programmatic parsing of repository files (README, code comments, package files)
2. LLM analysis only for documents not fully parsed in step 1 (future enhancement)
3. Programmatic type categorization based on URL patterns and context
4. LLM fallback for uncategorized dependencies
5. Programmatic access method determination based on URL patterns
6. LLM fallback for access methods that can't be determined (future enhancement)
7. Manifest entry creation with references and versioning

#### Returns

`Promise`\<[`DetectionResult`](../interfaces/DetectionResult.md)\>
