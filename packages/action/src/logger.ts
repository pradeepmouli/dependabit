import * as core from '@actions/core';

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  correlationId?: string;
  enableDebug?: boolean;
}

/**
 * Structured JSON logger for GitHub Actions
 */
export class Logger {
  private correlationId: string;
  private enableDebug: boolean;

  constructor(config: LoggerConfig = {}) {
    this.correlationId = config.correlationId || this.generateCorrelationId();
    this.enableDebug = config.enableDebug ?? false;
  }

  /**
   * Generate a unique correlation ID for operation tracing
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Format log entry as JSON
   */
  private formatEntry(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      ...data
    };

    return JSON.stringify(entry);
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.enableDebug) {
      core.debug(this.formatEntry(LogLevel.DEBUG, message, data));
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    core.info(this.formatEntry(LogLevel.INFO, message, data));
  }

  /**
   * Log warning message
   */
  warning(message: string, data?: Record<string, unknown>): void {
    core.warning(this.formatEntry(LogLevel.WARNING, message, data));
  }

  /**
   * Log error message
   */
  error(message: string, data?: Record<string, unknown>): void {
    core.error(this.formatEntry(LogLevel.ERROR, message, data));
  }

  /**
   * Start a log group
   */
  startGroup(name: string): void {
    core.startGroup(name);
  }

  /**
   * End a log group
   */
  endGroup(): void {
    core.endGroup();
  }

  /**
   * Get correlation ID
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Create a child logger with the same correlation ID
   */
  child(data?: Record<string, unknown>): Logger {
    const logger = new Logger({
      correlationId: this.correlationId,
      enableDebug: this.enableDebug
    });

    if (data) {
      // Store additional context for all future logs
      Object.assign(logger, data);
    }

    return logger;
  }

  /**
   * Log LLM interaction
   */
  logLLMInteraction(data: {
    provider: string;
    model?: string;
    prompt: string;
    response: string;
    tokens?: number;
    latencyMs?: number;
  }): void {
    this.info('LLM interaction', {
      type: 'llm_interaction',
      ...data
    });
  }

  /**
   * Log API call
   */
  logAPICall(data: {
    endpoint: string;
    method: string;
    statusCode?: number;
    latencyMs?: number;
    rateLimit?: {
      remaining: number;
      limit: number;
      reset: number;
    };
  }): void {
    this.info('API call', {
      type: 'api_call',
      ...data
    });
  }

  /**
   * Log operation duration
   */
  logDuration(operation: string, durationMs: number, data?: Record<string, unknown>): void {
    this.info(`Operation completed: ${operation}`, {
      type: 'operation_duration',
      operation,
      durationMs,
      ...data
    });
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Measure and log operation duration
 */
export async function withTiming<T>(
  logger: Logger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.logDuration(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.logDuration(operation, duration, {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
