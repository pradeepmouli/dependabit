[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / BasicAuthHandler

# Class: BasicAuthHandler

Defined in: [packages/github-client/src/auth/basic.ts:15](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L15)

Handler for HTTP Basic authentication

## Constructors

### Constructor

> **new BasicAuthHandler**(`username`, `password`): `BasicAuthHandler`

Defined in: [packages/github-client/src/auth/basic.ts:19](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L19)

#### Parameters

##### username

`string`

##### password

`string`

#### Returns

`BasicAuthHandler`

## Methods

### authenticate()

> **authenticate**(): `Promise`\<[`BasicAuth`](../interfaces/BasicAuth.md)\>

Defined in: [packages/github-client/src/auth/basic.ts:33](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L33)

Authenticate and return auth object

#### Returns

`Promise`\<[`BasicAuth`](../interfaces/BasicAuth.md)\>

***

### getAuthHeader()

> **getAuthHeader**(): `string`

Defined in: [packages/github-client/src/auth/basic.ts:44](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L44)

Get base64-encoded Basic auth header value

#### Returns

`string`

***

### getType()

> **getType**(): `string`

Defined in: [packages/github-client/src/auth/basic.ts:67](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L67)

Get authentication type

#### Returns

`string`

***

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [packages/github-client/src/auth/basic.ts:95](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L95)

JSON representation (excludes password)

#### Returns

`Record`\<`string`, `unknown`\>

***

### toString()

> **toString**(): `string`

Defined in: [packages/github-client/src/auth/basic.ts:88](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L88)

String representation (masks password)

#### Returns

`string`

***

### updateCredentials()

> **updateCredentials**(`username`, `password`): `void`

Defined in: [packages/github-client/src/auth/basic.ts:74](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L74)

Update credentials (for rotation)

#### Parameters

##### username

`string`

##### password

`string`

#### Returns

`void`

***

### validate()

> **validate**(): `boolean`

Defined in: [packages/github-client/src/auth/basic.ts:53](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/auth/basic.ts#L53)

Validate credentials format

#### Returns

`boolean`
