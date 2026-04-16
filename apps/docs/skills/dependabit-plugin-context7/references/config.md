# Configuration

## Context7Config

Configuration for the Context7Checker.

### Properties

#### url



**Type:** `string`

**Required:** yes

#### libraryId



**Type:** `string`

#### auth



**Type:** `{ type: "token" | "none"; secret?: string }`

### Use when
- Monitoring a library's structured documentation via the Context7 API.

### Pitfalls
- `libraryId` must match the exact Context7 library identifier.  If the
- API returns 404 for a valid URL, try extracting the ID from the URL
- manually and providing it explicitly rather than relying on URL parsing.
- When `auth.secret` is omitted, the checker makes unauthenticated
- requests, which may have lower rate limits or restricted access.