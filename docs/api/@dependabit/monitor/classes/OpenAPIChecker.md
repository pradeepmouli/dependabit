[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / OpenAPIChecker

# Class: OpenAPIChecker

Defined in: [monitor/src/checkers/openapi.ts:65](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/monitor/src/checkers/openapi.ts#L65)

## Implements

- [`Checker`](../interfaces/Checker.md)

## Constructors

### Constructor

> **new OpenAPIChecker**(): `OpenAPIChecker`

#### Returns

`OpenAPIChecker`

## Methods

### compare()

> **compare**(`prev`, `curr`): `Promise`\<[`ChangeDetection`](../interfaces/ChangeDetection.md)\>

Defined in: [monitor/src/checkers/openapi.ts:185](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/monitor/src/checkers/openapi.ts#L185)

Compares two OpenAPI snapshots with semantic diffing

#### Parameters

##### prev

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

##### curr

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

#### Returns

`Promise`\<[`ChangeDetection`](../interfaces/ChangeDetection.md)\>

#### Implementation of

[`Checker`](../interfaces/Checker.md).[`compare`](../interfaces/Checker.md#compare)

***

### fetch()

> **fetch**(`config`): `Promise`\<[`DependencySnapshot`](../interfaces/DependencySnapshot.md)\>

Defined in: [monitor/src/checkers/openapi.ts:69](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/monitor/src/checkers/openapi.ts#L69)

Fetches and parses OpenAPI specification

#### Parameters

##### config

[`AccessConfig`](../interfaces/AccessConfig.md)

#### Returns

`Promise`\<[`DependencySnapshot`](../interfaces/DependencySnapshot.md)\>

#### Implementation of

[`Checker`](../interfaces/Checker.md).[`fetch`](../interfaces/Checker.md#fetch)
