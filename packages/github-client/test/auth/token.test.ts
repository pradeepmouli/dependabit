import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenAuthHandler } from '../../src/auth/token';

describe('TokenAuthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create handler with GitHub PAT token', () => {
      const token = 'ghp_testtoken123';
      const handler = new TokenAuthHandler(token);
      expect(handler).toBeInstanceOf(TokenAuthHandler);
    });

    it('should create handler with API key', () => {
      const token = 'api_key_12345';
      const handler = new TokenAuthHandler(token);
      expect(handler).toBeInstanceOf(TokenAuthHandler);
    });

    it('should throw error for empty token', () => {
      expect(() => new TokenAuthHandler('')).toThrow('Token cannot be empty');
    });
  });

  describe('authenticate', () => {
    it('should return auth object with token', async () => {
      const token = 'ghp_testtoken123';
      const handler = new TokenAuthHandler(token);
      const auth = await handler.authenticate();

      expect(auth).toEqual({
        type: 'token',
        token: token
      });
    });

    it('should validate token format for GitHub PAT', async () => {
      const token = 'ghp_validtoken123456';
      const handler = new TokenAuthHandler(token);
      const auth = await handler.authenticate();

      expect(auth.token).toBe(token);
    });

    it('should accept fine-grained tokens', async () => {
      const token = 'github_pat_validtoken123456';
      const handler = new TokenAuthHandler(token);
      const auth = await handler.authenticate();

      expect(auth.token).toBe(token);
    });
  });

  describe('validate', () => {
    it('should validate token format', () => {
      const handler = new TokenAuthHandler('ghp_test123');
      expect(handler.validate()).toBe(true);
    });

    it('should accept any non-empty token', () => {
      // Token validation is lenient - allows API keys without GitHub prefix
      const handler = new TokenAuthHandler('api_key_123');
      expect(handler.validate()).toBe(true);
    });

    it('should accept various GitHub token prefixes', () => {
      const validPrefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_', 'github_pat_'];

      validPrefixes.forEach((prefix) => {
        const handler = new TokenAuthHandler(`${prefix}test123`);
        expect(handler.validate()).toBe(true);
      });
    });
  });

  describe('getType', () => {
    it('should return token type', () => {
      const handler = new TokenAuthHandler('ghp_test');
      expect(handler.getType()).toBe('token');
    });
  });

  describe('token rotation', () => {
    it('should allow token update', () => {
      const handler = new TokenAuthHandler('ghp_old');
      handler.updateToken('ghp_new');
      expect(handler.getToken()).toBe('ghp_new');
    });

    it('should throw error on empty token update', () => {
      const handler = new TokenAuthHandler('ghp_test');
      expect(() => handler.updateToken('')).toThrow('Token cannot be empty');
    });
  });
});
