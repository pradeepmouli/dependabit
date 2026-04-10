[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/action](../README.md) / Logger

# Class: Logger

Defined in: [logger.ts:36](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L36)

Structured JSON logger for GitHub Actions

## Constructors

### Constructor

> **new Logger**(`config?`): `Logger`

Defined in: [logger.ts:41](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L41)

#### Parameters

##### config?

[`LoggerConfig`](../interfaces/LoggerConfig.md) = `{}`

#### Returns

`Logger`

## Methods

### child()

> **child**(`context?`): `Logger`

Defined in: [logger.ts:124](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L124)

Create a child logger with the same correlation ID

#### Parameters

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`Logger`

***

### debug()

> **debug**(`message`, `data?`): `void`

Defined in: [logger.ts:73](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L73)

Log debug message

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### endGroup()

> **endGroup**(): `void`

Defined in: [logger.ts:110](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L110)

End a log group

#### Returns

`void`

***

### error()

> **error**(`message`, `data?`): `void`

Defined in: [logger.ts:96](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L96)

Log error message

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### getCorrelationId()

> **getCorrelationId**(): `string`

Defined in: [logger.ts:117](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L117)

Get correlation ID

#### Returns

`string`

***

### info()

> **info**(`message`, `data?`): `void`

Defined in: [logger.ts:82](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L82)

Log info message

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### logAPICall()

> **logAPICall**(`data`): `void`

Defined in: [logger.ts:152](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L152)

Log API call

#### Parameters

##### data

###### endpoint

`string`

###### latencyMs?

`number`

###### method

`string`

###### rateLimit?

\{ `limit`: `number`; `remaining`: `number`; `reset`: `number`; \}

###### rateLimit.limit

`number`

###### rateLimit.remaining

`number`

###### rateLimit.reset

`number`

###### statusCode?

`number`

#### Returns

`void`

***

### logDuration()

> **logDuration**(`operation`, `durationMs`, `data?`): `void`

Defined in: [logger.ts:172](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L172)

Log operation duration

#### Parameters

##### operation

`string`

##### durationMs

`number`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### logLLMInteraction()

> **logLLMInteraction**(`data`): `void`

Defined in: [logger.ts:135](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L135)

Log LLM interaction

#### Parameters

##### data

###### latencyMs?

`number`

###### model?

`string`

###### prompt

`string`

###### provider

`string`

###### response

`string`

###### tokens?

`number`

#### Returns

`void`

***

### startGroup()

> **startGroup**(`name`): `void`

Defined in: [logger.ts:103](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L103)

Start a log group

#### Parameters

##### name

`string`

#### Returns

`void`

***

### warning()

> **warning**(`message`, `data?`): `void`

Defined in: [logger.ts:89](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/action/src/logger.ts#L89)

Log warning message

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`
