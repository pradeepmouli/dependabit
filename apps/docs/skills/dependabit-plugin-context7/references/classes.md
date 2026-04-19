# Classes

## plugin-context7

### `Context7Checker`
Monitors library documentation changes via the Context7 API, with a
fallback to direct URL content hashing when the API is unavailable.
```ts
constructor(): Context7Checker
```
**Methods:**
- `fetch(config: Context7Config): Promise<Context7Snapshot>` — Fetch library information from Context7 API
- `compare(prev: Context7Snapshot, curr: Context7Snapshot): Promise<Context7ChangeDetection>` — Compare two Context7 snapshots to detect changes
