[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / Checker

# Interface: Checker

Defined in: [monitor/src/types.ts:30](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L30)

## Methods

### compare()

> **compare**(`prev`, `curr`): `Promise`\<[`ChangeDetection`](ChangeDetection.md)\>

Defined in: [monitor/src/types.ts:39](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L39)

Compares two snapshots to detect changes

#### Parameters

##### prev

[`DependencySnapshot`](DependencySnapshot.md)

##### curr

[`DependencySnapshot`](DependencySnapshot.md)

#### Returns

`Promise`\<[`ChangeDetection`](ChangeDetection.md)\>

***

### fetch()

> **fetch**(`config`): `Promise`\<[`DependencySnapshot`](DependencySnapshot.md)\>

Defined in: [monitor/src/types.ts:34](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L34)

Fetches the current state of a dependency

#### Parameters

##### config

[`AccessConfig`](AccessConfig.md)

#### Returns

`Promise`\<[`DependencySnapshot`](DependencySnapshot.md)\>
