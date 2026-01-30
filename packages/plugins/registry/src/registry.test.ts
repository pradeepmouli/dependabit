import { describe, it, expect, beforeEach } from 'vitest';
import {
  PluginRegistry,
  globalRegistry,
  registerPlugin,
  getPlugin,
  listPlugins,
  discoverAccessMethods,
  type Plugin
} from '../src/registry.js';

describe('Plugin Registry Tests', () => {
  let registry: PluginRegistry;

  // Mock plugin
  const createMockPlugin = (accessMethod: string): Plugin => ({
    metadata: {
      name: `${accessMethod}-plugin`,
      version: '1.0.0',
      description: `Plugin for ${accessMethod}`,
      accessMethod
    },
    async check(_url: string) {
      return {
        hash: 'test-hash',
        available: true
      };
    }
  });

  beforeEach(() => {
    registry = new PluginRegistry();
    globalRegistry.clear();
  });

  describe('PluginRegistry', () => {
    it('should create empty registry', () => {
      expect(registry.count()).toBe(0);
      expect(registry.list()).toHaveLength(0);
    });

    it('should register a plugin', () => {
      const plugin = createMockPlugin('http');
      registry.register(plugin);

      expect(registry.count()).toBe(1);
      expect(registry.has('http')).toBe(true);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin1 = createMockPlugin('http');
      const plugin2 = createMockPlugin('http');

      registry.register(plugin1);
      expect(() => registry.register(plugin2)).toThrow(/already registered/);
    });

    it('should get a registered plugin', () => {
      const plugin = createMockPlugin('github-api');
      registry.register(plugin);

      const retrieved = registry.get('github-api');
      expect(retrieved).toBe(plugin);
    });

    it('should return undefined for unregistered plugin', () => {
      const retrieved = registry.get('unknown');
      expect(retrieved).toBeUndefined();
    });

    it('should unregister a plugin', async () => {
      const plugin = createMockPlugin('http');
      registry.register(plugin);

      expect(registry.has('http')).toBe(true);
      const result = await registry.unregister('http');

      expect(result).toBe(true);
      expect(registry.has('http')).toBe(false);
    });

    it('should call destroy when unregistering plugin with destroy method', async () => {
      const plugin = createMockPlugin('http', { withInit: true });
      plugin.destroy = vi.fn(async () => {});
      registry.register(plugin);

      await registry.unregister('http');

      expect(plugin.destroy).toHaveBeenCalled();
    });

    it('should return false when unregistering non-existent plugin', async () => {
      const result = await registry.unregister('unknown');
      expect(result).toBe(false);
    });

    it('should list all registered plugins', () => {
      const plugin1 = createMockPlugin('http');
      const plugin2 = createMockPlugin('github-api');

      registry.register(plugin1);
      registry.register(plugin2);

      const plugins = registry.list();
      expect(plugins).toHaveLength(2);
      expect(plugins.some((p) => p.accessMethod === 'http')).toBe(true);
      expect(plugins.some((p) => p.accessMethod === 'github-api')).toBe(true);
    });

    it('should discover available access methods', () => {
      registry.register(createMockPlugin('http'));
      registry.register(createMockPlugin('github-api'));
      registry.register(createMockPlugin('openapi'));

      const methods = registry.discover();
      expect(methods).toHaveLength(3);
      expect(methods).toContain('http');
      expect(methods).toContain('github-api');
      expect(methods).toContain('openapi');
    });

    it('should clear all plugins', () => {
      registry.register(createMockPlugin('http'));
      registry.register(createMockPlugin('github-api'));

      expect(registry.count()).toBe(2);

      registry.clear();
      expect(registry.count()).toBe(0);
      expect(registry.list()).toHaveLength(0);
    });
  });

  describe('Global Registry Functions', () => {
    it('should register plugin to global registry', () => {
      const plugin = createMockPlugin('http');
      registerPlugin(plugin);

      expect(globalRegistry.has('http')).toBe(true);
    });

    it('should get plugin from global registry', () => {
      const plugin = createMockPlugin('github-api');
      registerPlugin(plugin);

      const retrieved = getPlugin('github-api');
      expect(retrieved).toBe(plugin);
    });

    it('should list plugins from global registry', () => {
      registerPlugin(createMockPlugin('http'));
      registerPlugin(createMockPlugin('github-api'));

      const plugins = listPlugins();
      expect(plugins).toHaveLength(2);
    });

    it('should discover access methods from global registry', () => {
      registerPlugin(createMockPlugin('http'));
      registerPlugin(createMockPlugin('openapi'));

      const methods = discoverAccessMethods();
      expect(methods).toHaveLength(2);
      expect(methods).toContain('http');
      expect(methods).toContain('openapi');
    });
  });
});
