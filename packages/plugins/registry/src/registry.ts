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
  unregister(accessMethod: string): boolean {
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
    this.plugins.clear();
  }
}

/**
 * Global plugin registry instance
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
