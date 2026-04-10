[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockFn

# Function: createMockFn()

> **createMockFn**(): `Mock`\<`Procedure` \| `Constructable`\>

Defined in: [mocks.ts:16](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/test-utils/src/mocks.ts#L16)

Creates a mock function

## Returns

`Mock`\<`Procedure` \| `Constructable`\>

## Example

```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```
