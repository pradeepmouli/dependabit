[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/utils](../../README.md) / [string](../README.md) / truncate

# Function: truncate()

> **truncate**(`str`, `maxLength`, `suffix?`): `string`

Defined in: [string.ts:60](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/utils/src/string.ts#L60)

Truncates a string to a maximum length

## Parameters

### str

`string`

The string to truncate

### maxLength

`number`

Maximum length

### suffix?

`string` = `'...'`

Suffix to add if truncated (default: '...')

## Returns

`string`

The truncated string

## Example

```ts
truncate('Hello World', 8); // 'Hello...'
```
