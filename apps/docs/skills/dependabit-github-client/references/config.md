# Configuration

## GitHubClientConfig

Configuration for the GitHubClient wrapper.

### Properties

#### auth



**Type:** `string`

#### rateLimitWarningThreshold



**Type:** `number`

#### rateLimitMinRemaining



**Type:** `number`

### Pitfalls
- **Fine-grained vs. classic tokens**: fine-grained personal access tokens
- restrict API access to selected repositories and scopes.  Some endpoints
- (e.g. `rateLimit.get()`) are available to unauthenticated requests, but
- commit and issue APIs require the appropriate scope.  A missing scope
- surfaces as a `403 Forbidden`, not a `401 Unauthorized`.
- **Unauthenticated requests**: omitting `auth` allows unauthenticated
- requests with a shared rate limit of 60 req/h per IP.  For CI
- environments with multiple jobs sharing an IP this can exhaust quickly.

## FetchCommitsOptions

### Properties

#### since



**Type:** `string`

#### until



**Type:** `string`

#### sha



**Type:** `string`

#### path



**Type:** `string`

#### per_page



**Type:** `number`

#### page



**Type:** `number`

## AuthConfig

### Properties

#### type



**Type:** `AuthType`

**Required:** yes

#### token



**Type:** `string`

#### oauth



**Type:** `OAuthConfig`

#### username



**Type:** `string`

#### password



**Type:** `string`

## FeedbackConfig

### Properties

#### truePositiveLabel



**Type:** `string`

#### falsePositiveLabel



**Type:** `string`

## OAuthConfig

OAuth 2.0 authentication handler for GitHub
Supports authorization code flow and token refresh

### Properties

#### clientId



**Type:** `string`

**Required:** yes

#### clientSecret



**Type:** `string`

**Required:** yes

#### redirectUri



**Type:** `string`

**Required:** yes