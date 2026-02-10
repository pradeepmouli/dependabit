/**
 * Authentication support for GitHub API client
 * Provides token, OAuth, and basic authentication methods
 */

import { TokenAuthHandler, type TokenAuth } from './auth/token.js';
import { OAuthHandler, type OAuthAuth, type OAuthConfig } from './auth/oauth.js';
import { BasicAuthHandler, type BasicAuth } from './auth/basic.js';

export type AuthType = 'token' | 'oauth' | 'basic';
export type AuthResult = TokenAuth | OAuthAuth | BasicAuth;

export interface AuthConfig {
  type: AuthType;
  token?: string;
  oauth?: OAuthConfig;
  username?: string;
  password?: string;
}

/**
 * Authentication manager that supports multiple auth methods
 */
export class AuthManager {
  private handler: TokenAuthHandler | OAuthHandler | BasicAuthHandler;

  constructor(config: AuthConfig) {
    switch (config.type) {
      case 'token':
        if (!config.token) {
          throw new Error('Token is required for token authentication');
        }
        this.handler = new TokenAuthHandler(config.token);
        break;

      case 'oauth':
        if (!config.oauth) {
          throw new Error('OAuth config is required for OAuth authentication');
        }
        this.handler = new OAuthHandler(config.oauth);
        break;

      case 'basic':
        if (!config.username || !config.password) {
          throw new Error('Username and password are required for basic authentication');
        }
        this.handler = new BasicAuthHandler(config.username, config.password);
        break;

      default:
        throw new Error(`Unsupported authentication type: ${config.type}`);
    }
  }

  /**
   * Perform authentication
   */
  async authenticate(code?: string): Promise<AuthResult> {
    if (this.handler instanceof OAuthHandler && code) {
      return this.handler.authenticate(code);
    }
    if (this.handler instanceof TokenAuthHandler || this.handler instanceof BasicAuthHandler) {
      return this.handler.authenticate();
    }
    throw new Error('Invalid authentication flow');
  }

  /**
   * Validate authentication configuration
   */
  validate(): boolean {
    return this.handler.validate();
  }

  /**
   * Get authentication type
   */
  getType(): string {
    return this.handler.getType();
  }

  /**
   * Get underlying handler
   */
  getHandler(): TokenAuthHandler | OAuthHandler | BasicAuthHandler {
    return this.handler;
  }
}

/**
 * Create authentication manager from config
 */
export function createAuth(config: AuthConfig): AuthManager {
  return new AuthManager(config);
}

// Re-export handler classes and types
export { TokenAuthHandler, type TokenAuth } from './auth/token.js';
export { OAuthHandler, type OAuthAuth, type OAuthConfig } from './auth/oauth.js';
export { BasicAuthHandler, type BasicAuth } from './auth/basic.js';
