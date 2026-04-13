[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockFn

# Function: createMockFn()

> **createMockFn**(): `Mock`\<`Procedure` \| `Constructable`\>

Defined in: [mocks.ts:16](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/test-utils/src/mocks.ts#L16)

Creates a mock function

## Returns

`Mock`\<`Procedure` \| `Constructable`\>

## Example

```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```
