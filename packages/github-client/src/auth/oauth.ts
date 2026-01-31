/**
 * OAuth 2.0 authentication handler for GitHub
 * Supports authorization code flow and token refresh
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthAuth {
  type: 'oauth';
  token: string;
  tokenType: string;
  scope?: string;
  expiresIn?: number;
  refreshToken?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
}

/**
 * Handler for OAuth 2.0 authentication
 */
export class OAuthHandler {
  private config: OAuthConfig;
  private readonly GITHUB_OAUTH_URL = 'https://github.com/login/oauth';

  constructor(config: OAuthConfig) {
    if (!config.clientId || config.clientId.trim() === '') {
      throw new Error('clientId is required');
    }
    if (!config.clientSecret || config.clientSecret.trim() === '') {
      throw new Error('clientSecret is required');
    }
    this.config = config;
  }

  /**
   * Exchange authorization code for access token
   */
  async authenticate(code: string): Promise<OAuthAuth> {
    if (!code || code.trim() === '') {
      throw new Error('Authorization code is required');
    }

    const tokenResponse = await this.exchangeCodeForToken(code);

    return {
      type: 'oauth',
      token: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      scope: tokenResponse.scope,
      expiresIn: tokenResponse.expires_in,
      refreshToken: tokenResponse.refresh_token
    };
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(scopes: string[], state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' ')
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.GITHUB_OAUTH_URL}/authorize?${params.toString()}`;
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthAuth> {
    if (!refreshToken || refreshToken.trim() === '') {
      throw new Error('Refresh token is required');
    }

    const tokenResponse = await this.performTokenRefresh(refreshToken);

    return {
      type: 'oauth',
      token: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      scope: tokenResponse.scope,
      expiresIn: tokenResponse.expires_in
    };
  }

  /**
   * Validate OAuth configuration
   */
  validate(): boolean {
    try {
      // Validate redirect URI format
      new URL(this.config.redirectUri);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get authentication type
   */
  getType(): string {
    return 'oauth';
  }

  /**
   * Exchange authorization code for token (internal)
   */
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(`${this.GITHUB_OAUTH_URL}/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data;
  }

  /**
   * Perform token refresh (internal)
   */
  private async performTokenRefresh(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.GITHUB_OAUTH_URL}/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data;
  }
}
