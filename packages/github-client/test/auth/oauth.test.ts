import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthHandler } from '../../src/auth/oauth';

describe('OAuthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create handler with client credentials', () => {
      const config = {
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      expect(handler).toBeInstanceOf(OAuthHandler);
    });

    it('should throw error for missing clientId', () => {
      const config = {
        clientId: '',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      expect(() => new OAuthHandler(config)).toThrow('clientId is required');
    });

    it('should throw error for missing clientSecret', () => {
      const config = {
        clientId: 'client',
        clientSecret: '',
        redirectUri: 'http://localhost:3000/callback'
      };
      expect(() => new OAuthHandler(config)).toThrow('clientSecret is required');
    });
  });

  describe('authenticate', () => {
    it('should exchange code for access token', async () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      // Mock the token exchange
      vi.spyOn(handler as any, 'exchangeCodeForToken').mockResolvedValue({
        access_token: 'gho_accesstoken123',
        token_type: 'bearer',
        scope: 'repo'
      });

      const auth = await handler.authenticate('test_code');
      
      expect(auth).toEqual({
        type: 'oauth',
        token: 'gho_accesstoken123',
        tokenType: 'bearer',
        scope: 'repo'
      });
    });

    it('should throw error for invalid code', async () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      await expect(handler.authenticate('')).rejects.toThrow('Authorization code is required');
    });

    it('should handle token exchange failure', async () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      vi.spyOn(handler as any, 'exchangeCodeForToken').mockRejectedValue(
        new Error('Invalid authorization code')
      );

      await expect(handler.authenticate('bad_code')).rejects.toThrow('Invalid authorization code');
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL with scopes', () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      const url = handler.getAuthorizationUrl(['repo', 'user']);
      
      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=test_client');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
      expect(url).toContain('scope=repo+user'); // URLSearchParams uses + for spaces
    });

    it('should include state parameter for CSRF protection', () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      const url = handler.getAuthorizationUrl(['repo'], 'random_state_123');
      
      expect(url).toContain('state=random_state_123');
    });
  });

  describe('refreshToken', () => {
    it('should refresh expired access token', async () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      vi.spyOn(handler as any, 'performTokenRefresh').mockResolvedValue({
        access_token: 'gho_newtoken456',
        token_type: 'bearer',
        scope: 'repo'
      });

      const result = await handler.refreshToken('refresh_token_123');
      
      expect(result).toEqual({
        type: 'oauth',
        token: 'gho_newtoken456',
        tokenType: 'bearer',
        scope: 'repo'
      });
    });

    it('should throw error for missing refresh token', async () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      await expect(handler.refreshToken('')).rejects.toThrow('Refresh token is required');
    });
  });

  describe('validate', () => {
    it('should validate OAuth configuration', () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      expect(handler.validate()).toBe(true);
    });

    it('should fail validation for invalid redirect URI', () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'invalid-uri'
      };
      const handler = new OAuthHandler(config);
      
      expect(handler.validate()).toBe(false);
    });
  });

  describe('getType', () => {
    it('should return oauth type', () => {
      const config = {
        clientId: 'test_client',
        clientSecret: 'test_secret',
        redirectUri: 'http://localhost:3000/callback'
      };
      const handler = new OAuthHandler(config);
      
      expect(handler.getType()).toBe('oauth');
    });
  });
});
