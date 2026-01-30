import { type Plugin, PluginMetadataSchema, type PluginMetadata } from './registry.js';

/**
 * Plugin loader configuration
 */
export interface PluginLoaderConfig {
  validateMetadata?: boolean;
  autoInitialize?: boolean;
}

/**
 * Plugin loader for loading and validating plugins
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
  async instantiate<T extends Plugin>(
    PluginClass: new (...args: any[]) => T,
    ...args: any[]
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
