[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / SeverityClassifier

# Class: SeverityClassifier

Defined in: [monitor/src/severity.ts:10](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/monitor/src/severity.ts#L10)

## Constructors

### Constructor

> **new SeverityClassifier**(): `SeverityClassifier`

#### Returns

`SeverityClassifier`

## Methods

### classify()

> **classify**(`changes`): [`Severity`](../type-aliases/Severity.md)

Defined in: [monitor/src/severity.ts:14](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/monitor/src/severity.ts#L14)

Classifies the severity of a change based on version changes and change types

#### Parameters

##### changes

[`ChangeDetection`](../interfaces/ChangeDetection.md)

#### Returns

[`Severity`](../type-aliases/Severity.md)
