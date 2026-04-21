import { type Plugin, PluginMetadataSchema, type PluginMetadata } from './registry.js';

/**
 * Configuration for the {@link PluginLoader}.
 *
 * @config
 * @category Plugins
 *
 * @never
 * - Setting `autoInitialize: false` skips calling `plugin.initialize()` on
 *   load.  Plugins that allocate resources in `initialize` will be unusable
 *   until the caller manually invokes `plugin.initialize()`.
 */
export interface PluginLoaderConfig {
  validateMetadata?: boolean;
  autoInitialize?: boolean;
}

/**
 * Validates and optionally initialises plugin instances before they are
 * registered.
 *
 * @remarks
 * `PluginLoader` is the recommended way to bring plugins into the registry
 * because it validates metadata and calls `initialize` atomically.
 *
 * @category Plugins
 *
 * @useWhen
 * Loading plugins from dynamic imports, configuration-driven plugin lists,
 * or test fixtures where you want to confirm a plugin satisfies the contract
 * before registering it.
 *
 * @avoidWhen
 * You control the plugin class directly and prefer to call `new` and
 * `initialize` manually — the overhead of `validatePlugin` is minimal but
 * the extra abstraction may be unnecessary.
 *
 * @never
 * - `load` calls `initialize` if `autoInitialize` is `true`.  If `initialize`
 *   throws, the plugin is **not** registered — but if the caller has already
 *   called `PluginRegistry.register`, the registry will hold a broken plugin
 *   instance.  Always call `load` **before** `register`.
 * - `instantiate` creates a new instance and calls `load`; the returned
 *   instance is fully initialised.  Calling `new PluginClass()` directly and
 *   registering without going through the loader bypasses metadata validation.
 */
export class PluginLoader {
  private config: Required<PluginLoaderConfig>;

  constructor(config: PluginLoaderConfig = {}) {
    this.config = {
      validateMetadata: config.validateMetadata ?? true,
      autoInitialize: config.autoInitialize ?? true
    };
  }

  /**
   * Validate plugin metadata
   */
  validateMetadata(metadata: unknown): PluginMetadata {
    return PluginMetadataSchema.parse(metadata);
  }

  /**
   * Validate plugin structure
   */
  validatePlugin(plugin: unknown): Plugin {
    const p = plugin as Plugin;

    if (!p.metadata) {
      throw new Error('Plugin must have metadata');
    }

    if (this.config.validateMetadata) {
      this.validateMetadata(p.metadata);
    }

    if (typeof p.check !== 'function') {
      throw new Error('Plugin must implement check method');
    }

    return p;
  }

  /**
   * Load and validate a plugin
   */
  async load(plugin: unknown): Promise<Plugin> {
    const validatedPlugin = this.validatePlugin(plugin);

    if (this.config.autoInitialize && validatedPlugin.initialize) {
      await validatedPlugin.initialize();
    }

    return validatedPlugin;
  }

  /**
   * Load multiple plugins
   */
  async loadMany(plugins: unknown[]): Promise<Plugin[]> {
    return Promise.all(plugins.map((plugin) => this.load(plugin)));
  }

  /**
   * Instantiate a plugin from a class
   */
  async instantiate<T extends Plugin, A extends unknown[]>(
    PluginClass: new (...args: A) => T,
    ...args: A
  ): Promise<T> {
    const instance = new PluginClass(...args);
    return (await this.load(instance)) as T;
  }
}

/**
 * Create a plugin loader
 */
export function createPluginLoader(config?: PluginLoaderConfig): PluginLoader {
  return new PluginLoader(config);
}
