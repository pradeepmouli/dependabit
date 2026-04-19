# Classes

## GitHub Client

### `GitHubClient`
Thin wrapper around Octokit that adds proactive rate-limit checking.
```ts
constructor(config: GitHubClientConfig): GitHubClient
```
**Methods:**
- `getRateLimit(): Promise<RateLimitInfo>` — Get current rate limit status
- `checkRateLimit(): Promise<void>` — Check rate limit and throw if exceeded; log a warning when remaining is low.
- `withRateLimit<T>(fn: () => Promise<T>): Promise<T>` — Execute a request with rate limit checking
- `getOctokit(): Octokit & { paginate: PaginateInterface } & paginateGraphQLInterface & Api & { retry: { retryRequest: (error: RequestError, retries: number, retryAfter: number) => RequestError } }` — Get the underlying Octokit instance
- `getLastRateLimitCheck(): RateLimitInfo | undefined` — Get last known rate limit info (cached)
```ts
import { GitHubClient } from '@dependabit/github-client';

const client = new GitHubClient({ auth: process.env.GITHUB_TOKEN });
const octokit = client.getOctokit();
const { data } = await octokit.rest.repos.get({ owner: 'my-org', repo: 'my-repo' });
```

### `RateLimitHandler`
Manages GitHub API rate limits and provides budget-reservation utilities
for batch operations.
```ts
constructor(auth?: string): RateLimitHandler
```
**Methods:**
- `checkRateLimit(): Promise<RateLimitInfo>` — Checks current rate limit status
- `waitIfNeeded(): Promise<void>` — Waits if rate limited
- `calculateWaitTime(rateLimitInfo: RateLimitInfo): number` — Calculates wait time until rate limit resets
- `reserveBudget(callsNeeded: number, options?: { safetyMargin?: number; maxWaitTime?: number }): Promise<BudgetReservation>` — Attempts to reserve API call budget with proactive checking
- `canProceed(estimatedCalls: number, options?: { threshold?: number; safetyMargin?: number }): Promise<{ canProceed: boolean; reason?: string }>` — Proactively check if operation can proceed without hitting rate limit
- `getRateLimitStatus(): Promise<RateLimitStatus>` — Gets detailed rate limit status for all API categories
- `getCachedStatus(): RateLimitStatus | undefined` — Gets cached rate limit status (avoids API call)

## auth

### `AuthManager`
Authentication manager that supports multiple auth methods
```ts
constructor(config: AuthConfig): AuthManager
```
**Methods:**
- `authenticate(code?: string): Promise<AuthResult>` — Perform authentication
- `validate(): boolean` — Validate authentication configuration
- `getType(): string` — Get authentication type
- `getHandler(): TokenAuthHandler | OAuthHandler | BasicAuthHandler` — Get underlying handler

## issues

### `IssueManager`
```ts
constructor(auth?: string): IssueManager
```
**Methods:**
- `createIssue(data: IssueData): Promise<IssueResult>` — Creates a new issue for a dependency change
- `findExistingIssue(params: { owner: string; repo: string; dependencyId: string }): Promise<IssueResult | null>` — Finds an existing issue for a dependency
- `updateIssue(data: UpdateIssueData): Promise<IssueResult>` — Updates an existing issue

## releases

### `ReleaseManager`
```ts
constructor(auth?: string): ReleaseManager
```
**Methods:**
- `getLatestRelease(params: { owner: string; repo: string }): Promise<Release | null>` — Fetches the latest release from a repository
- `getAllReleases(params: { owner: string; repo: string; page?: number; perPage?: number }): Promise<Release[]>` — Fetches all releases from a repository
- `compareReleases(oldReleases: Release[], newReleases: Release[]): ReleaseComparison` — Compares two sets of releases to find new ones
- `getReleaseByTag(params: { owner: string; repo: string; tag: string }): Promise<Release | null>` — Fetches release notes for a specific tag

## feedback

### `FeedbackListener`
Listener that monitors issue labels for false positive feedback
```ts
constructor(issueManager: IssueManagerInterface, config: FeedbackConfig): FeedbackListener
```
**Methods:**
- `collectFeedback(options: CollectOptions): Promise<FeedbackData>` — Collect feedback from issues with feedback labels
- `getFeedbackRate(options: CollectOptions): Promise<FeedbackRate>` — Calculate false positive rate from collected feedback
- `getRecentFeedback(days: number, referenceDate?: Date): Promise<FeedbackData>` — Get feedback from recent time window (e.g., last 30 days)
- `monitorIssue(issueNumber: number): Promise<boolean>` — Check if a specific issue has feedback label

## token

### `TokenAuthHandler`
Handler for token-based authentication (GitHub PAT, API keys)
```ts
constructor(token: string): TokenAuthHandler
```
**Methods:**
- `authenticate(): Promise<TokenAuth>` — Authenticate and return auth object
- `validate(): boolean` — Validate token format
- `getType(): string` — Get authentication type
- `updateToken(newToken: string): void` — Update token (for rotation)
- `getToken(): string` — Get current token

## oauth

### `OAuthHandler`
Handler for OAuth 2.0 authentication
```ts
constructor(config: OAuthConfig): OAuthHandler
```
**Methods:**
- `authenticate(code: string): Promise<OAuthAuth>` — Exchange authorization code for access token
- `getAuthorizationUrl(scopes: string[], state?: string): string` — Generate authorization URL for OAuth flow
- `refreshToken(refreshToken: string): Promise<OAuthAuth>` — Refresh an expired access token
- `validate(): boolean` — Validate OAuth configuration
- `getType(): string` — Get authentication type

## basic

### `BasicAuthHandler`
Handler for HTTP Basic authentication
```ts
constructor(username: string, password: string): BasicAuthHandler
```
**Methods:**
- `authenticate(): Promise<BasicAuth>` — Authenticate and return auth object
- `getAuthHeader(): string` — Get base64-encoded Basic auth header value
- `validate(): boolean` — Validate credentials format
- `getType(): string` — Get authentication type
- `updateCredentials(username: string, password: string): void` — Update credentials (for rotation)
- `toString(): string` — String representation (masks password)
- `toJSON(): Record<string, unknown>` — JSON representation (excludes password)
