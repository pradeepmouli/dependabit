import { describe, it, expect } from 'vitest';
import {
  validateManifest,
  validateDependencyEntry,
  validateConfig,
  safeValidateManifest,
  ValidationError
} from '../src/validator.js';

describe('Validator Tests', () => {
  describe('validateManifest', () => {
    it('should validate a valid manifest', () => {
      const manifest = {
        version: '1.0.0',
        generatedAt: '2026-01-29T10:30:00Z',
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot'
        },
        repository: {
          owner: 'pradeepmouli',
          name: 'dependabit',
          branch: 'main',
          commit: 'abc123'
        },
        dependencies: [],
        statistics: {
          totalDependencies: 0,
          byType: {},
          byAccessMethod: {},
          byDetectionMethod: {},
          averageConfidence: 0
        }
      };

      const result = validateManifest(manifest);
      expect(result.version).toBe('1.0.0');
    });

    it('should throw ValidationError for invalid manifest', () => {
      const invalid = {
        version: '2.0.0'
      };

      expect(() => validateManifest(invalid)).toThrow(ValidationError);
    });

    it('should provide formatted error messages', () => {
      const invalid = {
        version: '1.0.0'
      };

      try {
        validateManifest(invalid);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        const formatted = validationError.getFormattedErrors();
        expect(formatted.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateDependencyEntry', () => {
    it('should validate a valid dependency entry', () => {
      const entry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-29T10:30:00Z',
        lastChecked: '2026-01-29T10:30:00Z',
        referencedIn: []
      };

      const result = validateDependencyEntry(entry);
      expect(result.name).toBe('TypeScript');
    });

    it('should throw ValidationError for invalid entry', () => {
      const invalid = {
        url: 'https://example.com'
      };

      expect(() => validateDependencyEntry(invalid)).toThrow(ValidationError);
    });
  });

  describe('validateConfig', () => {
    it('should validate a valid config', () => {
      const config = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        }
      };

      const result = validateConfig(config);
      expect(result.version).toBe('1');
    });

    it('should throw ValidationError for invalid config', () => {
      const invalid = {
        version: '2'
      };

      expect(() => validateConfig(invalid)).toThrow(ValidationError);
    });
  });

  describe('safeValidateManifest', () => {
    it('should return success for valid manifest', () => {
      const manifest = {
        version: '1.0.0',
        generatedAt: '2026-01-29T10:30:00Z',
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot'
        },
        repository: {
          owner: 'pradeepmouli',
          name: 'dependabit',
          branch: 'main',
          commit: 'abc123'
        },
        dependencies: [],
        statistics: {
          totalDependencies: 0,
          byType: {},
          byAccessMethod: {},
          byDetectionMethod: {},
          averageConfidence: 0
        }
      };

      const result = safeValidateManifest(manifest);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid manifest', () => {
      const invalid = {
        version: '2.0.0'
      };

      const result = safeValidateManifest(invalid);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });
});
