# Functions

## size-check

### `checkManifestSize`
Check manifest size and return status
```ts
checkManifestSize(content: any, options?: SizeCheckOptions): SizeCheckResult
```
**Parameters:**
- `content: any`
- `options: SizeCheckOptions` (optional)
**Returns:** `SizeCheckResult`

### `formatSize`
Get formatted size string
```ts
formatSize(bytes: number): string
```
**Parameters:**
- `bytes: number`
**Returns:** `string`

### `validateManifestObject`
Validate manifest object size before serialization
```ts
validateManifestObject(manifest: unknown, options?: SizeCheckOptions): SizeCheckResult
```
**Parameters:**
- `manifest: unknown`
- `options: SizeCheckOptions` (optional)
**Returns:** `SizeCheckResult`

### `estimateEntrySize`
Estimate manifest size impact of adding an entry
```ts
estimateEntrySize(entry: unknown): number
```
**Parameters:**
- `entry: unknown`
**Returns:** `number`

### `canAddEntry`
Check if adding an entry would exceed limits
```ts
canAddEntry(currentManifest: unknown, newEntry: unknown, options?: SizeCheckOptions): { canAdd: boolean; currentSize: SizeCheckResult; estimatedSize: SizeCheckResult }
```
**Parameters:**
- `currentManifest: unknown`
- `newEntry: unknown`
- `options: SizeCheckOptions` (optional)
**Returns:** `{ canAdd: boolean; currentSize: SizeCheckResult; estimatedSize: SizeCheckResult }`
