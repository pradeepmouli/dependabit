# Types & Enums

## monitor

### `DependencyConfig`
**Properties:**
- `id: string`
- `name: string` (optional)
- `type: string` (optional)
- `currentStateHash: string`
- `currentVersion: string` (optional)
- `lastChecked: string` (optional)
- `monitoring: { enabled?: boolean; ignoreChanges?: boolean }` (optional)
- `url: string`
- `accessMethod: "github-api" | "http" | "openapi" | "context7" | "arxiv"`
- `auth: { type: "token" | "basic" | "oauth" | "none"; secret?: string }` (optional)

### `CheckResult`
**Properties:**
- `dependency: DependencyConfig`
- `hasChanged: boolean`
- `changes: ChangeDetection` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)
- `newSnapshot: DependencySnapshot` (optional)
- `error: string` (optional)

## severity

### `Severity`
```ts
"breaking" | "major" | "minor"
```

## types

### `Checker`

### `DependencySnapshot`
Common types for dependency checkers
**Properties:**
- `version: string` (optional)
- `stateHash: string`
- `fetchedAt: Date`
- `metadata: Record<string, unknown>` (optional)

### `ChangeDetection`
**Properties:**
- `hasChanged: boolean`
- `changes: string[]`
- `oldVersion: string` (optional)
- `newVersion: string` (optional)
- `diff: unknown` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)

### `AccessConfig`
**Properties:**
- `url: string`
- `accessMethod: "github-api" | "http" | "openapi" | "context7" | "arxiv"`
- `auth: { type: "token" | "basic" | "oauth" | "none"; secret?: string }` (optional)
