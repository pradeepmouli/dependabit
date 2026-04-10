[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / StateComparator

# Class: StateComparator

Defined in: [monitor/src/comparator.ts:8](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/comparator.ts#L8)

## Constructors

### Constructor

> **new StateComparator**(): `StateComparator`

#### Returns

`StateComparator`

## Methods

### compare()

> **compare**(`oldState`, `newState`): [`ChangeDetection`](../interfaces/ChangeDetection.md)

Defined in: [monitor/src/comparator.ts:12](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/comparator.ts#L12)

Compares two dependency snapshots to detect changes

#### Parameters

##### oldState

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

##### newState

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

#### Returns

[`ChangeDetection`](../interfaces/ChangeDetection.md)
