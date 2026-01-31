import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecretResolver } from '../../src/utils/secrets';

describe('SecretResolver', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create resolver instance', () => {
      const resolver = new SecretResolver();
      expect(resolver).toBeInstanceOf(SecretResolver);
    });

    it('should accept custom prefix', () => {
      const resolver = new SecretResolver({ prefix: 'CUSTOM_' });
      expect(resolver).toBeInstanceOf(SecretResolver);
    });
  });

  describe('resolve', () => {
    it('should resolve secret from environment variable', async () => {
      process.env.GITHUB_TOKEN = 'ghp_test123';
      const resolver = new SecretResolver();
      
      const value = await resolver.resolve('GITHUB_TOKEN');
      expect(value).toBe('ghp_test123');
    });

    it('should resolve secret with custom prefix', async () => {
      process.env.CUSTOM_API_KEY = 'api_key_123';
      const resolver = new SecretResolver({ prefix: 'CUSTOM_' });
      
      const value = await resolver.resolve('API_KEY');
      expect(value).toBe('api_key_123');
    });

    it('should throw error for missing secret', async () => {
      const resolver = new SecretResolver();
      
      await expect(resolver.resolve('MISSING_SECRET')).rejects.toThrow(
        'Secret MISSING_SECRET not found'
      );
    });

    it('should resolve from GitHub Secrets in Actions context', async () => {
      process.env.GITHUB_ACTIONS = 'true';
      process.env.INPUT_API_TOKEN = 'secret_from_action';
      const resolver = new SecretResolver();
      
      const value = await resolver.resolve('INPUT_API_TOKEN');
      expect(value).toBe('secret_from_action');
    });

    it('should handle secret reference format', async () => {
      process.env.DB_PASSWORD = 'secure_password';
      const resolver = new SecretResolver();
      
      const value = await resolver.resolve('${{ secrets.DB_PASSWORD }}');
      expect(value).toBe('secure_password');
    });
  });

  describe('resolveMultiple', () => {
    it('should resolve multiple secrets', async () => {
      process.env.SECRET_1 = 'value1';
      process.env.SECRET_2 = 'value2';
      process.env.SECRET_3 = 'value3';
      
      const resolver = new SecretResolver();
      const secrets = await resolver.resolveMultiple(['SECRET_1', 'SECRET_2', 'SECRET_3']);
      
      expect(secrets).toEqual({
        SECRET_1: 'value1',
        SECRET_2: 'value2',
        SECRET_3: 'value3'
      });
    });

    it('should throw error if any secret is missing', async () => {
      process.env.SECRET_1 = 'value1';
      
      const resolver = new SecretResolver();
      
      await expect(
        resolver.resolveMultiple(['SECRET_1', 'MISSING'])
      ).rejects.toThrow('Secret MISSING not found');
    });

    it('should resolve partial secrets with allowPartial option', async () => {
      process.env.SECRET_1 = 'value1';
      
      const resolver = new SecretResolver();
      const secrets = await resolver.resolveMultiple(
        ['SECRET_1', 'MISSING'],
        { allowPartial: true }
      );
      
      expect(secrets).toEqual({
        SECRET_1: 'value1'
      });
    });
  });

  describe('resolveDependencyAuth', () => {
    it('should resolve per-dependency authentication', async () => {
      process.env.NPM_TOKEN = 'npm_token_123';
      process.env.GITHUB_TOKEN = 'ghp_token_456';
      
      const resolver = new SecretResolver();
      const config = {
        'registry.npmjs.org': { secretName: 'NPM_TOKEN' },
        'github.com': { secretName: 'GITHUB_TOKEN' }
      };
      
      const auth = await resolver.resolveDependencyAuth(config);
      
      expect(auth).toEqual({
        'registry.npmjs.org': 'npm_token_123',
        'github.com': 'ghp_token_456'
      });
    });

    it('should handle missing dependency auth gracefully', async () => {
      const resolver = new SecretResolver();
      const config = {
        'registry.npmjs.org': { secretName: 'MISSING_TOKEN' }
      };
      
      await expect(
        resolver.resolveDependencyAuth(config)
      ).rejects.toThrow('Secret MISSING_TOKEN not found');
    });
  });

  describe('validate', () => {
    it('should validate secret name format', () => {
      const resolver = new SecretResolver();
      
      expect(resolver.validate('VALID_NAME')).toBe(true);
      expect(resolver.validate('VALID_NAME_123')).toBe(true);
    });

    it('should reject invalid secret names', () => {
      const resolver = new SecretResolver();
      
      expect(resolver.validate('invalid-name')).toBe(false);
      expect(resolver.validate('invalid name')).toBe(false);
      expect(resolver.validate('123_INVALID')).toBe(false);
    });

    it('should validate GitHub Actions secret reference', () => {
      const resolver = new SecretResolver();
      
      expect(resolver.validate('${{ secrets.MY_SECRET }}')).toBe(true);
    });
  });

  describe('security', () => {
    it('should not log secret values', async () => {
      process.env.SECRET_TOKEN = 'secret_value';
      const consoleSpy = vi.spyOn(console, 'log');
      
      const resolver = new SecretResolver();
      await resolver.resolve('SECRET_TOKEN');
      
      const logs = consoleSpy.mock.calls.flat().join(' ');
      expect(logs).not.toContain('secret_value');
      
      consoleSpy.mockRestore();
    });

    it('should mask secrets in error messages', async () => {
      process.env.SECRET_TOKEN = 'secret_value';
      const resolver = new SecretResolver();
      
      try {
        await resolver.resolve('INVALID_SECRET');
      } catch (error) {
        expect((error as Error).message).not.toContain('secret_value');
      }
    });
  });

  describe('caching', () => {
    it('should cache resolved secrets', async () => {
      process.env.CACHED_SECRET = 'cached_value';
      const resolver = new SecretResolver({ enableCache: true });
      
      const value1 = await resolver.resolve('CACHED_SECRET');
      process.env.CACHED_SECRET = 'new_value';
      const value2 = await resolver.resolve('CACHED_SECRET');
      
      expect(value1).toBe('cached_value');
      expect(value2).toBe('cached_value'); // Should return cached value
    });

    it('should clear cache on demand', async () => {
      process.env.CACHED_SECRET = 'cached_value';
      const resolver = new SecretResolver({ enableCache: true });
      
      await resolver.resolve('CACHED_SECRET');
      process.env.CACHED_SECRET = 'new_value';
      
      resolver.clearCache();
      const value = await resolver.resolve('CACHED_SECRET');
      
      expect(value).toBe('new_value');
    });
  });
});
