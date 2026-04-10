[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/core](../README.md) / createErrorResponse

# Function: createErrorResponse()

> **createErrorResponse**(`error`): [`ApiResponse`](../interfaces/ApiResponse.md)\<`never`\>

Defined in: [index.ts:59](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/core/src/index.ts#L59)

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
