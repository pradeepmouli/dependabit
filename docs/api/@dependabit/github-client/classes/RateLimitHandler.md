[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / RateLimitHandler

# Class: RateLimitHandler

Defined in: [packages/github-client/src/rate-limit.ts:28](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L28)

## Constructors

### Constructor

> **new RateLimitHandler**(`auth?`): `RateLimitHandler`

Defined in: [packages/github-client/src/rate-limit.ts:33](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L33)

#### Parameters

##### auth?

`string`

#### Returns

`RateLimitHandler`

## Methods

### calculateWaitTime()

> **calculateWaitTime**(`rateLimitInfo`): `number`

Defined in: [packages/github-client/src/rate-limit.ts:79](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L79)

Calculates wait time until rate limit resets

#### Parameters

##### rateLimitInfo

[`RateLimitInfo`](../interfaces/RateLimitInfo.md)

#### Returns

`number`

***

### canProceed()

> **canProceed**(`estimatedCalls`, `options?`): `Promise`\<\{ `canProceed`: `boolean`; `reason?`: `string`; \}\>

Defined in: [packages/github-client/src/rate-limit.ts:133](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L133)

Proactively check if operation can proceed without hitting rate limit

#### Parameters

##### estimatedCalls

`number`

##### options?

###### safetyMargin?

`number`

###### threshold?

`number`

#### Returns

`Promise`\<\{ `canProceed`: `boolean`; `reason?`: `string`; \}\>

***

### checkRateLimit()

> **checkRateLimit**(): `Promise`\<[`RateLimitInfo`](../interfaces/RateLimitInfo.md)\>

Defined in: [packages/github-client/src/rate-limit.ts:42](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L42)

Checks current rate limit status

#### Returns

`Promise`\<[`RateLimitInfo`](../interfaces/RateLimitInfo.md)\>

***

### getCachedStatus()

> **getCachedStatus**(): [`RateLimitStatus`](../interfaces/RateLimitStatus.md) \| `undefined`

Defined in: [packages/github-client/src/rate-limit.ts:200](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L200)

Gets cached rate limit status (avoids API call)

#### Returns

[`RateLimitStatus`](../interfaces/RateLimitStatus.md) \| `undefined`

***

### getRateLimitStatus()

> **getRateLimitStatus**(): `Promise`\<[`RateLimitStatus`](../interfaces/RateLimitStatus.md)\>

Defined in: [packages/github-client/src/rate-limit.ts:168](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L168)

Gets detailed rate limit status for all API categories

#### Returns

`Promise`\<[`RateLimitStatus`](../interfaces/RateLimitStatus.md)\>

***

### reserveBudget()

> **reserveBudget**(`callsNeeded`, `options?`): `Promise`\<[`BudgetReservation`](../interfaces/BudgetReservation.md)\>

Defined in: [packages/github-client/src/rate-limit.ts:94](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L94)

Attempts to reserve API call budget with proactive checking

#### Parameters

##### callsNeeded

`number`

##### options?

###### maxWaitTime?

`number`

###### safetyMargin?

`number`

#### Returns

`Promise`\<[`BudgetReservation`](../interfaces/BudgetReservation.md)\>

***

### waitIfNeeded()

> **waitIfNeeded**(): `Promise`\<`void`\>

Defined in: [packages/github-client/src/rate-limit.ts:64](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/rate-limit.ts#L64)

Waits if rate limited

#### Returns

`Promise`\<`void`\>
