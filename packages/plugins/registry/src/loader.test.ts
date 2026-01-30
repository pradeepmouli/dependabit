import { describe, it, expect, vi } from 'vitest';
import { PluginLoader, createPluginLoader } from '../src/loader.js';
import type { Plugin } from '../src/registry.js';

describe('Plugin Loader Tests', () => {
  // Mock plugin
  const createMockPlugin = (
    accessMethod: string,
    options: { withInit?: boolean } = {}
  ): Plugin => ({
    metadata: {
      name: `${accessMethod}-plugin`,
      version: '1.0.0',
      accessMethod
    },
    async check(url: string) {
      return {
        hash: 'test-hash',
        available: true
      };
    },
    ...(options.withInit && {
      initialize: vi.fn(async () => {
        // initialization logic
      })
    })
  });

  describe('PluginLoader', () => {
    it('should create loader with default config', () => {
      const loader = new PluginLoader();
      expect(loader).toBeDefined();
    });

    it('should create loader with custom config', () => {
      const loader = new PluginLoader({
        validateMetadata: false,
        autoInitialize: false
      });
      expect(loader).toBeDefined();
    });

    it('should validate plugin metadata', () => {
      const loader = new PluginLoader();
      const metadata = {
        name: 'test-plugin',
        version: '1.0.0',
        accessMethod: 'http'
      };

      const validated = loader.validateMetadata(metadata);
      expect(validated.name).toBe('test-plugin');
    });

    it('should throw error for invalid metadata', () => {
      const loader = new PluginLoader();
      const invalid = {
        name: 'test-plugin'
        // missing required fields
      };

      expect(() => loader.validateMetadata(invalid)).toThrow();
    });

    it('should validate plugin structure', () => {
      const loader = new PluginLoader();
      const plugin = createMockPlugin('http');

      const validated = loader.validatePlugin(plugin);
      expect(validated).toBe(plugin);
    });

    it('should throw error for plugin without metadata', () => {
      const loader = new PluginLoader();
      const invalid = {
        async check() {
          return { hash: 'test', available: true };
        }
      };

      expect(() => loader.validatePlugin(invalid)).toThrow(/must have metadata/);
    });

    it('should throw error for plugin without check method', () => {
      const loader = new PluginLoader();
      const invalid = {
        metadata: {
          name: 'test',
          version: '1.0.0',
          accessMethod: 'http'
        }
      };

      expect(() => loader.validatePlugin(invalid)).toThrow(/must implement check method/);
    });

    it('should load and validate a plugin', async () => {
      const loader = new PluginLoader();
      const plugin = createMockPlugin('http');

      const loaded = await loader.load(plugin);
      expect(loaded).toBe(plugin);
    });

    it('should auto-initialize plugin if configured', async () => {
      const loader = new PluginLoader({ autoInitialize: true });
      const plugin = createMockPlugin('http', { withInit: true });

      await loader.load(plugin);

      expect(plugin.initialize).toHaveBeenCalled();
    });

    it('should not initialize plugin if auto-initialize is disabled', async () => {
      const loader = new PluginLoader({ autoInitialize: false });
      const plugin = createMockPlugin('http', { withInit: true });

      await loader.load(plugin);

      expect(plugin.initialize).not.toHaveBeenCalled();
    });

    it('should load multiple plugins', async () => {
      const loader = new PluginLoader();
      const plugins = [
        createMockPlugin('http'),
        createMockPlugin('github-api'),
        createMockPlugin('openapi')
      ];

      const loaded = await loader.loadMany(plugins);

      expect(loaded).toHaveLength(3);
      expect(loaded[0].metadata.accessMethod).toBe('http');
      expect(loaded[1].metadata.accessMethod).toBe('github-api');
      expect(loaded[2].metadata.accessMethod).toBe('openapi');
    });

    it('should instantiate a plugin from a class', async () => {
      const loader = new PluginLoader();

      class TestPlugin implements Plugin {
        metadata = {
          name: 'test-plugin',
          version: '1.0.0',
          accessMethod: 'test'
        };

        async check(url: string) {
          return {
            hash: 'test-hash',
            available: true
          };
        }
      }

      const instance = await loader.instantiate(TestPlugin);

      expect(instance).toBeInstanceOf(TestPlugin);
      expect(instance.metadata.accessMethod).toBe('test');
    });

    it('should pass constructor arguments when instantiating', async () => {
      const loader = new PluginLoader();

      class ConfigurablePlugin implements Plugin {
        metadata = {
          name: 'configurable-plugin',
          version: '1.0.0',
          accessMethod: 'custom'
        };

        constructor(public readonly config: Record<string, unknown>) {}

        async check(url: string) {
          return {
            hash: 'test-hash',
            available: true,
            metadata: this.config
          };
        }
      }

      const config = { apiKey: 'test-key' };
      const instance = await loader.instantiate(ConfigurablePlugin, config);

      expect(instance.config).toBe(config);
    });
  });

  describe('createPluginLoader', () => {
    it('should create a plugin loader instance', () => {
      const loader = createPluginLoader();
      expect(loader).toBeInstanceOf(PluginLoader);
    });

    it('should accept configuration', () => {
      const loader = createPluginLoader({ validateMetadata: false });
      expect(loader).toBeInstanceOf(PluginLoader);
    });
  });
});
