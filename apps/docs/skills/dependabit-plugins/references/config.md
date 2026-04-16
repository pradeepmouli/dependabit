# Configuration

## PluginLoaderConfig

Configuration for the PluginLoader.

### Properties

#### validateMetadata



**Type:** `boolean`

#### autoInitialize



**Type:** `boolean`

### Pitfalls
- Setting `autoInitialize: false` skips calling `plugin.initialize()` on
- load.  Plugins that allocate resources in `initialize` will be unusable
- until the caller manually invokes `plugin.initialize()`.