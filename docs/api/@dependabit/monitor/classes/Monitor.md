[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / Monitor

# Class: Monitor

Defined in: [monitor/src/monitor.ts:34](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L34)

@dependabit/monitor - Dependency change detection and monitoring

## Constructors

### Constructor

> **new Monitor**(): `Monitor`

Defined in: [monitor/src/monitor.ts:38](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L38)

#### Returns

`Monitor`

## Methods

### checkAll()

> **checkAll**(`dependencies`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)[]\>

Defined in: [monitor/src/monitor.ts:96](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L96)

Checks multiple dependencies, respecting monitoring rules

#### Parameters

##### dependencies

[`DependencyConfig`](../interfaces/DependencyConfig.md)[]

#### Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)[]\>

***

### checkDependency()

> **checkDependency**(`dependency`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

Defined in: [monitor/src/monitor.ts:50](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L50)

Checks a single dependency for changes

#### Parameters

##### dependency

[`DependencyConfig`](../interfaces/DependencyConfig.md)

#### Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

***

### registerChecker()

> **registerChecker**(`accessMethod`, `checker`): `void`

Defined in: [monitor/src/monitor.ts:117](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L117)

Registers a custom checker for an access method

#### Parameters

##### accessMethod

`string`

##### checker

[`Checker`](../interfaces/Checker.md)

#### Returns

`void`
