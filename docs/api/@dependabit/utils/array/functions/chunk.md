[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/utils](../../README.md) / [array](../README.md) / chunk

# Function: chunk()

> **chunk**\<`T`\>(`arr`, `size`): `T`[][]

Defined in: [array.ts:71](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/utils/src/array.ts#L71)

Chunks an array into smaller arrays

## Type Parameters

### T

`T`

## Parameters

### arr

`T`[]

The array to chunk

### size

`number`

Size of each chunk

## Returns

`T`[][]

Array of chunks

## Example

```ts
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```
