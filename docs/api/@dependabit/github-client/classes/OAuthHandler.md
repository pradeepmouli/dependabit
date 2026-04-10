[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / OAuthHandler

# Class: OAuthHandler

Defined in: [packages/github-client/src/auth/oauth.ts:32](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L32)

Handler for OAuth 2.0 authentication

## Constructors

### Constructor

> **new OAuthHandler**(`config`): `OAuthHandler`

Defined in: [packages/github-client/src/auth/oauth.ts:36](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L36)

#### Parameters

##### config

[`OAuthConfig`](../interfaces/OAuthConfig.md)

#### Returns

`OAuthHandler`

## Methods

### authenticate()

> **authenticate**(`code`): `Promise`\<[`OAuthAuth`](../interfaces/OAuthAuth.md)\>

Defined in: [packages/github-client/src/auth/oauth.ts:49](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L49)

Exchange authorization code for access token

#### Parameters

##### code

`string`

#### Returns

`Promise`\<[`OAuthAuth`](../interfaces/OAuthAuth.md)\>

***

### getAuthorizationUrl()

> **getAuthorizationUrl**(`scopes`, `state?`): `string`

Defined in: [packages/github-client/src/auth/oauth.ts:69](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L69)

Generate authorization URL for OAuth flow

#### Parameters

##### scopes

`string`[]

##### state?

`string`

#### Returns

`string`

***

### getType()

> **getType**(): `string`

Defined in: [packages/github-client/src/auth/oauth.ts:118](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L118)

Get authentication type

#### Returns

`string`

***

### refreshToken()

> **refreshToken**(`refreshToken`): `Promise`\<[`OAuthAuth`](../interfaces/OAuthAuth.md)\>

Defined in: [packages/github-client/src/auth/oauth.ts:86](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L86)

Refresh an expired access token

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<[`OAuthAuth`](../interfaces/OAuthAuth.md)\>

***

### validate()

> **validate**(): `boolean`

Defined in: [packages/github-client/src/auth/oauth.ts:105](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/auth/oauth.ts#L105)

Validate OAuth configuration

#### Returns

`boolean`
