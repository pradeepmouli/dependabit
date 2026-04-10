[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/core](../README.md) / createErrorResponse

# Function: createErrorResponse()

> **createErrorResponse**(`error`): [`ApiResponse`](../interfaces/ApiResponse.md)\<`never`\>

Defined in: [index.ts:59](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/core/src/index.ts#L59)

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
