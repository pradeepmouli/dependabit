[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / mockFetch

# Function: mockFetch()

> **mockFetch**(`url`, `response`): `void`

Defined in: [mocks.ts:67](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/test-utils/src/mocks.ts#L67)

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
