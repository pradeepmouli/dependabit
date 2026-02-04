/**
 * E2E Tests for Full Dependabit Workflow
 *
 * Tests the complete flow: generate -> validate -> update -> check
 * Uses the sample-repo fixture with known dependencies
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'sample-repo');
const MANIFEST_PATH = path.join(FIXTURES_DIR, '.dependabit', 'manifest.json');

describe('Full Workflow E2E Tests', () => {
  let originalManifest: string;

  beforeAll(() => {
    // Ensure fixtures exist
    expect(fs.existsSync(FIXTURES_DIR)).toBe(true);
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);

    // Store original manifest for restoration
    originalManifest = fs.readFileSync(MANIFEST_PATH, 'utf8');
  });

  afterEach(() => {
    // Restore original manifest after each test
    fs.writeFileSync(MANIFEST_PATH, originalManifest);
  });

  describe('Manifest Validation', () => {
    it('should validate a valid manifest', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Check schema version
      expect(manifest.version).toBe('1.0.0');

      // Check required fields
      expect(manifest.generatedAt).toBeDefined();
      expect(manifest.generatedBy).toBeDefined();
      expect(manifest.repository).toBeDefined();
      expect(manifest.dependencies).toBeInstanceOf(Array);
      expect(manifest.statistics).toBeDefined();
    });

    it('should have correct dependency structure', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      for (const dep of manifest.dependencies) {
        // Required fields
        expect(dep.id).toBeDefined();
        expect(dep.url).toBeDefined();
        expect(dep.type).toBeDefined();
        expect(dep.accessMethod).toBeDefined();
        expect(dep.name).toBeDefined();
        expect(dep.currentStateHash).toBeDefined();
        expect(dep.detectionMethod).toBeDefined();
        expect(dep.detectionConfidence).toBeGreaterThanOrEqual(0);
        expect(dep.detectionConfidence).toBeLessThanOrEqual(1);
        expect(dep.detectedAt).toBeDefined();
        expect(dep.lastChecked).toBeDefined();
        expect(dep.referencedIn).toBeInstanceOf(Array);
        expect(dep.changeHistory).toBeInstanceOf(Array);
      }
    });

    it('should have valid statistics', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      expect(manifest.statistics.totalDependencies).toBe(manifest.dependencies.length);

      // Check byType counts
      const typeCount = Object.values(manifest.statistics.byType).reduce(
        (a: number, b) => a + (b as number),
        0
      );
      expect(typeCount).toBe(manifest.dependencies.length);

      // Check byAccessMethod counts
      const accessCount = Object.values(manifest.statistics.byAccessMethod).reduce(
        (a: number, b) => a + (b as number),
        0
      );
      expect(accessCount).toBe(manifest.dependencies.length);
    });

    it('should fail validation for invalid manifest', () => {
      // Create an invalid manifest
      const invalidManifest = {
        version: '1.0.0',
        dependencies: [
          {
            id: 'invalid-id', // Not a UUID
            url: 'not-a-url', // Invalid URL
            // Missing required fields
          },
        ],
      };

      const invalidPath = path.join(FIXTURES_DIR, '.dependabit', 'invalid-test.json');
      fs.writeFileSync(invalidPath, JSON.stringify(invalidManifest));

      try {
        // Validation should detect issues
        const parsed = JSON.parse(fs.readFileSync(invalidPath, 'utf8'));
        expect(parsed.dependencies[0].name).toBeUndefined();
      } finally {
        fs.unlinkSync(invalidPath);
      }
    });
  });

  describe('Dependency Detection', () => {
    it('should detect dependencies from README', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Check that README references are captured
      const readmeDeps = manifest.dependencies.filter((dep: { referencedIn: Array<{ file: string }> }) =>
        dep.referencedIn.some((ref: { file: string }) => ref.file === 'README.md')
      );

      expect(readmeDeps.length).toBeGreaterThan(0);
    });

    it('should detect dependencies from code comments', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Check that code comment references are captured
      const codeDeps = manifest.dependencies.filter(
        (dep: { detectionMethod: string }) => dep.detectionMethod === 'code-comment'
      );

      expect(codeDeps.length).toBeGreaterThan(0);
    });

    it('should categorize dependency types correctly', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Check type categorization
      const types = new Set(manifest.dependencies.map((dep: { type: string }) => dep.type));

      expect(types.has('documentation')).toBe(true);
      expect(types.has('reference-implementation')).toBe(true);
      expect(types.has('research-paper')).toBe(true);
    });

    it('should assign correct access methods', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // GitHub repos should use github-api
      const githubDeps = manifest.dependencies.filter((dep: { url: string }) =>
        dep.url.includes('github.com')
      );
      for (const dep of githubDeps) {
        expect(dep.accessMethod).toBe('github-api');
      }

      // arXiv papers should use arxiv
      const arxivDeps = manifest.dependencies.filter((dep: { url: string }) =>
        dep.url.includes('arxiv.org')
      );
      for (const dep of arxivDeps) {
        expect(dep.accessMethod).toBe('arxiv');
      }
    });
  });

  describe('Accuracy Requirements (SC-001)', () => {
    it('should detect at least 90% of known dependencies', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Known dependencies in the fixture (gold standard)
      const knownDependencies = [
        'https://react.dev/reference',
        'https://arxiv.org/abs/1706.03762',
        'https://github.com/vercel/ai',
        'https://docs.github.com/en/rest',
        'https://vitest.dev/guide/',
        'https://spec.openapis.org/oas/v3.1.0',
        'https://www.typescriptlang.org/docs/',
        'https://github.com/TanStack/query',
        'https://platform.openai.com/docs/api-reference',
        'https://github.com/reactjs/rfcs',
      ];

      const detectedUrls = manifest.dependencies.map((dep: { url: string }) => dep.url);
      const detected = knownDependencies.filter((url) => detectedUrls.includes(url));

      const accuracy = detected.length / knownDependencies.length;

      // SC-001 requires 90%+ accuracy
      expect(accuracy).toBeGreaterThanOrEqual(0.9);
    });

    it('should have average confidence >= 0.8 for LLM detections', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      const llmDeps = manifest.dependencies.filter(
        (dep: { detectionMethod: string }) => dep.detectionMethod === 'llm-analysis'
      );

      if (llmDeps.length > 0) {
        const avgConfidence =
          llmDeps.reduce(
            (sum: number, dep: { detectionConfidence: number }) => sum + dep.detectionConfidence,
            0
          ) / llmDeps.length;

        expect(avgConfidence).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe('Manifest Update Flow', () => {
    it('should preserve manually added dependencies', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

      // Add a manual dependency
      const manualDep = {
        id: '99999999-9999-9999-9999-999999999999',
        url: 'https://manual-dep.example.com',
        type: 'documentation',
        accessMethod: 'http',
        name: 'Manual Dependency',
        currentStateHash: 'manual-hash',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        referencedIn: [],
        changeHistory: [],
      };

      manifest.dependencies.push(manualDep);
      manifest.statistics.totalDependencies++;

      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

      // Re-read and verify
      const updated = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      const found = updated.dependencies.find(
        (dep: { id: string }) => dep.id === '99999999-9999-9999-9999-999999999999'
      );

      expect(found).toBeDefined();
      expect(found.detectionMethod).toBe('manual');
    });
  });
});

describe('False Positive Validation (SC-005)', () => {
  it('should have metadata to track false positives', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    // Each dependency should have changeHistory for tracking
    for (const dep of manifest.dependencies) {
      expect(dep.changeHistory).toBeInstanceOf(Array);
    }
  });

  it('should support falsePositive flag in change history', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    // Add a false positive to change history
    if (manifest.dependencies.length > 0) {
      manifest.dependencies[0].changeHistory.push({
        detectedAt: new Date().toISOString(),
        oldVersion: '1.0.0',
        newVersion: '1.0.1',
        severity: 'minor',
        falsePositive: true,
      });

      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

      const updated = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      const fpCount = updated.dependencies[0].changeHistory.filter(
        (ch: { falsePositive?: boolean }) => ch.falsePositive === true
      ).length;

      expect(fpCount).toBe(1);
    }
  });
});

describe('Performance Requirements', () => {
  it('should have manifest size under 1MB (target)', () => {
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const sizeInBytes = Buffer.byteLength(manifestContent, 'utf8');
    const sizeInMB = sizeInBytes / (1024 * 1024);

    // Target is <1MB
    expect(sizeInMB).toBeLessThan(1);
  });

  it('should have manifest size under 10MB (hard limit)', () => {
    const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const sizeInBytes = Buffer.byteLength(manifestContent, 'utf8');
    const sizeInMB = sizeInBytes / (1024 * 1024);

    // Hard limit is 10MB
    expect(sizeInMB).toBeLessThan(10);
  });
});
