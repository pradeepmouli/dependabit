import {
  DependencyManifestSchema,
  DependencyEntrySchema,
  DependabitConfigSchema,
  type DependencyManifest,
  type DependencyEntry,
  type DependabitConfig
} from './schema.js';
import { ZodError } from 'zod';

/**
 * Validation error class with detailed error information
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
  }
}

/**
 * Validate a dependency manifest
 * @throws {ValidationError} if validation fails
 */
export function validateManifest(data: unknown): DependencyManifest {
  try {
    return DependencyManifestSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Manifest validation failed', error);
    }
    throw error;
  }
}

/**
 * Validate a dependency entry
 * @throws {ValidationError} if validation fails
 */
export function validateDependencyEntry(data: unknown): DependencyEntry {
  try {
    return DependencyEntrySchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Dependency entry validation failed', error);
    }
    throw error;
  }
}

/**
 * Validate a dependabit configuration
 * @throws {ValidationError} if validation fails
 */
export function validateConfig(data: unknown): DependabitConfig {
  try {
    return DependabitConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Config validation failed', error);
    }
    throw error;
  }
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidateManifest(data: unknown): {
  success: boolean;
  data?: DependencyManifest;
  error?: ValidationError;
} {
  try {
    const validated = validateManifest(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Safe validation for dependency entry
 */
export function safeValidateDependencyEntry(data: unknown): {
  success: boolean;
  data?: DependencyEntry;
  error?: ValidationError;
} {
  try {
    const validated = validateDependencyEntry(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Safe validation for config
 */
export function safeValidateConfig(data: unknown): {
  success: boolean;
  data?: DependabitConfig;
  error?: ValidationError;
} {
  try {
    const validated = validateConfig(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error };
    }
    throw error;
  }
}
