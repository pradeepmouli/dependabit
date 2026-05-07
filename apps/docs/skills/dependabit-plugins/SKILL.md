---
name: dependabit-plugins
description: "Documentation site for dependabit Use when: Managing a set of plugins across the lifetime of an application.."
---

# @dependabit/plugins

Documentation site for dependabit

## When to Use

**Use this skill when:**
- Managing a set of plugins across the lifetime of an application. → use `PluginRegistry`
- Isolating plugins in a test suite (via createPluginRegistry). → use `PluginRegistry`
- Loading plugins from dynamic imports, configuration-driven plugin lists, or test fixtures where you want to confirm a plugin satisfies the contract before registering it. → use `PluginLoader`

**Do NOT use when:**
- Using the `globalRegistry` singleton directly in tests that run in parallel — mutations to the global registry leak between test cases. (`PluginRegistry`)
- You control the plugin class directly and prefer to call `new` and `initialize` manually — the overhead of `validatePlugin` is minimal but the extra abstraction may be unnecessary. (`PluginLoader`)

API surface: 6 functions, 2 classes, 3 types, 2 constants

## NEVER

- **Silent collision override is intentional by design in the old API**; the current implementation *throws* on collision.  Do not assume `register` is idempotent.
- **`clear` is fire-and-forget**: errors from `plugin.destroy()` are caught and logged but not re-thrown.  A plugin that fails to tear down cleanly will leave resources open silently.
- `load` calls `initialize` if `autoInitialize` is `true`.  If `initialize` throws, the plugin is **not** registered — but if the caller has already called `PluginRegistry.register`, the registry will hold a broken plugin instance.  Always call `load` **before** `register`.
- `instantiate` creates a new instance and calls `load`; the returned instance is fully initialised.  Calling `new PluginClass()` directly and registering without going through the loader bypasses metadata validation.

## Configuration

**PluginLoaderConfig** — Configuration for the PluginLoader. (2 options — see references/config.md)

**Pitfalls:**
- Setting `autoInitialize: false` skips calling `plugin.initialize()` on load.  Plugins that allocate resources in `initialize` will be unusable until the caller manually invokes `plugin.initialize()`.

## Quick Reference

**registry:** `createPluginRegistry` (Create a new, isolated plugin registry instance), `registerPlugin` (Register a plugin to the global registry), `getPlugin` (Get a plugin from the global registry), `listPlugins` (List all plugins in the global registry), `discoverAccessMethods` (Discover available access methods), `globalRegistry` (Global plugin registry instance)
**loader:** `createPluginLoader` (Create a plugin loader)
**Plugins:** `PluginRegistry` (Registry that maps access method identifiers to plugin instances), `PluginLoader` (Validates and optionally initialises plugin instances before they are
registered), `PluginMetadata` (Validated plugin metadata type), `Plugin` (Contract that all dependabit plugins must satisfy), `PluginCheckResult` (The result returned by Plugin), `PluginMetadataSchema` (Zod schema for validating plugin metadata at load time)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)