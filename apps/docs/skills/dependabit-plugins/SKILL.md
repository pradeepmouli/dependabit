---
name: dependabit-plugins
description: Documentation site for dependabit
---

# @dependabit/plugins

Documentation site for dependabit

## When to Use

- API surface: 6 functions, 2 classes, 3 types, 2 constants

## Configuration

### PluginLoaderConfig

Configuration for the PluginLoader.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `validateMetadata` | `boolean` | no | — |  |
| `autoInitialize` | `boolean` | no | — |  |

**Pitfalls:**
- Setting `autoInitialize: false` skips calling `plugin.initialize()` on
- load.  Plugins that allocate resources in `initialize` will be unusable
- until the caller manually invokes `plugin.initialize()`.

## Quick Reference

**registry:** `createPluginRegistry`, `registerPlugin`, `getPlugin`, `listPlugins`, `discoverAccessMethods`, `globalRegistry`
**loader:** `createPluginLoader`
**Plugins:** `PluginRegistry`, `PluginLoader`, `PluginMetadata`, `Plugin`, `PluginCheckResult`, `PluginMetadataSchema`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)