/**
 * Secret resolution utility for GitHub Actions and environment variables
 * Safely resolves secrets from GitHub Secrets and environment variables
 */

export interface SecretResolverConfig {
  prefix?: string;
  enableCache?: boolean;
}

export interface DependencyAuthConfig {
  [domain: string]: {
    secretName: string;
  };
}

/**
 * Resolves secrets from environment variables and GitHub Secrets
 */
export class SecretResolver {
  private prefix: string;
  private enableCache: boolean;
  private cache: Map<string, string>;

  constructor(config: SecretResolverConfig = {}) {
    this.prefix = config.prefix || '';
    this.enableCache = config.enableCache ?? false;
    this.cache = new Map();
  }

  /**
   * Resolve a single secret by name
   */
  async resolve(secretName: string): Promise<string> {
    // Parse GitHub Actions secret reference format: ${{ secrets.NAME }}
    const match = secretName.match(/\$\{\{\s*secrets\.([A-Z_]+)\s*\}\}/);
    const actualName = match ? match[1] : secretName;
    const envKey = this.prefix + actualName;

    // Check cache first
    if (this.enableCache && this.cache.has(envKey)) {
      return this.cache.get(envKey)!;
    }

    // Resolve from environment
    const value = process.env[envKey];

    if (value === undefined) {
      throw new Error(`Secret ${actualName} not found`);
    }

    // Cache if enabled
    if (this.enableCache) {
      this.cache.set(envKey, value);
    }

    return value;
  }

  /**
   * Resolve multiple secrets at once
   */
  async resolveMultiple(
    secretNames: string[],
    options?: { allowPartial?: boolean }
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const errors: string[] = [];

    for (const name of secretNames) {
      try {
        result[name] = await this.resolve(name);
      } catch (error) {
        if (options?.allowPartial) {
          // Skip missing secrets when allowPartial is true
          continue;
        }
        errors.push((error as Error).message);
      }
    }

    if (errors.length > 0 && !options?.allowPartial) {
      throw new Error(errors[0]); // Throw first error
    }

    return result;
  }

  /**
   * Resolve per-dependency authentication configuration
   */
  async resolveDependencyAuth(config: DependencyAuthConfig): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    for (const [domain, authConfig] of Object.entries(config)) {
      const secretValue = await this.resolve(authConfig.secretName);
      result[domain] = secretValue;
    }

    return result;
  }

  /**
   * Validate secret name format
   */
  validate(secretName: string): boolean {
    // Handle GitHub Actions secret reference
    if (secretName.startsWith('${{')) {
      const match = secretName.match(/\$\{\{\s*secrets\.([A-Z_][A-Z0-9_]*)\s*\}\}/);
      return match !== null;
    }

    // Standard environment variable naming convention
    // Must start with letter or underscore, contain only alphanumeric and underscores
    return /^[A-Z_][A-Z0-9_]*$/.test(secretName);
  }

  /**
   * Clear the secret cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
