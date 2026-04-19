/**
 * Plugin registry and core plugin types for `@dependabit/plugins`.
 *
 * @remarks
 * The registry maps access method identifiers (e.g. `'arxiv'`, `'context7'`)
 * to plugin instances.  A single global registry ({@link globalRegistry}) is
 * provided for convenience, but isolated instances can be created with
 * {@link createPluginRegistry} for testing or multi-tenant scenarios.
 *
 * @pitfalls
 * - **Plugin name collisions**: registering a second plugin for the same
 *   `accessMethod` throws an error in `PluginRegistry.register`.  Use
 *   `PluginRegistry.unregister` before re-registering if hot-swapping is
 *   needed.
 * - **Init order**: if a plugin's `initialize` method depends on another
 *   plugin being present in the registry, register dependencies first.
 *   `PluginLoader.autoInitialize` calls `initialize` during `load` — ensure
 *   the registry is populated before calling `load` on dependent plugins.
 * - **Calling plugins before `initialize`**: plugins that require async
 *   setup (e.g., opening a database connection) will behave incorrectly if
 *   `check` is called before `initialize` completes.  Always `await` the
 *   `load` or `instantiate` call from `PluginLoader` before using the
 *   plugin.
 * - **Global registry in tests**: tests that register plugins on
 *   `globalRegistry` and run in parallel will interfere with each other.
 *   Use {@link createPluginRegistry} per test suite.
 *
 * @module
 */

import { z } from 'zod';

/**
 * Zod schema for validating plugin metadata at load time.
 * @category Plugins
 */
export const PluginMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  accessMethod: z.string(),
  supportedTypes: z.array(z.string()).optional(),
  apiVersion: z.string().optional()
});

/** Validated plugin metadata type. @category Plugins */
export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;

/**
 * Contract that all dependabit plugins must satisfy.
 *
 * @remarks
 * Plugins are loaded and validated by {@link PluginLoader} before being
 * registered.  The optional lifecycle hooks `initialize` and `destroy` are
 * called by `PluginLoader.load` and `PluginRegistry.unregister` respectively.
 *
 * @category Plugins
 *
 * @useWhen
 * Implementing a custom access method (e.g., a proprietary package registry,
 * an internal documentation API, or a new public API).
 *
 * @pitfalls
 * - Do NOT perform network calls or resource allocation in the constructor —
 *   use `initialize` instead so that errors are surfaced at load time, not
 *   at registration.
 * - `destroy` must be idempotent; `PluginRegistry.clear` may call it even if
 *   `initialize` was never called.
 */
export interface Plugin {
  metadata: PluginMetadata;
  /**
   * Fetch the current state of the resource at `url` and return a snapshot.
   * @param url - The dependency URL to check.
   */
  check(url: string): Promise<PluginCheckResult>;
  /** Optional async setup called by `PluginLoader` after validation. */
  initialize?(): Promise<void>;
  /** Optional async teardown called when the plugin is removed from the registry. */
  destroy?(): Promise<void>;
}

/**
 * The result returned by {@link Plugin.check}.
 *
 * @remarks
 * `hash` should be a stable, deterministic digest of the resource state
 * (e.g., a SHA-256 of the version string or content).  The `Monitor` uses
 * hash equality to detect changes.
 *
 * @category Plugins
 */
export interface PluginCheckResult {
  version?: string;
  hash: string;
  available: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Registry that maps access method identifiers to plugin instances.
 *
 * @remarks
 * Each access method can have at most one registered plugin at a time.
 * Attempting to register a second plugin for the same `accessMethod` without
 * first unregistering the existing one throws an `Error`.
 *
 * @category Plugins
 *
 * @useWhen
 * - Managing a set of plugins across the lifetime of an application.
 * - Isolating plugins in a test suite (via {@link createPluginRegistry}).
 *
 * @avoidWhen
 * Using the `globalRegistry` singleton directly in tests that run in
 * parallel — mutations to the global registry leak between test cases.
 *
 * @pitfalls
 * - **Silent collision override is intentional by design in the old API**;
 *   the current implementation *throws* on collision.  Do not assume
 *   `register` is idempotent.
 * - **`clear` is fire-and-forget**: errors from `plugin.destroy()` are
 *   caught and logged but not re-thrown.  A plugin that fails to tear down
 *   cleanly will leave resources open silently.
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    const accessMethod = plugin.metadata.accessMethod;

    if (this.plugins.has(accessMethod)) {
      throw new Error(`Plugin for access method '${accessMethod}' already registered`);
    }

    this.plugins.set(accessMethod, plugin);
  }

  /**
   * Unregister a plugin
   */
  async unregister(accessMethod: string): Promise<boolean> {
    const plugin = this.plugins.get(accessMethod);
    if (plugin && plugin.destroy) {
      await plugin.destroy();
    }
    return this.plugins.delete(accessMethod);
  }

  /**
   * Get a plugin by access method
   */
  get(accessMethod: string): Plugin | undefined {
    return this.plugins.get(accessMethod);
  }

  /**
   * Check if a plugin is registered
   */
  has(accessMethod: string): boolean {
    return this.plugins.has(accessMethod);
  }

  /**
   * List all registered plugins
   */
  list(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((plugin) => plugin.metadata);
  }

  /**
   * Discover and list available access methods
   */
  discover(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get plugin count
   */
  count(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy().catch((error) => {
          // Log errors during plugin destruction but don't propagate to avoid unhandled rejections
          console.error(`Error destroying plugin ${plugin.metadata.name}:`, error);
        });
      }
    }
    this.plugins.clear();
  }
}

/**
 * Create a new, isolated plugin registry instance.
 *
 * This is useful in testing scenarios where you want to avoid shared
 * global state between tests (for example, when tests run in parallel
 * or when they need strict isolation of registered plugins).
 */
export function createPluginRegistry(): PluginRegistry {
  return new PluginRegistry();
}

/**
 * Global plugin registry instance.
 *
 * NOTE: This is a shared singleton. Tests that rely on `globalRegistry`
 * may interfere with each other if they run in parallel, because they
 * mutate shared state. For isolated testing, prefer using
 * {@link createPluginRegistry} to obtain a fresh registry instance per test.
 */
export const globalRegistry = new PluginRegistry();

/**
 * Register a plugin to the global registry
 */
export function registerPlugin(plugin: Plugin): void {
  globalRegistry.register(plugin);
}

/**
 * Get a plugin from the global registry
 */
export function getPlugin(accessMethod: string): Plugin | undefined {
  return globalRegistry.get(accessMethod);
}

/**
 * List all plugins in the global registry
 */
export function listPlugins(): PluginMetadata[] {
  return globalRegistry.list();
}

/**
 * Discover available access methods
 */
export function discoverAccessMethods(): string[] {
  return globalRegistry.discover();
}
