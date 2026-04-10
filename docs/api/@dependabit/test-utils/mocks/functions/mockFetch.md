[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / mockFetch

# Function: mockFetch()

> **mockFetch**(`url`, `response`): `void`

Defined in: [mocks.ts:67](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/mocks.ts#L67)

Mocks a fetch request

## Parameters

### url

`string`

URL to mock

### response

`any`

Response data

## Returns

`void`

## Example

```ts
mockFetch('/api/users', { success: true });
const res = await fetch('/api/users');
expect(res.json()).resolves.toEqual({ success: true });
```
