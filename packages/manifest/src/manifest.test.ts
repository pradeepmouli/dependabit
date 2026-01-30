import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  readManifest,
  writeManifest,
  updateDependency,
  addDependency,
  removeDependency,
  mergeManifests,
  createEmptyManifest
} from '../src/manifest.js';
import type { DependencyManifest, DependencyEntry } from '../src/schema.js';

const TEST_DIR = '/tmp/dependabit-manifest-tests';

describe('Manifest Operations Tests', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('readManifest and writeManifest', () => {
    it('should write and read a manifest', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const read = await readManifest(path);
      expect(read.repository.owner).toBe('test');
      expect(read.repository.name).toBe('repo');
    });

    it('should create directory if not exists', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'nested', 'dir', 'manifest.json');
      await writeManifest(path, manifest);

      const read = await readManifest(path);
      expect(read).toBeDefined();
    });

    it('should validate manifest before writing', async () => {
      const invalid = { version: '2.0.0' } as any;
      const path = join(TEST_DIR, 'manifest.json');

      await expect(writeManifest(path, invalid)).rejects.toThrow();
    });
  });

  describe('addDependency', () => {
    it('should add a dependency to manifest', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      const updated = await addDependency(path, dependency);
      expect(updated.dependencies).toHaveLength(1);
      expect(updated.dependencies[0].name).toBe('TypeScript');
      expect(updated.statistics.totalDependencies).toBe(1);
    });

    it('should reject duplicate IDs', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      await addDependency(path, dependency);
      await expect(addDependency(path, dependency)).rejects.toThrow(/already exists/);
    });

    it('should reject duplicate URLs', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const dependency1: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      const dependency2: DependencyEntry = {
        ...dependency1,
        id: '660e8400-e29b-41d4-a716-446655440001'
      };

      await addDependency(path, dependency1);
      await expect(addDependency(path, dependency2)).rejects.toThrow(/already exists/);
    });
  });

  describe('updateDependency', () => {
    it('should update a dependency', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      await addDependency(path, dependency);

      const updated = await updateDependency(path, dependency.id, {
        currentVersion: '5.9.3',
        currentStateHash: 'sha256:newHash'
      });

      expect(updated.dependencies[0].currentVersion).toBe('5.9.3');
      expect(updated.dependencies[0].currentStateHash).toBe('sha256:newHash');
    });

    it('should throw error for non-existent dependency', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      await expect(
        updateDependency(path, '550e8400-e29b-41d4-a716-446655440000', {
          currentVersion: '5.9.3'
        })
      ).rejects.toThrow(/not found/);
    });
  });

  describe('removeDependency', () => {
    it('should remove a dependency', async () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const path = join(TEST_DIR, 'manifest.json');
      await writeManifest(path, manifest);

      const dependency: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/microsoft/TypeScript',
        type: 'reference-implementation',
        accessMethod: 'github-api',
        name: 'TypeScript',
        currentStateHash: 'sha256:abc123',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      await addDependency(path, dependency);
      const updated = await removeDependency(path, dependency.id);

      expect(updated.dependencies).toHaveLength(0);
      expect(updated.statistics.totalDependencies).toBe(0);
    });
  });

  describe('mergeManifests', () => {
    it('should merge two manifests preserving manual entries', () => {
      const existing = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const manualDep: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/manual/dep',
        type: 'documentation',
        accessMethod: 'http',
        name: 'Manual Dependency',
        currentStateHash: 'sha256:manual',
        detectionMethod: 'manual',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      existing.dependencies.push(manualDep);

      const updated = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'def456'
      });

      const autoDep: DependencyEntry = {
        id: '660e8400-e29b-41d4-a716-446655440001',
        url: 'https://github.com/auto/dep',
        type: 'documentation',
        accessMethod: 'http',
        name: 'Auto Dependency',
        currentStateHash: 'sha256:auto',
        detectionMethod: 'llm-analysis',
        detectionConfidence: 0.9,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: []
      };

      updated.dependencies.push(autoDep);

      const merged = mergeManifests(existing, updated);

      expect(merged.dependencies).toHaveLength(2);
      expect(merged.dependencies.some((d) => d.name === 'Manual Dependency')).toBe(true);
      expect(merged.dependencies.some((d) => d.name === 'Auto Dependency')).toBe(true);
    });

    it('should preserve change history', () => {
      const existing = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      const depWithHistory: DependencyEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/test/dep',
        type: 'documentation',
        accessMethod: 'http',
        name: 'Test Dependency',
        currentStateHash: 'sha256:old',
        detectionMethod: 'llm-analysis',
        detectionConfidence: 1.0,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: [],
        changeHistory: [
          {
            detectedAt: new Date().toISOString(),
            severity: 'minor',
            falsePositive: false
          }
        ]
      };

      existing.dependencies.push(depWithHistory);

      const updated = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'def456'
      });

      const updatedDep: DependencyEntry = {
        ...depWithHistory,
        currentStateHash: 'sha256:new',
        changeHistory: []
      };

      updated.dependencies.push(updatedDep);

      const merged = mergeManifests(existing, updated);

      expect(merged.dependencies[0].changeHistory).toHaveLength(1);
    });
  });

  describe('createEmptyManifest', () => {
    it('should create a valid empty manifest', () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123'
      });

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.dependencies).toHaveLength(0);
      expect(manifest.statistics.totalDependencies).toBe(0);
      expect(manifest.repository.owner).toBe('test');
    });

    it('should accept optional parameters', () => {
      const manifest = createEmptyManifest({
        owner: 'test',
        name: 'repo',
        branch: 'main',
        commit: 'abc123',
        action: 'custom-action',
        version: '2.0.0',
        llmProvider: 'claude',
        llmModel: 'claude-3'
      });

      expect(manifest.generatedBy.action).toBe('custom-action');
      expect(manifest.generatedBy.version).toBe('2.0.0');
      expect(manifest.generatedBy.llmProvider).toBe('claude');
      expect(manifest.generatedBy.llmModel).toBe('claude-3');
    });
  });
});
