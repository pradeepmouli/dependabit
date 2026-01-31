import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAction } from '../../src/actions/validate.js';
import type { DependencyManifest, DependabitConfig } from '@dependabit/manifest';

// Mock the manifest module
vi.mock('@dependabit/manifest', async () => {
  const actual = await vi.importActual('@dependabit/manifest');
  return {
    ...actual,
    readManifest: vi.fn(),
    validateManifest: vi.fn(),
    readConfig: vi.fn()
  };
});

describe('Validate Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAction', () => {
    it('should validate a valid manifest successfully', async () => {
      const { readManifest, validateManifest } = await import('@dependabit/manifest');
      
      const validManifest: DependencyManifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot',
          llmModel: 'gpt-4'
        },
        repository: {
          owner: 'test-owner',
          name: 'test-repo',
          branch: 'main',
          commit: 'abc123'
        },
        dependencies: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            url: 'https://github.com/microsoft/TypeScript',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            name: 'TypeScript',
            currentStateHash: 'hash1',
            detectionMethod: 'package-json',
            detectionConfidence: 1.0,
            detectedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            referencedIn: [{ file: 'package.json', line: 15 }],
            changeHistory: []
          }
        ],
        statistics: {
          totalDependencies: 1,
          byType: { 'reference-implementation': 1 },
          byAccessMethod: { 'github-api': 1 },
          byDetectionMethod: { 'package-json': 1 },
          averageConfidence: 1.0
        }
      };

      vi.mocked(readManifest).mockResolvedValue(validManifest);
      vi.mocked(validateManifest).mockReturnValue(validManifest);

      const result = await validateAction('.dependabit/manifest.json');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(readManifest).toHaveBeenCalledWith('.dependabit/manifest.json');
    });

    it('should detect schema validation errors', async () => {
      const { readManifest, validateManifest } = await import('@dependabit/manifest');
      
      const invalidManifest = {
        version: '2.0.0', // Invalid version
        dependencies: []
      };

      vi.mocked(readManifest).mockResolvedValue(invalidManifest as any);
      vi.mocked(validateManifest).mockImplementation(() => {
        throw new Error('Invalid manifest version');
      });

      const result = await validateAction('.dependabit/manifest.json');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid manifest version');
    });

    it('should detect duplicate dependency IDs', async () => {
      const { readManifest, validateManifest } = await import('@dependabit/manifest');
      
      const duplicateManifest: DependencyManifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot'
        },
        repository: {
          owner: 'test',
          name: 'test',
          branch: 'main',
          commit: 'abc'
        },
        dependencies: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            url: 'https://github.com/owner/repo1',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            name: 'Repo1',
            currentStateHash: 'hash1',
            detectionMethod: 'manual',
            detectionConfidence: 1.0,
            detectedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            referencedIn: [],
            changeHistory: []
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440000', // Duplicate ID
            url: 'https://github.com/owner/repo2',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            name: 'Repo2',
            currentStateHash: 'hash2',
            detectionMethod: 'manual',
            detectionConfidence: 1.0,
            detectedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            referencedIn: [],
            changeHistory: []
          }
        ],
        statistics: {
          totalDependencies: 2,
          byType: {'reference-implementation': 2},
          byAccessMethod: {'github-api': 2},
          byDetectionMethod: {'manual': 2},
          averageConfidence: 1.0
        }
      };

      vi.mocked(readManifest).mockResolvedValue(duplicateManifest);
      vi.mocked(validateManifest).mockReturnValue(duplicateManifest);

      const result = await validateAction('.dependabit/manifest.json');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('duplicate') || e.includes('Duplicate'))).toBe(true);
    });

    it('should detect invalid URLs', async () => {
      const { readManifest, validateManifest } = await import('@dependabit/manifest');
      
      const invalidUrlManifest: any = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot'
        },
        repository: {
          owner: 'test',
          name: 'test',
          branch: 'main',
          commit: 'abc'
        },
        dependencies: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            url: 'not-a-valid-url',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            name: 'Invalid',
            currentStateHash: 'hash1',
            detectionMethod: 'manual',
            detectionConfidence: 1.0,
            detectedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            referencedIn: [],
            changeHistory: []
          }
        ],
        statistics: {
          totalDependencies: 1,
          byType: {'reference-implementation': 1},
          byAccessMethod: {'github-api': 1},
          byDetectionMethod: {'manual': 1},
          averageConfidence: 1.0
        }
      };

      vi.mocked(readManifest).mockResolvedValue(invalidUrlManifest);
      vi.mocked(validateManifest).mockImplementation(() => {
        throw new Error('Invalid URL format');
      });

      const result = await validateAction('.dependabit/manifest.json');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('URL') || e.includes('url'))).toBe(true);
    });

    it('should validate with config file when provided', async () => {
      const { readManifest, readConfig, validateManifest } = await import('@dependabit/manifest');
      
      const manifest: DependencyManifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot'
        },
        repository: {
          owner: 'test',
          name: 'test',
          branch: 'main',
          commit: 'abc'
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

      const config: DependabitConfig = {
        version: '1',
        schedule: { interval: 'daily', timezone: 'UTC' }
      };

      vi.mocked(readManifest).mockResolvedValue(manifest);
      vi.mocked(readConfig).mockResolvedValue(config);
      vi.mocked(validateManifest).mockReturnValue(manifest);

      const result = await validateAction('.dependabit/manifest.json', '.dependabit/config.yml');

      expect(result.valid).toBe(true);
      expect(readConfig).toHaveBeenCalledWith('.dependabit/config.yml');
    });
  });
});
