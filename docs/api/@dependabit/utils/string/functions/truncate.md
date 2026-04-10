[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/utils](../../README.md) / [string](../README.md) / truncate

# Function: truncate()

> **truncate**(`str`, `maxLength`, `suffix?`): `string`

Defined in: [string.ts:60](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/utils/src/string.ts#L60)

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
