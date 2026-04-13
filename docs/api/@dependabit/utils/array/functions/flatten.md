[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/utils](../../README.md) / [array](../README.md) / flatten

# Function: flatten()

> **flatten**\<`T`\>(`arr`, `depth?`): `T`[]

Defined in: [array.ts:54](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/utils/src/array.ts#L54)

Flattens a nested array

## Type Parameters

### T

`T`

## Parameters

### arr

(`T` \| `T`[])[]

The array to flatten

### depth?

`number` = `1`

Depth to flatten (default: 1)

## Returns

`T`[]

Flattened array

## Example

```ts
flatten([[1, 2], [3, [4, 5]]], 1); // [1, 2, 3, [4, 5]]
```
