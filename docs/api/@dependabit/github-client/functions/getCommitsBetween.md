[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / getCommitsBetween

# Function: getCommitsBetween()

> **getCommitsBetween**(`client`, `owner`, `repo`, `base`, `head`): `Promise`\<[`CommitInfo`](../interfaces/CommitInfo.md)[]\>

Defined in: [packages/github-client/src/commits.ts:148](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/github-client/src/commits.ts#L148)

Get commits between two refs

## Parameters

### client

[`GitHubClient`](../classes/GitHubClient.md)

### owner

`string`

### repo

`string`

### base

`string`

### head

`string`

## Returns

`Promise`\<[`CommitInfo`](../interfaces/CommitInfo.md)[]\>
