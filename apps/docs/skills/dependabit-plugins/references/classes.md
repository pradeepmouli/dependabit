# Classes

## Plugins

### `PluginRegistry`
Registry that maps access method identifiers to plugin instances.
```ts
constructor(): PluginRegistry
```
**Methods:**
- `register(plugin: Plugin): void` — Register a plugin
- `unregister(accessMethod: string): Promise<boolean>` — Unregister a plugin
- `get(accessMethod: string): Plugin | undefined` — Get a plugin by access method
- `has(accessMethod: string): boolean` — Check if a plugin is registered
- `list(): { name: string; version: string; accessMethod: string; description?: string; supportedTypes?: string[]; apiVersion?: string }[]` — List all registered plugins
- `discover(): string[]` — Discover and list available access methods
- `count(): number` — Get plugin count
- `clear(): void` — Clear all plugins

### `PluginLoader`
Validates and optionally initialises plugin instances before they are
registered.
```ts
constructor(config: PluginLoaderConfig): PluginLoader
```
**Methods:**
- `validateMetadata(metadata: unknown): { name: string; version: string; accessMethod: string; description?: string; supportedTypes?: string[]; apiVersion?: string }` — Validate plugin metadata
- `validatePlugin(plugin: unknown): Plugin` — Validate plugin structure
- `load(plugin: unknown): Promise<Plugin>` — Load and validate a plugin
- `loadMany(plugins: unknown[]): Promise<Plugin[]>` — Load multiple plugins
- `instantiate<T, A>(PluginClass: (args: A) => T, args: A): Promise<T>` — Instantiate a plugin from a class
