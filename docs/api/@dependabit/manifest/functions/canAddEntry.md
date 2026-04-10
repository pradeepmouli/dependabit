[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / canAddEntry

# Function: canAddEntry()

> **canAddEntry**(`currentManifest`, `newEntry`, `options?`): `object`

Defined in: [packages/manifest/src/size-check.ts:93](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/size-check.ts#L93)

Check if adding an entry would exceed limits

## Parameters

### currentManifest

`unknown`

### newEntry

`unknown`

### options?

[`SizeCheckOptions`](../interfaces/SizeCheckOptions.md)

## Returns

`object`

### canAdd

> **canAdd**: `boolean`

### currentSize

> **currentSize**: [`SizeCheckResult`](../interfaces/SizeCheckResult.md)

### estimatedSize

> **estimatedSize**: [`SizeCheckResult`](../interfaces/SizeCheckResult.md)
