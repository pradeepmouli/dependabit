# Functions

## client

### `createGitHubClient`
Create a GitHub client instance
```ts
createGitHubClient(config?: GitHubClientConfig): GitHubClient
```
**Parameters:**
- `config: GitHubClientConfig` (optional)
**Returns:** `GitHubClient`

## commits

### `fetchCommits`
Fetch commits from GitHub API
```ts
fetchCommits(client: GitHubClient, owner: string, repo: string, options: FetchCommitsOptions): Promise<CommitInfo[]>
```
**Parameters:**
- `client: GitHubClient`
- `owner: string`
- `repo: string`
- `options: FetchCommitsOptions` — default: `{}`
**Returns:** `Promise<CommitInfo[]>`

### `getCommitDiff`
Get detailed diff for a specific commit
```ts
getCommitDiff(client: GitHubClient, owner: string, repo: string, sha: string): Promise<CommitDiff>
```
**Parameters:**
- `client: GitHubClient`
- `owner: string`
- `repo: string`
- `sha: string`
**Returns:** `Promise<CommitDiff>`

### `parseCommitFiles`
Parse commit files into categorized lists
```ts
parseCommitFiles(files: CommitFile[]): ParsedFiles
```
**Parameters:**
- `files: CommitFile[]`
**Returns:** `ParsedFiles`

### `getCommitsBetween`
Get commits between two refs
```ts
getCommitsBetween(client: GitHubClient, owner: string, repo: string, base: string, head: string): Promise<CommitInfo[]>
```
**Parameters:**
- `client: GitHubClient`
- `owner: string`
- `repo: string`
- `base: string`
- `head: string`
**Returns:** `Promise<CommitInfo[]>`

## auth

### `createAuth`
Create authentication manager from config
```ts
createAuth(config: AuthConfig): AuthManager
```
**Parameters:**
- `config: AuthConfig`
**Returns:** `AuthManager`
