# Types & Enums

## commits

### `CommitInfo`
**Properties:**
- `sha: string`
- `message: string`
- `author: { name: string; email?: string; date: string }`
- `url: string` (optional)

### `CommitFile`
**Properties:**
- `filename: string`
- `status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged"`
- `additions: number` (optional)
- `deletions: number` (optional)
- `changes: number` (optional)
- `patch: string` (optional)

### `CommitDiff`
**Properties:**
- `sha: string`
- `files: CommitFile[]`

### `ParsedFiles`
**Properties:**
- `added: string[]`
- `modified: string[]`
- `removed: string[]`

## auth

### `AuthType`
```ts
"token" | "oauth" | "basic"
```

### `AuthResult`
```ts
TokenAuth | OAuthAuth | BasicAuth
```

## issues

### `IssueData`
**Properties:**
- `owner: string`
- `repo: string`
- `title: string`
- `body: string`
- `severity: "breaking" | "major" | "minor"`
- `dependency: { id: string; url: string }`
- `assignee: string` (optional)

### `IssueResult`
**Properties:**
- `number: number`
- `url: string`
- `labels: string[]`
- `assignees: string[]` (optional)

### `UpdateIssueData`
**Properties:**
- `owner: string`
- `repo: string`
- `issueNumber: number`
- `body: string`
- `severity: "breaking" | "major" | "minor"` (optional)
- `append: boolean` (optional)

## releases

### `Release`
**Properties:**
- `tagName: string`
- `name: string`
- `publishedAt: Date`
- `body: string` (optional)
- `htmlUrl: string`
- `prerelease: boolean` (optional)
- `draft: boolean` (optional)

### `ReleaseComparison`
**Properties:**
- `newReleases: Release[]`
- `oldReleases: Release[]`

## GitHub Client

### `RateLimitInfo`
Rate limit snapshot for a single GitHub API category.
**Properties:**
- `limit: number`
- `remaining: number`
- `reset: Date`
- `used: number`
- `warning: string` (optional) — Present when remaining calls fall below 10 % of the total limit.

### `RateLimitStatus`
Aggregated rate limit status across GitHub's REST, search, and GraphQL
API categories.
**Properties:**
- `core: RateLimitInfo & { percentageRemaining: number }`
- `search: RateLimitInfo & { percentageRemaining: number }`
- `graphql: RateLimitInfo & { percentageRemaining: number }`

### `BudgetReservation`
Result of a budget reservation attempt via
RateLimitHandler.reserveBudget.
**Properties:**
- `reserved: boolean`
- `reason: string` (optional)
- `waitTime: number` (optional)

## feedback

### `FeedbackData`
**Properties:**
- `truePositives: { number: number; title: string; created_at?: string }[]`
- `falsePositives: { number: number; title: string; created_at?: string }[]`
- `total: number`

### `FeedbackRate`
**Properties:**
- `falsePositiveRate: number`
- `truePositiveRate: number`
- `totalFeedback: number`

## token

### `TokenAuth`
Token authentication handler for GitHub API
Supports GitHub PAT tokens, fine-grained tokens, and API keys
**Properties:**
- `type: "token"`
- `token: string`

## oauth

### `OAuthAuth`
**Properties:**
- `type: "oauth"`
- `token: string`
- `tokenType: string`
- `scope: string` (optional)
- `expiresIn: number` (optional)
- `refreshToken: string` (optional)

## basic

### `BasicAuth`
Basic authentication handler for GitHub API
Supports username/password or username/personal access token
**Properties:**
- `type: "basic"`
- `username: string`
- `password: string`
