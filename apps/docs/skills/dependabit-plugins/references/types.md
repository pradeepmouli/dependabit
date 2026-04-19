# Types & Enums

## Plugins

### `PluginMetadata`
Validated plugin metadata type.
```ts
z.infer<typeof PluginMetadataSchema>
```

### `Plugin`
Contract that all dependabit plugins must satisfy.
**Properties:**
- `metadata: { name: string; version: string; accessMethod: string; description?: string; supportedTypes?: string[]; apiVersion?: string }`

### `PluginCheckResult`
The result returned by Plugin.check.
**Properties:**
- `version: string` (optional)
- `hash: string`
- `available: boolean`
- `metadata: Record<string, unknown>` (optional)
