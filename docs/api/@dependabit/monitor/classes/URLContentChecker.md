[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / URLContentChecker

# Class: URLContentChecker

Defined in: [monitor/src/checkers/url-content.ts:10](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/checkers/url-content.ts#L10)

## Implements

- [`Checker`](../interfaces/Checker.md)

## Constructors

### Constructor

> **new URLContentChecker**(): `URLContentChecker`

#### Returns

`URLContentChecker`

## Methods

### compare()

> **compare**(`prev`, `curr`): `Promise`\<[`ChangeDetection`](../interfaces/ChangeDetection.md)\>

Defined in: [monitor/src/checkers/url-content.ts:65](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/checkers/url-content.ts#L65)

Compares two snapshots to detect content changes

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

Defined in: [monitor/src/checkers/url-content.ts:14](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/checkers/url-content.ts#L14)

Fetches and hashes URL content

#### Parameters

##### config

[`AccessConfig`](../interfaces/AccessConfig.md)

#### Returns

`Promise`\<[`DependencySnapshot`](../interfaces/DependencySnapshot.md)\>

#### Implementation of

[`Checker`](../interfaces/Checker.md).[`fetch`](../interfaces/Checker.md#fetch)
