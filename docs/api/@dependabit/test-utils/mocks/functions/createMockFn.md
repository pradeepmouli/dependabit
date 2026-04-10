[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockFn

# Function: createMockFn()

> **createMockFn**(): `Mock`\<`Procedure` \| `Constructable`\>

Defined in: [mocks.ts:16](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/mocks.ts#L16)

Creates a mock function

## Returns

`Mock`\<`Procedure` \| `Constructable`\>

## Example

```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```
