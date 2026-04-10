[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/core](../README.md) / createErrorResponse

# Function: createErrorResponse()

> **createErrorResponse**(`error`): [`ApiResponse`](../interfaces/ApiResponse.md)\<`never`\>

Defined in: [index.ts:59](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/core/src/index.ts#L59)

Creates an error API response

## Parameters

### error

`string`

The error message

## Returns

[`ApiResponse`](../interfaces/ApiResponse.md)\<`never`\>

An API response with success=false

## Example

```ts
const response = createErrorResponse('Not found');
// { success: false, error: 'Not found' }
```
