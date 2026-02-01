# @dependabit/github-client

Comprehensive GitHub API wrapper with authentication, rate limiting, and false positive tracking.

## Overview

This package provides a robust wrapper around the GitHub API with built-in rate limiting, multiple authentication strategies, and specialized features for dependency tracking workflows.

## Features

- **Rate Limiting**: Automatic rate limit handling with budget reservation
- **Authentication**: Token, OAuth, and Basic auth support
- **Issue Management**: Create, update, and track dependency issues
- **Release Monitoring**: Fetch and compare releases
- **Commit Tracking**: Retrieve commit history and changes
- **Feedback Collection**: Monitor false positive feedback via issue labels
- **Proactive Quota Management**: Reserve API calls before execution

## Installation

```bash
pnpm add @dependabit/github-client
```

## Usage

### Basic Client

```typescript
import { createGitHubClient } from '@dependabit/github-client';

const client = createGitHubClient({
  auth: process.env.GITHUB_TOKEN,
  rateLimitWarningThreshold: 100,
  rateLimitMinRemaining: 10
});

// Use with rate limit checking
await client.withRateLimit(async () => {
  // Your API calls here
});
```

### Authentication

#### Token Authentication
```typescript
import { TokenAuthHandler } from '@dependabit/github-client';

const tokenAuth = new TokenAuthHandler('ghp_yourtoken');
const auth = await tokenAuth.authenticate();
// { type: 'token', token: 'ghp_yourtoken' }
```

#### OAuth Authentication
```typescript
import { OAuthHandler } from '@dependabit/github-client';

const oauth = new OAuthHandler({
  clientId: 'your_client_id',
  clientSecret: 'your_secret',
  redirectUri: 'http://localhost:3000/callback'
});

// Get authorization URL
const authUrl = oauth.getAuthorizationUrl(['repo', 'user']);

// Exchange code for token
const auth = await oauth.authenticate(authorizationCode);
```

#### Basic Authentication
```typescript
import { BasicAuthHandler } from '@dependabit/github-client';

const basicAuth = new BasicAuthHandler('username', 'password');
const auth = await basicAuth.authenticate();
```

### Rate Limit Management

```typescript
import { RateLimitHandler } from '@dependabit/github-client';

const rateLimit = new RateLimitHandler(token);

// Check current rate limit
const info = await rateLimit.checkRateLimit();
console.log(`${info.remaining}/${info.limit} requests remaining`);

// Reserve budget before operations
const reservation = await rateLimit.reserveBudget(50, {
  safetyMargin: 10,
  maxWaitTime: 60000
});

if (!reservation.reserved) {
  console.log(`Cannot proceed: ${reservation.reason}`);
}

// Proactive checking
const canProceed = await rateLimit.canProceed(100, {
  threshold: 50,
  safetyMargin: 20
});
```

### Issue Management

```typescript
import { IssueManager } from '@dependabit/github-client';

const issues = new IssueManager(token);

// Create issue for dependency update
const issue = await issues.createIssue({
  owner: 'user',
  repo: 'project',
  title: 'Update dependency X',
  body: 'New version available',
  severity: 'minor',
  dependency: {
    id: 'dep-123',
    url: 'https://github.com/org/dep'
  }
});

// Find existing issue
const existing = await issues.findExistingIssue({
  owner: 'user',
  repo: 'project',
  dependencyId: 'dep-123'
});

// Update issue
await issues.updateIssue({
  owner: 'user',
  repo: 'project',
  issueNumber: 42,
  body: 'Updated information',
  severity: 'major'
});
```

### Release Management

```typescript
import { ReleaseManager } from '@dependabit/github-client';

const releases = new ReleaseManager(token);

// Get latest release
const latest = await releases.getLatestRelease('owner', 'repo');

// Get specific release
const release = await releases.getReleaseByTag('owner', 'repo', 'v1.0.0');

// Compare releases
const comparison = await releases.compareReleases(
  'owner',
  'repo',
  'v1.0.0',
  'v2.0.0'
);

console.log(`Breaking changes: ${comparison.hasBreakingChanges}`);
```

### Commit Tracking

```typescript
import { getCommitsSince } from '@dependabit/github-client';

const commits = await getCommitsSince({
  owner: 'user',
  repo: 'project',
  since: new Date('2024-01-01'),
  author: 'username'
});
```

### False Positive Feedback

```typescript
import { FeedbackListener } from '@dependabit/github-client';

const feedback = new FeedbackListener(issueManager, {
  truePositiveLabel: 'true-positive',
  falsePositiveLabel: 'false-positive'
});

// Collect feedback from last 30 days
const data = await feedback.getRecentFeedback(30);

console.log(`False positives: ${data.falsePositives.length}`);
console.log(`True positives: ${data.truePositives.length}`);

// Calculate rate
const rate = await feedback.getFeedbackRate();
console.log(`FP rate: ${(rate.falsePositiveRate * 100).toFixed(1)}%`);

// Monitor specific issue
const hasFeedback = await feedback.monitorIssue(123);
```

## API Reference

### Client

- `createGitHubClient(config)`: Create client instance
- `getRateLimit()`: Get current rate limit info
- `checkRateLimit()`: Check and warn about rate limits
- `withRateLimit(fn)`: Execute function with rate limit checking

### Authentication

- `TokenAuthHandler`: GitHub PAT authentication
- `OAuthHandler`: OAuth 2.0 flow
- `BasicAuthHandler`: Basic HTTP authentication
- `AuthManager`: Unified auth management

### Rate Limiting

- `RateLimitHandler`: Rate limit management
- `reserveBudget(calls, options)`: Reserve API call budget
- `canProceed(calls, options)`: Check if operation can proceed
- `getRateLimitStatus()`: Get detailed status

### Issues

- `createIssue(data)`: Create new issue
- `findExistingIssue(params)`: Find existing issue
- `updateIssue(data)`: Update issue

### Releases

- `getLatestRelease(owner, repo)`: Get latest release
- `getReleaseByTag(owner, repo, tag)`: Get specific release
- `compareReleases(owner, repo, from, to)`: Compare two releases

### Feedback

- `FeedbackListener`: Monitor false positive feedback
- `collectFeedback(options)`: Collect feedback data
- `getFeedbackRate(options)`: Calculate FP rate
- `getRecentFeedback(days)`: Get recent feedback

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check
```

## License

MIT
