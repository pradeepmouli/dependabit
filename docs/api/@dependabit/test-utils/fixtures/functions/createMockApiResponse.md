[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockApiResponse

# Function: createMockApiResponse()

> **createMockApiResponse**(`overrides?`): `any`

Defined in: [fixtures.ts:59](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/fixtures.ts#L59)

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
