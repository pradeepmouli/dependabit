[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockUser

# Function: createMockUser()

> **createMockUser**(`overrides?`): `any`

Defined in: [fixtures.ts:17](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/test-utils/src/fixtures.ts#L17)

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
