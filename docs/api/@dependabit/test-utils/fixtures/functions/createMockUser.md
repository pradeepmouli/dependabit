[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockUser

# Function: createMockUser()

> **createMockUser**(`overrides?`): `any`

Defined in: [fixtures.ts:17](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/test-utils/src/fixtures.ts#L17)

Creates mock user data for testing

## Parameters

### overrides?

`Partial`\<`any`\>

Partial user data to override defaults

## Returns

`any`

Mock user object

## Example

```ts
const user = createMockUser({ name: 'John' });
expect(user.name).toBe('John');
expect(user.email).toBe('user@example.com');
```
