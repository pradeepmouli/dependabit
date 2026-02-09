import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAuthHandler } from '../../src/auth/basic';

describe('BasicAuthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create handler with username and password', () => {
      const handler = new BasicAuthHandler('user', 'pass');
      expect(handler).toBeInstanceOf(BasicAuthHandler);
    });

    it('should throw error for empty username', () => {
      expect(() => new BasicAuthHandler('', 'pass')).toThrow('Username cannot be empty');
    });

    it('should throw error for empty password', () => {
      expect(() => new BasicAuthHandler('user', '')).toThrow('Password cannot be empty');
    });
  });

  describe('authenticate', () => {
    it('should return auth object with credentials', async () => {
      const handler = new BasicAuthHandler('testuser', 'testpass');
      const auth = await handler.authenticate();

      expect(auth).toEqual({
        type: 'basic',
        username: 'testuser',
        password: 'testpass'
      });
    });

    it('should encode credentials properly', async () => {
      const handler = new BasicAuthHandler('user@example.com', 'p@ssw0rd!');
      const auth = await handler.authenticate();

      expect(auth.username).toBe('user@example.com');
      expect(auth.password).toBe('p@ssw0rd!');
    });
  });

  describe('getAuthHeader', () => {
    it('should generate base64 encoded auth header', () => {
      const handler = new BasicAuthHandler('user', 'pass');
      const header = handler.getAuthHeader();

      // "user:pass" in base64 is "dXNlcjpwYXNz"
      expect(header).toBe('Basic dXNlcjpwYXNz');
    });

    it('should handle special characters in credentials', () => {
      const handler = new BasicAuthHandler('user@example.com', 'p@ss:word');
      const header = handler.getAuthHeader();

      expect(header).toMatch(/^Basic [A-Za-z0-9+/=]+$/);
    });
  });

  describe('validate', () => {
    it('should validate credentials format', () => {
      const handler = new BasicAuthHandler('user', 'pass');
      expect(handler.validate()).toBe(true);
    });

    it('should reject username with invalid characters', () => {
      const handler = new BasicAuthHandler('user\n', 'pass');
      expect(handler.validate()).toBe(false);
    });

    it('should reject password with newline', () => {
      const handler = new BasicAuthHandler('user', 'pass\n');
      expect(handler.validate()).toBe(false);
    });

    it('should accept email as username', () => {
      const handler = new BasicAuthHandler('user@example.com', 'pass');
      expect(handler.validate()).toBe(true);
    });
  });

  describe('getType', () => {
    it('should return basic type', () => {
      const handler = new BasicAuthHandler('user', 'pass');
      expect(handler.getType()).toBe('basic');
    });
  });

  describe('credential rotation', () => {
    it('should allow password update', () => {
      const handler = new BasicAuthHandler('user', 'oldpass');
      handler.updateCredentials('user', 'newpass');

      const header = handler.getAuthHeader();
      expect(header).toContain(Buffer.from('user:newpass').toString('base64'));
    });

    it('should throw error on empty password update', () => {
      const handler = new BasicAuthHandler('user', 'pass');
      expect(() => handler.updateCredentials('user', '')).toThrow('Password cannot be empty');
    });
  });

  describe('security', () => {
    it('should not expose password in toString', () => {
      const handler = new BasicAuthHandler('user', 'secretpass');
      const str = handler.toString();

      expect(str).not.toContain('secretpass');
      expect(str).toContain('***');
    });

    it('should not expose password in JSON', () => {
      const handler = new BasicAuthHandler('user', 'secretpass');
      const json = JSON.stringify(handler);

      expect(json).not.toContain('secretpass');
    });
  });
});
