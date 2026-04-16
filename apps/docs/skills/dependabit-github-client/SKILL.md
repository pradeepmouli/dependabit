---
name: dependabit-github-client
description: Documentation site for dependabit
---

# @dependabit/github-client

Documentation site for dependabit

## When to Use

- API surface: 6 functions, 9 classes, 19 types

## Configuration

### GitHubClientConfig

Configuration for the GitHubClient wrapper.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `auth` | `string` | no | — |  |
| `rateLimitWarningThreshold` | `number` | no | — |  |
| `rateLimitMinRemaining` | `number` | no | — |  |

**Pitfalls:**
- **Fine-grained vs. classic tokens**: fine-grained personal access tokens
- restrict API access to selected repositories and scopes.  Some endpoints
- (e.g. `rateLimit.get()`) are available to unauthenticated requests, but
- commit and issue APIs require the appropriate scope.  A missing scope
- surfaces as a `403 Forbidden`, not a `401 Unauthorized`.
- **Unauthenticated requests**: omitting `auth` allows unauthenticated
- requests with a shared rate limit of 60 req/h per IP.  For CI
- environments with multiple jobs sharing an IP this can exhaust quickly.

### FetchCommitsOptions

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `since` | `string` | no | — |  |
| `until` | `string` | no | — |  |
| `sha` | `string` | no | — |  |
| `path` | `string` | no | — |  |
| `per_page` | `number` | no | — |  |
| `page` | `number` | no | — |  |

### AuthConfig

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | `AuthType` | yes | — |  |
| `token` | `string` | no | — |  |
| `oauth` | `OAuthConfig` | no | — |  |
| `username` | `string` | no | — |  |
| `password` | `string` | no | — |  |

### FeedbackConfig

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `truePositiveLabel` | `string` | no | — |  |
| `falsePositiveLabel` | `string` | no | — |  |

### OAuthConfig

OAuth 2.0 authentication handler for GitHub
Supports authorization code flow and token refresh

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `clientId` | `string` | yes | — |  |
| `clientSecret` | `string` | yes | — |  |
| `redirectUri` | `string` | yes | — |  |

## Quick Reference

**client:** `createGitHubClient`
**commits:** `fetchCommits`, `getCommitDiff`, `parseCommitFiles`, `getCommitsBetween`, `CommitInfo`, `CommitFile`, `CommitDiff`, `ParsedFiles`
**auth:** `createAuth`, `AuthManager`, `AuthType`, `AuthResult`
**GitHub Client:** `GitHubClient`, `RateLimitHandler`, `RateLimitInfo`, `RateLimitStatus`, `BudgetReservation`
**issues:** `IssueManager`, `IssueData`, `IssueResult`, `UpdateIssueData`
**releases:** `ReleaseManager`, `Release`, `ReleaseComparison`
**feedback:** `FeedbackListener`, `FeedbackData`, `FeedbackRate`
**token:** `TokenAuthHandler`, `TokenAuth`
**oauth:** `OAuthHandler`, `OAuthAuth`
**basic:** `BasicAuthHandler`, `BasicAuth`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)