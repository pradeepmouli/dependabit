[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / GitHubClient

# Class: GitHubClient

Defined in: [packages/github-client/src/client.ts:25](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L25)

GitHub API client wrapper with rate limit handling

## Constructors

### Constructor

> **new GitHubClient**(`config?`): `GitHubClient`

Defined in: [packages/github-client/src/client.ts:31](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L31)

#### Parameters

##### config?

[`GitHubClientConfig`](../interfaces/GitHubClientConfig.md) = `{}`

#### Returns

`GitHubClient`

## Methods

### checkRateLimit()

> **checkRateLimit**(): `Promise`\<`void`\>

Defined in: [packages/github-client/src/client.ts:60](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L60)

Check rate limit and throw if exceeded; log a warning when remaining is low.

#### Returns

`Promise`\<`void`\>

***

### getLastRateLimitCheck()

> **getLastRateLimitCheck**(): `RateLimitInfo` \| `undefined`

Defined in: [packages/github-client/src/client.ts:99](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L99)

Get last known rate limit info (cached)

#### Returns

`RateLimitInfo` \| `undefined`

***

### getOctokit()

> **getOctokit**(): `Octokit` & `object` & `paginateGraphQLInterface` & `Api` & `object`

Defined in: [packages/github-client/src/client.ts:92](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L92)

Get the underlying Octokit instance

#### Returns

`Octokit` & `object` & `paginateGraphQLInterface` & `Api` & `object`

***

### getRateLimit()

> **getRateLimit**(): `Promise`\<`RateLimitInfo`\>

Defined in: [packages/github-client/src/client.ts:42](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L42)

Get current rate limit status

#### Returns

`Promise`\<`RateLimitInfo`\>

***

### withRateLimit()

> **withRateLimit**\<`T`\>(`fn`): `Promise`\<`T`\>

Defined in: [packages/github-client/src/client.ts:84](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/client.ts#L84)

Execute a request with rate limit checking

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>
