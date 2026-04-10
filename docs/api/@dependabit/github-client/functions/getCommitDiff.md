[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / getCommitDiff

# Function: getCommitDiff()

> **getCommitDiff**(`client`, `owner`, `repo`, `sha`): `Promise`\<[`CommitDiff`](../interfaces/CommitDiff.md)\>

Defined in: [packages/github-client/src/commits.ts:90](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/commits.ts#L90)

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
