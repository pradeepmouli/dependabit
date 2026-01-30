import { describe, it, expect } from 'vitest';
import {
  DependencyManifestSchema,
  DependencyEntrySchema,
  DependabitConfigSchema,
  AccessMethodSchema,
  DependencyTypeSchema,
  DetectionMethodSchema,
  SeveritySchema
} from '../src/schema.js';

describe('Schema Tests', () => {
  describe('AccessMethodSchema', () => {
    it('should accept valid access methods', () => {
      expect(AccessMethodSchema.parse('context7')).toBe('context7');
      expect(AccessMethodSchema.parse('arxiv')).toBe('arxiv');
      expect(AccessMethodSchema.parse('openapi')).toBe('openapi');
      expect(AccessMethodSchema.parse('github-api')).toBe('github-api');
      expect(AccessMethodSchema.parse('http')).toBe('http');
    });

    it('should reject invalid access methods', () => {
      expect(() => AccessMethodSchema.parse('invalid')).toThrow();
    });
  });

  describe('DependencyTypeSchema', () => {
    it('should accept valid dependency types', () => {
      expect(DependencyTypeSchema.parse('reference-implementation')).toBe(
        'reference-implementation'
      );
      expect(DependencyTypeSchema.parse('schema')).toBe('schema');
      expect(DependencyTypeSchema.parse('documentation')).toBe('documentation');
    });

    it('should reject invalid dependency types', () => {
      expect(() => DependencyTypeSchema.parse('invalid')).toThrow();
    });
  });

  describe('DetectionMethodSchema', () => {
    it('should accept valid detection methods', () => {
      expect(DetectionMethodSchema.parse('llm-analysis')).toBe('llm-analysis');
      expect(DetectionMethodSchema.parse('manual')).toBe('manual');
      expect(DetectionMethodSchema.parse('package-json')).toBe('package-json');
    });
  });

  describe('SeveritySchema', () => {
    it('should accept valid severity levels', () => {
      expect(SeveritySchema.parse('breaking')).toBe('breaking');
      expect(SeveritySchema.parse('major')).toBe('major');
      expect(SeveritySchema.parse('minor')).toBe('minor');
    });
  });

  describe('DependencyEntrySchema', () => {
    it('should validate a complete dependency entry', () => {
      const entry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        description: 'TypeScript compiler',
        currentVersion: '5.9.3',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'package-json',
        detectionConfidence: 1.0,
        detectedAt: '2026-01-29T10:30:00Z',
        lastChecked: '2026-01-29T10:30:00Z',
        auth: undefined,
        referencedIn: [
          {
            file: 'package.json',
            line: 15,
            context: '"typescript": "^5.9.3"'
          }
        ],
        changeHistory: []
      };

      const result = DependencyEntrySchema.parse(entry);
      expect(result.id).toBe(entry.id);
      expect(result.name).toBe('TypeScript');
    });

    it('should require all mandatory fields', () => {
      expect(() =>
        DependencyEntrySchema.parse({
          url: 'https://example.com'
        })
      ).toThrow();
    });

    it('should validate UUID format', () => {
      const entry = {
        id: 'not-a-uuid',
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

      expect(() => DependencyEntrySchema.parse(entry)).toThrow();
    });

    it('should validate URL format', () => {
      const entry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'not-a-url',
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

      expect(() => DependencyEntrySchema.parse(entry)).toThrow();
    });

    it('should validate confidence range', () => {
      const entry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.5,
        detectedAt: '2026-01-29T10:30:00Z',
        lastChecked: '2026-01-29T10:30:00Z',
        referencedIn: []
      };

      expect(() => DependencyEntrySchema.parse(entry)).toThrow();
    });
  });

  describe('DependencyManifestSchema', () => {
    it('should validate a complete manifest', () => {
      const manifest = {
        version: '1.0.0',
        generatedAt: '2026-01-29T10:30:00Z',
        generatedBy: {
          action: 'dependabit',
          version: '1.0.0',
          llmProvider: 'github-copilot',
          llmModel: 'gpt-4'
        },
        repository: {
          owner: 'pradeepmouli',
          name: 'dependabit',
          branch: 'main',
          commit: 'abc123def456'
        },
        dependencies: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            url: 'https://github.com/microsoft/TypeScript',
            type: 'reference-implementation',
            accessMethod: 'github-api',
            name: 'TypeScript',
            currentStateHash: 'sha256:abc123',
            detectionMethod: 'package-json',
            detectionConfidence: 1.0,
            detectedAt: '2026-01-29T10:30:00Z',
            lastChecked: '2026-01-29T10:30:00Z',
            referencedIn: []
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

      const result = DependencyManifestSchema.parse(manifest);
      expect(result.version).toBe('1.0.0');
      expect(result.dependencies).toHaveLength(1);
    });

    it('should require correct version', () => {
      const manifest = {
        version: '2.0.0',
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

      expect(() => DependencyManifestSchema.parse(manifest)).toThrow();
    });
  });

  describe('DependabitConfigSchema', () => {
    it('should validate a complete config', () => {
      const config = {
        version: '1',
        llm: {
          provider: 'github-copilot',
          model: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.3
        },
        schedule: {
          interval: 'daily',
          time: '02:00',
          timezone: 'UTC'
        },
        issues: {
          labels: ['dependabit', 'dependency-update'],
          assignees: ['pradeepmouli'],
          titleTemplate: '[dependabit] {name}: {change}'
        },
        monitoring: {
          enabled: true,
          autoUpdate: true,
          falsePositiveThreshold: 0.1
        }
      };

      const result = DependabitConfigSchema.parse(config);
      expect(result.version).toBe('1');
      expect(result.llm?.provider).toBe('github-copilot');
    });

    it('should apply defaults', () => {
      const config = {
        version: '1'
      };

      const result = DependabitConfigSchema.parse(config);
      expect(result.schedule.interval).toBe('daily');
      expect(result.schedule.timezone).toBe('UTC');
    });

    it('should validate schedule time format', () => {
      const config = {
        version: '1',
        schedule: {
          interval: 'daily',
          time: '25:00',
          timezone: 'UTC'
        }
      };

      expect(() => DependabitConfigSchema.parse(config)).toThrow();
    });

    it('should validate LLM temperature range', () => {
      const config = {
        version: '1',
        llm: {
          provider: 'github-copilot',
          temperature: 3.0
        }
      };

      expect(() => DependabitConfigSchema.parse(config)).toThrow();
    });
  });
});
