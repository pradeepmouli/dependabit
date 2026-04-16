# Types & Enums

## checker

### `Context7Library`
Context7 library metadata
**Properties:**
- `id: string`
- `name: string`
- `version: string`
- `lastUpdated: string`
- `description: string` (optional)

### `Context7Snapshot`
Context7 snapshot result
**Properties:**
- `version: string`
- `stateHash: string`
- `fetchedAt: Date`
- `metadata: { libraryId: string; libraryName: string; lastUpdated: string; description?: string; contentHash?: string }`

### `Context7ChangeDetection`
Context7 change detection result
**Properties:**
- `hasChanged: boolean`
- `changes: string[]`
- `oldVersion: string` (optional)
- `newVersion: string` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)
