import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  type DependencyManifest,
  type DependencyEntry,
  DependencyManifestSchema
} from './schema.js';
import { validateManifest } from './validator.js';

/**
 * Read and parse a manifest file
 */
export async function readManifest(path: string): Promise<DependencyManifest> {
  const content = await readFile(path, 'utf-8');
  const data = JSON.parse(content);
  return validateManifest(data);
}

/**
 * Write a manifest to file
 */
export async function writeManifest(
  path: string,
  manifest: DependencyManifest
): Promise<void> {
  // Validate before writing
  validateManifest(manifest);

  // Ensure directory exists
  await mkdir(dirname(path), { recursive: true });

  // Write formatted JSON
  const content = JSON.stringify(manifest, null, 2);
  await writeFile(path, content, 'utf-8');
}

/**
 * Update a dependency entry in the manifest
 */
export async function updateDependency(
  path: string,
  dependencyId: string,
  updates: Partial<DependencyEntry>
): Promise<DependencyManifest> {
  const manifest = await readManifest(path);

  const dep = manifest.dependencies.find((d) => d.id === dependencyId);
  if (!dep) {
    throw new Error(`Dependency with id ${dependencyId} not found`);
  }

  // Update the dependency in place
  Object.assign(dep, updates);

  // Update statistics
  manifest.statistics = calculateStatistics(manifest.dependencies);

  // Write back
  await writeManifest(path, manifest);

  return manifest;
}

/**
 * Add a new dependency to the manifest
 */
export async function addDependency(
  path: string,
  dependency: DependencyEntry
): Promise<DependencyManifest> {
  const manifest = await readManifest(path);

  // Check for duplicates by ID or URL
  const existingById = manifest.dependencies.find((dep) => dep.id === dependency.id);
  const existingByUrl = manifest.dependencies.find((dep) => dep.url === dependency.url);

  if (existingById) {
    throw new Error(`Dependency with id ${dependency.id} already exists`);
  }

  if (existingByUrl) {
    throw new Error(`Dependency with url ${dependency.url} already exists`);
  }

  // Add dependency
  manifest.dependencies.push(dependency);

  // Update statistics
  manifest.statistics = calculateStatistics(manifest.dependencies);

  // Write back
  await writeManifest(path, manifest);

  return manifest;
}

/**
 * Remove a dependency from the manifest
 */
export async function removeDependency(
  path: string,
  dependencyId: string
): Promise<DependencyManifest> {
  const manifest = await readManifest(path);

  const index = manifest.dependencies.findIndex((dep) => dep.id === dependencyId);
  if (index === -1) {
    throw new Error(`Dependency with id ${dependencyId} not found`);
  }

  // Remove dependency
  manifest.dependencies.splice(index, 1);

  // Update statistics
  manifest.statistics = calculateStatistics(manifest.dependencies);

  // Write back
  await writeManifest(path, manifest);

  return manifest;
}

/**
 * Merge two manifests, preserving manual entries
 * Manual entries are those with detectionMethod === 'manual'
 */
export function mergeManifests(
  existing: DependencyManifest,
  updated: DependencyManifest,
  options: {
    preserveManual?: boolean;
    preserveHistory?: boolean;
  } = {}
): DependencyManifest {
  const { preserveManual = true, preserveHistory = true } = options;

  // Start with updated manifest
  const merged = { ...updated };

  if (preserveManual) {
    // Find manual entries in existing manifest
    const manualEntries = existing.dependencies.filter(
      (dep) => dep.detectionMethod === 'manual'
    );

    // Add manual entries that aren't in the updated manifest
    for (const manualEntry of manualEntries) {
      const existsInUpdated = updated.dependencies.some(
        (dep) => dep.id === manualEntry.id || dep.url === manualEntry.url
      );

      if (!existsInUpdated) {
        merged.dependencies.push(manualEntry);
      }
    }
  }

  if (preserveHistory) {
    // Preserve change history for matching dependencies
    for (const dep of merged.dependencies) {
      const existingDep = existing.dependencies.find(
        (d) => d.id === dep.id || d.url === dep.url
      );

      if (existingDep && existingDep.changeHistory && existingDep.changeHistory.length > 0) {
        dep.changeHistory = [
          ...existingDep.changeHistory,
          ...(dep.changeHistory || [])
        ];
      }
    }
  }

  // Recalculate statistics
  merged.statistics = calculateStatistics(merged.dependencies);

  return merged;
}

/**
 * Calculate statistics for a list of dependencies
 */
function calculateStatistics(dependencies: DependencyEntry[]): DependencyManifest['statistics'] {
  const byType: Record<string, number> = {};
  const byAccessMethod: Record<string, number> = {};
  const byDetectionMethod: Record<string, number> = {};
  let totalConfidence = 0;
  let falsePositiveCount = 0;
  let totalChangeCount = 0;

  for (const dep of dependencies) {
    byType[dep.type] = (byType[dep.type] || 0) + 1;
    byAccessMethod[dep.accessMethod] = (byAccessMethod[dep.accessMethod] || 0) + 1;
    byDetectionMethod[dep.detectionMethod] = (byDetectionMethod[dep.detectionMethod] || 0) + 1;
    totalConfidence += dep.detectionConfidence;

    // Count false positives in change history
    const changeHistory = dep.changeHistory || [];
    const fpCount = changeHistory.filter((change) => change.falsePositive).length;
    falsePositiveCount += fpCount;
    totalChangeCount += changeHistory.length;
  }

  const averageConfidence = dependencies.length > 0 ? totalConfidence / dependencies.length : 0;

  const falsePositiveRate =
    totalChangeCount > 0 ? falsePositiveCount / totalChangeCount : undefined;

  return {
    totalDependencies: dependencies.length,
    byType,
    byAccessMethod,
    byDetectionMethod,
    averageConfidence,
    falsePositiveRate
  };
}

/**
 * Create an empty manifest template
 */
export function createEmptyManifest(options: {
  owner: string;
  name: string;
  branch: string;
  commit: string;
  action?: string;
  version?: string;
  llmProvider?: string;
  llmModel?: string;
}): DependencyManifest {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    generatedBy: {
      action: options.action || 'dependabit',
      version: options.version || '0.1.0',
      llmProvider: options.llmProvider || 'github-copilot',
      llmModel: options.llmModel
    },
    repository: {
      owner: options.owner,
      name: options.name,
      branch: options.branch,
      commit: options.commit
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
}
