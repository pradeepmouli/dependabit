[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / TokenAuthHandler

# Class: TokenAuthHandler

Defined in: [packages/github-client/src/auth/token.ts:14](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L14)

Handler for token-based authentication (GitHub PAT, API keys)

## Constructors

### Constructor

> **new TokenAuthHandler**(`token`): `TokenAuthHandler`

Defined in: [packages/github-client/src/auth/token.ts:25](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L25)

#### Parameters

##### token

`string`

#### Returns

`TokenAuthHandler`

## Methods

### authenticate()

> **authenticate**(): `Promise`\<[`TokenAuth`](../interfaces/TokenAuth.md)\>

Defined in: [packages/github-client/src/auth/token.ts:35](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L35)

Authenticate and return auth object

#### Returns

`Promise`\<[`TokenAuth`](../interfaces/TokenAuth.md)\>

***

### getToken()

> **getToken**(): `string`

Defined in: [packages/github-client/src/auth/token.ts:78](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L78)

Get current token

#### Returns

`string`

#### Warning

This method exposes the raw token value. Use with caution and avoid
logging or displaying the token. Prefer using authenticate() for auth operations.

***

### getType()

> **getType**(): `string`

Defined in: [packages/github-client/src/auth/token.ts:58](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L58)

Get authentication type

#### Returns

`string`

***

### updateToken()

> **updateToken**(`newToken`): `void`

Defined in: [packages/github-client/src/auth/token.ts:65](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L65)

Update token (for rotation)

#### Parameters

##### newToken

`string`

#### Returns

`void`

***

### validate()

> **validate**(): `boolean`

Defined in: [packages/github-client/src/auth/token.ts:45](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/token.ts#L45)

Validate token format

#### Returns

`boolean`
