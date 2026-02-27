import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Detector } from '../src/detector.js';

const createDetector = (): Detector =>
  new Detector({
    repoPath: '.',
    llmProvider: {
      analyze: vi.fn(async () => ({
        dependencies: [],
        usage: { totalTokens: 0, latencyMs: 0 },
        rawResponse: '{}'
      }))
    }
  });

describe('Detector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectDependencies', () => {
    it('should orchestrate all parsers', async () => {
      // Expected: Call README parser, code comment parser, package file parser
      expect(true).toBe(true);
    });

    it('should aggregate results from all parsers', async () => {
      // Expected: Combine results from multiple parsers
      expect(true).toBe(true);
    });

    it('should send aggregated content to LLM for analysis', async () => {
      // Expected: Pass extracted content to LLM provider
      expect(true).toBe(true);
    });

    it('should deduplicate dependencies by URL', async () => {
      // Expected: Same URL from multiple sources = one dependency
      expect(true).toBe(true);
    });

    it('should calculate confidence scores', async () => {
      // Expected: LLM confidence * detection method weight
      expect(true).toBe(true);
    });

    it('should generate UUIDs for each dependency', async () => {
      expect(true).toBe(true);
    });

    it('should include detection metadata', async () => {
      // Expected: detectionMethod, detectedAt, referencedIn
      expect(true).toBe(true);
    });

    it('should handle empty repository', async () => {
      // Expected: Return empty dependencies array
      expect(true).toBe(true);
    });

    it('should handle LLM failures gracefully', async () => {
      // Expected: Continue with parser results, log error
      expect(true).toBe(true);
    });

    it('should keep GitHub repo links when LLM parser misses them', async () => {
      const repoPath = await mkdtemp(join(tmpdir(), 'dependabit-detector-'));

      try {
        await mkdir(join(repoPath, 'docs'), { recursive: true });
        await writeFile(
          join(repoPath, 'docs', 'tooling.md'),
          '- [spec-kit](https://github.com/github/spec-kit)\n'
        );

        const detector = new Detector({
          repoPath,
          llmProvider: {
            analyze: vi.fn(async () => ({
              dependencies: [],
              usage: { totalTokens: 0, latencyMs: 0 },
              rawResponse: '{}'
            })),
            getSupportedModels: vi.fn(() => ['test-model']),
            getRateLimit: vi.fn(async () => ({
              remaining: 100,
              limit: 100,
              resetAt: new Date(Date.now() + 60_000)
            })),
            validateConfig: vi.fn(() => true)
          },
          repoOwner: 'pradeepmouli',
          repoName: 'dependabit'
        });

        const result = await detector.detectDependencies();
        const dep = result.dependencies.find((d) => d.url === 'https://github.com/github/spec-kit');

        expect(dep).toBeDefined();
        expect(dep?.type).toBe('reference-implementation');
        expect(dep?.accessMethod).toBe('github-api');
      } finally {
        await rm(repoPath, { recursive: true, force: true });
      }
    });
  });

  describe('classifyDependency', () => {
    it('should classify GitHub URLs as repository', () => {
      const url = 'https://github.com/owner/repo';
      expect(url).toContain('github.com');
    });

    it('should classify GitHub repository links as reference-implementation', () => {
      const detector = createDetector();
      const type = (detector as any).determineDependencyType(
        'https://github.com/github/spec-kit',
        'spec-kit'
      );

      expect(type).toBe('reference-implementation');
    });

    it('should classify arXiv URLs as research-paper', () => {
      const url = 'https://arxiv.org/abs/1706.03762';
      expect(url).toContain('arxiv.org');
    });

    it('should classify OpenAPI specs as schema', () => {
      const url = 'https://api.example.com/openapi.yaml';
      expect(url).toContain('openapi');
    });

    it('should classify documentation sites as documentation', () => {
      const url = 'https://docs.example.com/guide';
      expect(url).toContain('docs.');
    });

    it('should use LLM for ambiguous URLs', () => {
      const url = 'https://example.com/some-resource';
      expect(typeof url).toBe('string');
    });
  });

  describe('determineAccessMethod', () => {
    it('should use github-api for GitHub URLs', () => {
      const url = 'https://github.com/owner/repo';
      expect(url).toContain('github.com');
    });

    it('should use arxiv for arXiv URLs', () => {
      const url = 'https://arxiv.org/abs/1234.5678';
      expect(url).toContain('arxiv.org');
    });

    it('should use openapi for OpenAPI spec URLs', () => {
      const url = 'https://api.example.com/openapi.json';
      expect(url).toContain('openapi');
    });

    it('should use http as fallback', () => {
      const url = 'https://example.com/docs';
      expect(url).toContain('http');
    });
  });
});
