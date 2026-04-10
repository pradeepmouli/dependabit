[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [fixtures](../README.md) / createMockEmail

# Function: createMockEmail()

> **createMockEmail**(`overrides?`): `any`

Defined in: [fixtures.ts:37](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/test-utils/src/fixtures.ts#L37)

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
