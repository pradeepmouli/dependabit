[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockFn

# Function: createMockFn()

> **createMockFn**(): `Mock`\<`Procedure` \| `Constructable`\>

Defined in: [mocks.ts:16](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/test-utils/src/mocks.ts#L16)

Creates a mock function

## Returns

`Mock`\<`Procedure` \| `Constructable`\>

## Example

```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```
