[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / getCommitDiff

# Function: getCommitDiff()

> **getCommitDiff**(`client`, `owner`, `repo`, `sha`): `Promise`\<[`CommitDiff`](../interfaces/CommitDiff.md)\>

Defined in: [packages/github-client/src/commits.ts:90](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/github-client/src/commits.ts#L90)

Get detailed diff for a specific commit

## Parameters

### client

[`GitHubClient`](../classes/GitHubClient.md)

### owner

`string`

### repo

`string`

### sha

`string`

## Returns

`Promise`\<[`CommitDiff`](../interfaces/CommitDiff.md)\>
