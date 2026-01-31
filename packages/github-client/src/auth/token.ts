/**
 * Token authentication handler for GitHub API
 * Supports GitHub PAT tokens, fine-grained tokens, and API keys
 */

export interface TokenAuth {
  type: 'token';
  token: string;
}

/**
 * Handler for token-based authentication (GitHub PAT, API keys)
 */
export class TokenAuthHandler {
  private token: string;
  private readonly GITHUB_TOKEN_PREFIXES = [
    'ghp_', // Personal Access Token
    'gho_', // OAuth Access Token
    'ghu_', // User-to-Server Token
    'ghs_', // Server-to-Server Token
    'ghr_', // Refresh Token
    'github_pat_' // Fine-grained PAT
  ];

  constructor(token: string) {
    if (!token || token.trim() === '') {
      throw new Error('Token cannot be empty');
    }
    this.token = token;
  }

  /**
   * Authenticate and return auth object
   */
  async authenticate(): Promise<TokenAuth> {
    return {
      type: 'token',
      token: this.token
    };
  }

  /**
   * Validate token format
   */
  validate(): boolean {
    // Check if token starts with valid GitHub prefix or is an API key
    const hasValidPrefix = this.GITHUB_TOKEN_PREFIXES.some(prefix =>
      this.token.startsWith(prefix)
    );

    // Allow any token format, but prefer GitHub token prefixes
    return hasValidPrefix || this.token.length > 0;
  }

  /**
   * Get authentication type
   */
  getType(): string {
    return 'token';
  }

  /**
   * Update token (for rotation)
   */
  updateToken(newToken: string): void {
    if (!newToken || newToken.trim() === '') {
      throw new Error('Token cannot be empty');
    }
    this.token = newToken;
  }

  /**
   * Get current token
   * 
   * @warning This method exposes the raw token value. Use with caution and avoid
   * logging or displaying the token. Prefer using authenticate() for auth operations.
   */
  getToken(): string {
    return this.token;
  }
}
