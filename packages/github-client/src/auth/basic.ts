/**
 * Basic authentication handler for GitHub API
 * Supports username/password or username/personal access token
 */

export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

/**
 * Handler for HTTP Basic authentication
 */
export class BasicAuthHandler {
  private username: string;
  private password: string;

  constructor(username: string, password: string) {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    if (!password || password.trim() === '') {
      throw new Error('Password cannot be empty');
    }
    this.username = username;
    this.password = password;
  }

  /**
   * Authenticate and return auth object
   */
  async authenticate(): Promise<BasicAuth> {
    return {
      type: 'basic',
      username: this.username,
      password: this.password
    };
  }

  /**
   * Get base64-encoded Basic auth header value
   */
  getAuthHeader(): string {
    const credentials = `${this.username}:${this.password}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  /**
   * Validate credentials format
   */
  validate(): boolean {
    // Check for invalid characters (newlines, etc.)
    if (this.username.includes('\n') || this.username.includes('\r')) {
      return false;
    }
    if (this.password.includes('\n') || this.password.includes('\r')) {
      return false;
    }
    return true;
  }

  /**
   * Get authentication type
   */
  getType(): string {
    return 'basic';
  }

  /**
   * Update credentials (for rotation)
   */
  updateCredentials(username: string, password: string): void {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    if (!password || password.trim() === '') {
      throw new Error('Password cannot be empty');
    }
    this.username = username;
    this.password = password;
  }

  /**
   * String representation (masks password)
   */
  toString(): string {
    return `BasicAuth(username=${this.username}, password=***)`;
  }

  /**
   * JSON representation (excludes password)
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'basic',
      username: this.username
      // password intentionally excluded
    };
  }
}
