import { z } from 'zod';

/**
 * Plugin metadata schema
 */
export const PluginMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  accessMethod: z.string(),
  supportedTypes: z.array(z.string()).optional()
});

export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;

/**
 * Plugin interface
 */
export interface Plugin {
  metadata: PluginMetadata;
  check(url: string): Promise<PluginCheckResult>;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

/**
 * Plugin check result
 */
export interface PluginCheckResult {
  version?: string;
  hash: string;
  available: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Plugin registry for managing access method plugins
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
        plugin.destroy().catch(() => {
          // Ignore errors during plugin destruction to avoid unhandled rejections
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
