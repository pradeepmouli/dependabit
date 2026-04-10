[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockFn

# Function: createMockFn()

> **createMockFn**(): `Mock`\<`Procedure` \| `Constructable`\>

Defined in: [mocks.ts:16](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/test-utils/src/mocks.ts#L16)

Creates a mock function

## Returns

`Mock`\<`Procedure` \| `Constructable`\>

## Example

```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```
