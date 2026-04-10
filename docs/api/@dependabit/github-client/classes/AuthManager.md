[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / AuthManager

# Class: AuthManager

Defined in: [packages/github-client/src/auth.ts:24](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L24)

Authentication manager that supports multiple auth methods

## Constructors

### Constructor

> **new AuthManager**(`config`): `AuthManager`

Defined in: [packages/github-client/src/auth.ts:27](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L27)

#### Parameters

##### config

[`AuthConfig`](../interfaces/AuthConfig.md)

#### Returns

`AuthManager`

## Methods

### authenticate()

> **authenticate**(`code?`): `Promise`\<[`AuthResult`](../type-aliases/AuthResult.md)\>

Defined in: [packages/github-client/src/auth.ts:58](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L58)

Perform authentication

#### Parameters

##### code?

`string`

#### Returns

`Promise`\<[`AuthResult`](../type-aliases/AuthResult.md)\>

***

### getHandler()

> **getHandler**(): [`TokenAuthHandler`](TokenAuthHandler.md) \| [`OAuthHandler`](OAuthHandler.md) \| [`BasicAuthHandler`](BasicAuthHandler.md)

Defined in: [packages/github-client/src/auth.ts:85](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L85)

Get underlying handler

#### Returns

[`TokenAuthHandler`](TokenAuthHandler.md) \| [`OAuthHandler`](OAuthHandler.md) \| [`BasicAuthHandler`](BasicAuthHandler.md)

***

### getType()

> **getType**(): `string`

Defined in: [packages/github-client/src/auth.ts:78](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L78)

Get authentication type

#### Returns

`string`

***

### validate()

> **validate**(): `boolean`

Defined in: [packages/github-client/src/auth.ts:71](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/auth.ts#L71)

Validate authentication configuration

#### Returns

`boolean`
