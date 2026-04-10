[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockErrorResponse

# Function: createMockErrorResponse()

> **createMockErrorResponse**(`message?`): `any`

Defined in: [fixtures.ts:79](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/fixtures.ts#L79)

Creates mock error response for testing

## Parameters

### message?

`string` = `'Test error'`

Error message

## Returns

`any`

Mock error response

## Example

```ts
const error = createMockErrorResponse('Not found');
expect(error.success).toBe(false);
```
