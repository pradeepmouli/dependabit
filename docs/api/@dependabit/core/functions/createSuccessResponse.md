[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/core](../README.md) / createSuccessResponse

# Function: createSuccessResponse()

> **createSuccessResponse**\<`T`\>(`data`): [`ApiResponse`](../interfaces/ApiResponse.md)\<`T`\>

Defined in: [index.ts:42](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/core/src/index.ts#L42)

Creates a successful API response

## Type Parameters

### T

`T`

## Parameters

### data

`T`

The response data

## Returns

[`ApiResponse`](../interfaces/ApiResponse.md)\<`T`\>

An API response with success=true

## Example

```ts
const response = createSuccessResponse({ id: 1, name: 'John' });
// { success: true, data: { id: 1, name: 'John' } }
```
