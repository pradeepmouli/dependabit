# Functions

## registry

### `createPluginRegistry`
Create a new, isolated plugin registry instance.

This is useful in testing scenarios where you want to avoid shared
global state between tests (for example, when tests run in parallel
or when they need strict isolation of registered plugins).
```ts
createPluginRegistry(): PluginRegistry
```
**Returns:** `PluginRegistry`

### `registerPlugin`
Register a plugin to the global registry
```ts
registerPlugin(plugin: Plugin): void
```
**Parameters:**
- `plugin: Plugin`

### `getPlugin`
Get a plugin from the global registry
```ts
getPlugin(accessMethod: string): Plugin | undefined
```
**Parameters:**
- `accessMethod: string`
**Returns:** `Plugin | undefined`

### `listPlugins`
List all plugins in the global registry
```ts
listPlugins(): { name: string; version: string; accessMethod: string; description?: string; supportedTypes?: string[]; apiVersion?: string }[]
```
**Returns:** `{ name: string; version: string; accessMethod: string; description?: string; supportedTypes?: string[]; apiVersion?: string }[]`

### `discoverAccessMethods`
Discover available access methods
```ts
discoverAccessMethods(): string[]
```
**Returns:** `string[]`

## loader

### `createPluginLoader`
Create a plugin loader
```ts
createPluginLoader(config?: PluginLoaderConfig): PluginLoader
```
**Parameters:**
- `config: PluginLoaderConfig` (optional)
**Returns:** `PluginLoader`
