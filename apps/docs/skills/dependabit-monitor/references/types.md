# Types & Enums

## Monitor

### `CheckResult`
The outcome of a single dependency check performed by Monitor.
**Properties:**
- `dependency: DependencyConfig`
- `hasChanged: boolean`
- `changes: ChangeDetection` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)
- `newSnapshot: DependencySnapshot` (optional)
- `error: string` (optional) — Non-empty string if the check failed; callers should log and skip.

### `Checker`
Contract for all dependency checker implementations.

### `DependencySnapshot`
A point-in-time snapshot of a dependency's state.
**Properties:**
- `version: string` (optional)
- `stateHash: string`
- `fetchedAt: Date`
- `metadata: Record<string, unknown>` (optional)

### `ChangeDetection`
The result of comparing two DependencySnapshot objects.
**Properties:**
- `hasChanged: boolean`
- `changes: string[]`
- `oldVersion: string` (optional)
- `newVersion: string` (optional)
- `diff: unknown` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)

## severity

### `Severity`
```ts
"breaking" | "major" | "minor"
```
