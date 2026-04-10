[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / SeverityClassifier

# Class: SeverityClassifier

Defined in: [monitor/src/severity.ts:10](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/severity.ts#L10)

## Constructors

### Constructor

> **new SeverityClassifier**(): `SeverityClassifier`

#### Returns

`SeverityClassifier`

## Methods

### classify()

> **classify**(`changes`): [`Severity`](../type-aliases/Severity.md)

Defined in: [monitor/src/severity.ts:14](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/severity.ts#L14)

Classifies the severity of a change based on version changes and change types

#### Parameters

##### changes

[`ChangeDetection`](../interfaces/ChangeDetection.md)

#### Returns

[`Severity`](../type-aliases/Severity.md)
