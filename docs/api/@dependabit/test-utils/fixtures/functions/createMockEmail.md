[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockEmail

# Function: createMockEmail()

> **createMockEmail**(`overrides?`): `any`

Defined in: [fixtures.ts:37](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/test-utils/src/fixtures.ts#L37)

Creates mock email data for testing

## Parameters

### overrides?

`Partial`\<`any`\>

Partial email data to override defaults

## Returns

`any`

Mock email object

## Example

```ts
const email = createMockEmail({ to: 'john@example.com' });
expect(email.to).toBe('john@example.com');
```
