/**
 * Error categorization and remediation messages
 * Provides actionable error messages with remediation steps
 */

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  INTERNAL = 'internal'
}

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  originalError: Error;
  remediation: string[];
  context?: Record<string, unknown> | undefined;
}

/**
 * Error categorizer with remediation suggestions
 */
export class ErrorCategorizer {
  /**
   * Categorize an error and provide remediation steps
   */
  categorize(error: Error, context?: Record<string, unknown>): CategorizedError {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('invalid token') ||
      message.includes('bad credentials')
    ) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        message: error.message,
        originalError: error,
        remediation: [
          'Verify that GITHUB_TOKEN is set correctly',
          'Check token has required permissions (repo, issues, contents)',
          'Ensure token has not expired',
          'For fine-grained tokens, verify repository access is granted',
          'Try regenerating the token if issues persist'
        ],
        context
      };
    }

    // Rate limit errors
    if (
      message.includes('rate limit') ||
      message.includes('api rate limit exceeded') ||
      message.includes('secondary rate limit')
    ) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        message: error.message,
        originalError: error,
        remediation: [
          'Wait for rate limit to reset (check X-RateLimit-Reset header)',
          'Consider using authenticated requests (higher rate limits)',
          'Implement request batching or caching',
          'Review API usage patterns to reduce calls',
          'For GitHub Actions, consider using GITHUB_TOKEN instead of PAT'
        ],
        context
      };
    }

    // Network errors
    if (
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('timeout') ||
      message.includes('network')
    ) {
      return {
        category: ErrorCategory.NETWORK,
        message: error.message,
        originalError: error,
        remediation: [
          'Check internet connectivity',
          'Verify API endpoint is accessible',
          'Check for firewall or proxy blocking requests',
          'Retry the operation after a short delay',
          'Verify DNS resolution is working'
        ],
        context
      };
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        category: ErrorCategory.NOT_FOUND,
        message: error.message,
        originalError: error,
        remediation: [
          'Verify the repository owner and name are correct',
          'Check if the resource exists (branch, file, issue)',
          'Ensure you have access to the repository (private repos)',
          'Verify the URL or path is correct',
          'Check if the resource was recently deleted'
        ],
        context
      };
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('403')
    ) {
      return {
        category: ErrorCategory.PERMISSION,
        message: error.message,
        originalError: error,
        remediation: [
          'Verify token has required scopes (repo, admin:org, etc.)',
          'Check repository access permissions',
          'For organization repos, verify org membership',
          'Ensure not attempting to modify protected branches',
          'Review repository settings and branch protection rules'
        ],
        context
      };
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('malformed')
    ) {
      return {
        category: ErrorCategory.VALIDATION,
        message: error.message,
        originalError: error,
        remediation: [
          'Check input data format and structure',
          'Verify required fields are provided',
          'Validate data types match API expectations',
          'Review API documentation for correct format',
          'Check for special characters that need escaping'
        ],
        context
      };
    }

    // Configuration errors
    if (message.includes('config') || message.includes('missing')) {
      return {
        category: ErrorCategory.CONFIGURATION,
        message: error.message,
        originalError: error,
        remediation: [
          'Verify all required configuration values are set',
          'Check .dependabit/config.yml exists and is valid',
          'Validate configuration schema',
          'Review example configuration in documentation',
          'Ensure environment variables are properly set'
        ],
        context
      };
    }

    // Default to internal error
    return {
      category: ErrorCategory.INTERNAL,
      message: error.message,
      originalError: error,
      remediation: [
        'This may be an internal error or unexpected condition',
        'Check error details for more information',
        'Try running the operation again',
        'If issue persists, report it with error details',
        'Check GitHub status page for service issues'
      ],
      context
    };
  }

  /**
   * Format error with remediation for display
   */
  format(categorizedError: CategorizedError): string {
    const lines = [
      `Error [${categorizedError.category}]: ${categorizedError.message}`,
      '',
      'Remediation steps:',
      ...categorizedError.remediation.map((step, i) => `  ${i + 1}. ${step}`)
    ];

    if (categorizedError.context && Object.keys(categorizedError.context).length > 0) {
      lines.push('');
      lines.push('Context:');
      for (const [key, value] of Object.entries(categorizedError.context)) {
        lines.push(`  ${key}: ${JSON.stringify(value)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Check if error is retryable
   */
  isRetryable(categorizedError: CategorizedError): boolean {
    return [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT].includes(categorizedError.category);
  }

  /**
   * Get recommended retry delay in milliseconds
   */
  getRetryDelay(categorizedError: CategorizedError): number {
    switch (categorizedError.category) {
      case ErrorCategory.RATE_LIMIT:
        return 60000; // 1 minute
      case ErrorCategory.NETWORK:
        return 5000; // 5 seconds
      default:
        return 0; // Not retryable
    }
  }
}

/**
 * Create a categorized error from an exception
 */
export function categorizeError(error: Error, context?: Record<string, unknown>): CategorizedError {
  const categorizer = new ErrorCategorizer();
  return categorizer.categorize(error, context);
}

/**
 * Format error with remediation steps
 */
export function formatError(error: Error, context?: Record<string, unknown>): string {
  const categorizer = new ErrorCategorizer();
  const categorized = categorizer.categorize(error, context);
  return categorizer.format(categorized);
}
