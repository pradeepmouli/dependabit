[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/utils](../../README.md) / [array](../README.md) / groupBy

# Function: groupBy()

> **groupBy**\<`T`, `K`\>(`arr`, `keyFn`): `Record`\<`K`, `T`[]\>

Defined in: [array.ts:29](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/utils/src/array.ts#L29)

Groups array elements by a key function

## Type Parameters

### T

`T`

### K

`K` *extends* `string` \| `number`

## Parameters

### arr

`T`[]

The array to group

### keyFn

(`item`) => `K`

Function to determine group key

## Returns

`Record`\<`K`, `T`[]\>

Object with grouped elements

## Example

```ts
groupBy([1, 2, 3], n => n % 2); // { '0': [2], '1': [1, 3] }
```
