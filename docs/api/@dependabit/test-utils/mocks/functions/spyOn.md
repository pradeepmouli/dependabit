[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / spyOn

# Function: spyOn()

> **spyOn**\<`T`, `K`\>(`obj`, `method`): `any`

Defined in: [mocks.ts:31](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/test-utils/src/mocks.ts#L31)

Creates a spy on a method

## Type Parameters

### T

`T` *extends* `object`

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### obj

`T`

Object to spy on

### method

`K`

Method name

## Returns

`any`

## Example

```ts
const consoleSpy = spyOn(console, 'log');
console.log('test');
expect(consoleSpy).toHaveBeenCalledWith('test');
```
