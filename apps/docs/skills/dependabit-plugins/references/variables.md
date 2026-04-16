# Variables & Constants

## Plugins

### `PluginMetadataSchema`
Zod schema for validating plugin metadata at load time.
```ts
const PluginMetadataSchema: ZodObject<{ name: ZodString; version: ZodString; description: ZodOptional<ZodString>; accessMethod: ZodString; supportedTypes: ZodOptional<ZodArray<ZodString>>; apiVersion: ZodOptional<ZodString> }, $strip>
```

## registry

### `globalRegistry`
Global plugin registry instance.

NOTE: This is a shared singleton. Tests that rely on `globalRegistry`
may interfere with each other if they run in parallel, because they
mutate shared state. For isolated testing, prefer using
createPluginRegistry to obtain a fresh registry instance per test.
```ts
const globalRegistry: PluginRegistry
```
