[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / fetchCommits

# Function: fetchCommits()

> **fetchCommits**(`client`, `owner`, `repo`, `options?`): `Promise`\<[`CommitInfo`](../interfaces/CommitInfo.md)[]\>

Defined in: [packages/github-client/src/commits.ts:51](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/commits.ts#L51)

Fetch commits from GitHub API

## Parameters

### client

[`GitHubClient`](../classes/GitHubClient.md)

### owner

`string`

### repo

`string`

### options?

[`FetchCommitsOptions`](../interfaces/FetchCommitsOptions.md) = `{}`

## Returns

`Promise`\<[`CommitInfo`](../interfaces/CommitInfo.md)[]\>
