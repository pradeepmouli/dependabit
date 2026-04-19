# Configuration

## DependencyConfig

Runtime descriptor passed to the monitor for a single tracked dependency.

Extends AccessConfig with identity, state-tracking, and monitoring
rule fields.  This is typically constructed by reading a
`DependencyEntry` from a manifest and projecting the relevant fields.

### Properties

#### id



**Type:** `string`

**Required:** yes

#### name



**Type:** `string`

#### type



**Type:** `string`

#### currentStateHash



**Type:** `string`

**Required:** yes

#### currentVersion



**Type:** `string`

#### lastChecked



**Type:** `string`

#### monitoring



**Type:** `{ enabled?: boolean; ignoreChanges?: boolean }`

#### url



**Type:** `string`

**Required:** yes

#### accessMethod



**Type:** `"context7" | "arxiv" | "openapi" | "github-api" | "http"`

**Required:** yes

#### auth



**Type:** `{ type: "token" | "oauth" | "basic" | "none"; secret?: string }`

### Pitfalls
- `currentStateHash` must reflect the **last known good state** fetched by
- the monitor.  An empty string or stale hash causes the first check to
- always report a change (false positive on first run).
- `lastChecked` is used by the `Scheduler` to decide whether a dependency
- is due for checking.  An incorrect or missing timestamp causes either
- perpetual over-checking (missing timestamp) or silent skipping (future
- timestamp).

## AccessConfig

Minimum configuration required to fetch and compare a dependency.

### Properties

#### url



**Type:** `string`

**Required:** yes

#### accessMethod



**Type:** `"context7" | "arxiv" | "openapi" | "github-api" | "http"`

**Required:** yes

#### auth



**Type:** `{ type: "token" | "oauth" | "basic" | "none"; secret?: string }`

### Pitfalls
- `auth.secret` contains the raw credential value at runtime.  **Never**
- persist this object to disk or logs.  Store the secret reference in
- `DependencyEntry.auth.secretEnvVar` and resolve it at runtime.