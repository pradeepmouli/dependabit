[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockApiResponse

# Function: createMockApiResponse()

> **createMockApiResponse**(`overrides?`): `any`

Defined in: [fixtures.ts:59](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/test-utils/src/fixtures.ts#L59)

Creates mock API response for testing

## Parameters

### overrides?

`Partial`\<`any`\>

Partial response data to override defaults

## Returns

`any`

Mock API response

## Example

```ts
const response = createMockApiResponse({ status: 201 });
expect(response.status).toBe(201);
```
