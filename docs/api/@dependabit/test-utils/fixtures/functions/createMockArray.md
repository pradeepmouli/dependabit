[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockArray

# Function: createMockArray()

> **createMockArray**\<`T`\>(`count`, `factory`): `T`[]

Defined in: [fixtures.ts:99](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/fixtures.ts#L99)

Creates an array of mock items

## Type Parameters

### T

`T`

## Parameters

### count

`number`

Number of items to create

### factory

(`index`) => `T`

Function to create individual items

## Returns

`T`[]

Array of mock items

## Example

```ts
const users = createMockArray(5, (i) => ({ id: i, name: `User${i}` }));
expect(users).toHaveLength(5);
```
