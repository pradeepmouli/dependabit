[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockApiResponse

# Function: createMockApiResponse()

> **createMockApiResponse**(`overrides?`): `any`

Defined in: [fixtures.ts:59](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/test-utils/src/fixtures.ts#L59)

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
