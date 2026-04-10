[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / StateComparator

# Class: StateComparator

Defined in: [monitor/src/comparator.ts:8](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/monitor/src/comparator.ts#L8)

## Constructors

### Constructor

> **new StateComparator**(): `StateComparator`

#### Returns

`StateComparator`

## Methods

### compare()

> **compare**(`oldState`, `newState`): [`ChangeDetection`](../interfaces/ChangeDetection.md)

Defined in: [monitor/src/comparator.ts:12](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/monitor/src/comparator.ts#L12)

Compares two dependency snapshots to detect changes

#### Parameters

##### oldState

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

##### newState

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

#### Returns

[`ChangeDetection`](../interfaces/ChangeDetection.md)
