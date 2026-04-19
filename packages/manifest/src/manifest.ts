import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { type DependencyManifest, type DependencyEntry } from './schema.js';
import { validateManifest, validateDependencyEntry, safeValidateManifest } from './validator.js';

/**
 * Reads a manifest JSON file from disk and validates it against
 * `DependencyManifestSchema`.
 *
 * @param path - Absolute or process-relative path to the manifest file.
 * @returns The validated manifest object.
 *
 * @throws {ValidationError} If the file content does not match the schema.
 * @throws {Error} If the file cannot be read (e.g., not found, permissions).
 *
 * @category Manifest
 *
 * @useWhen Loading an existing manifest to pass to the monitor or detector.
 *
 * @pitfalls
 * - The file is parsed as JSON, not YAML.  Passing a YAML manifest path
 *   will throw a `SyntaxError`; use `readConfig` for YAML.
 */
export async function readManifest(path: string): Promise<DependencyManifest> {
  const content = await readFile(path, 'utf-8');
  const data = JSON.parse(content);
  return validateManifest(data);
}

/**
 * Serialises a manifest to pretty-printed JSON and writes it to disk.
 *
 * @remarks
 * The directory is created recursively if it does not exist.
 * When `strict` is `false` (the default) the file is written even if
 * validation fails; validation errors are returned in the result so callers
 * can surface them as warnings.
 *
 * @param path - Destination file path.
 * @param manifest - Manifest object to write.
 * @param options - Optional write behaviour overrides.
 * @returns An object that may contain `validationErrors` if the manifest
 *   has schema violations and `strict` is `false`.
 *
 * @throws {ValidationError} Only when `options.strict` is `true` and the
 *   manifest fails validation.
 *
 * @category Manifest
 *
 * @pitfalls
 * - Writing a manifest with `strict: false` can persist invalid data that
 *   later fails to parse.  Prefer `strict: true` in production pipelines.
 */
export async function writeManifest(
  path: string,
  manifest: DependencyManifest,
  options?: { strict?: boolean }
): Promise<{ validationErrors?: string[] }> {
  const strict = options?.strict ?? false;
  const result: { validationErrors?: string[] } = {};

  // Validate before writing
  const validation = safeValidateManifest(manifest);
  if (!validation.success) {
    const errors = validation.error!.getFormattedErrors();
    if (strict) {
      throw validation.error!;
    }
    // Non-strict: record warnings but still write the manifest
    result.validationErrors = errors;
  }

  // Ensure directory exists
  await mkdir(dirname(path), { recursive: true });

  // Write formatted JSON
  const content = JSON.stringify(manifest, null, 2);
  await writeFile(path, content, 'utf-8');

  return result;
}

/**
 * Updates a single dependency entry in the on-disk manifest by ID.
 *
 * @param path - Path to the manifest file.
 * @param dependencyId - UUID of the dependency to update.
 * @param updates - Partial `DependencyEntry` fields to merge.
 * @returns The updated manifest.
 *
 * @throws {Error} If no dependency with `dependencyId` is found.
 * @throws {ValidationError} If the merged entry fails schema validation.
 *
 * @category Manifest
 *
 * @pitfalls
 * - This function performs a **read–modify–write** cycle.  Concurrent calls
 *   with the same `path` and different `dependencyId` values will race and
 *   one write will silently overwrite the other.  Use a file lock or
 *   serialise calls if running multiple monitors in parallel.
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

  // Validate the merged dependency
  validateDependencyEntry(dep);

  // Update statistics
  manifest.statistics = calculateStatistics(manifest.dependencies);

  // Write back
  await writeManifest(path, manifest);

  return manifest;
}

/**
 * Appends a new dependency entry to the on-disk manifest.
 *
 * @param path - Path to the manifest file.
 * @param dependency - The new `DependencyEntry` to add.
 * @returns The updated manifest.
 *
 * @throws {Error} If a dependency with the same `id` or `url` already exists.
 *
 * @category Manifest
 *
 * @pitfalls
 * - Duplicate URL detection is exact-match only.  Trailing slashes or
 *   fragment identifiers will not be treated as duplicates.
 * - Same race condition as {@link updateDependency} applies.
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
 * Removes a dependency from the on-disk manifest by ID.
 *
 * @param path - Path to the manifest file.
 * @param dependencyId - UUID of the dependency to remove.
 * @returns The updated manifest.
 *
 * @throws {Error} If no dependency with `dependencyId` is found.
 *
 * @category Manifest
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
 * Merges an `updated` manifest generated by the detector over an `existing`
 * one, optionally preserving manual entries and accumulated change history.
 *
 * @remarks
 * The merge strategy is:
 * - All entries from `updated` are taken as the new ground truth.
 * - If `preserveManual` is `true` (default), manual entries in `existing`
 *   that are absent from `updated` are appended as-is.
 * - If `preserveHistory` is `true` (default), any `changeHistory` from
 *   `existing` is prepended to the corresponding entry in `updated`.
 *
 * Statistics are recalculated from the merged dependency list.
 *
 * @param existing - The current on-disk manifest.
 * @param updated - The freshly-detected manifest to merge.
 * @param options - Merge strategy options.
 * @returns A new manifest object (does not mutate either input).
 *
 * @category Manifest
 *
 * @useWhen
 * Applying the output of {@link Detector} to an existing manifest without
 * losing manually-curated entries or historical change records.
 *
 * @avoidWhen
 * You want to completely replace the existing manifest — just write
 * `updated` directly via {@link writeManifest}.
 *
 * @pitfalls
 * - Matching between `existing` and `updated` uses `id` **or** `url`.
 *   If the URL of a dependency changes (e.g. a redirect is resolved), the
 *   entry will be treated as new and history will not be preserved.
 * - `preserveManual: true` can re-add entries that were intentionally
 *   removed from the repository.  Set it to `false` when performing a
 *   deliberate full refresh.
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

  // Create a deep copy of the updated manifest to avoid mutations
  const merged: DependencyManifest = {
    ...updated,
    dependencies: updated.dependencies.map((dep) => ({
      ...dep,
      changeHistory: dep.changeHistory ? [...dep.changeHistory] : [],
      referencedIn: dep.referencedIn ? [...dep.referencedIn] : []
    }))
  };

  if (preserveManual) {
    // Find manual entries in existing manifest
    const manualEntries = existing.dependencies.filter((dep) => dep.detectionMethod === 'manual');

    // Add manual entries that aren't in the updated manifest
    for (const manualEntry of manualEntries) {
      const existsInUpdated = merged.dependencies.some(
        (dep) => dep.id === manualEntry.id || dep.url === manualEntry.url
      );

      if (!existsInUpdated) {
        merged.dependencies.push({
          ...manualEntry,
          changeHistory: manualEntry.changeHistory ? [...manualEntry.changeHistory] : [],
          referencedIn: manualEntry.referencedIn ? [...manualEntry.referencedIn] : []
        });
      }
    }
  }

  if (preserveHistory) {
    // Preserve change history for matching dependencies
    merged.dependencies = merged.dependencies.map((dep) => {
      const existingDep = existing.dependencies.find((d) => d.id === dep.id || d.url === dep.url);

      if (existingDep && existingDep.changeHistory && existingDep.changeHistory.length > 0) {
        return {
          ...dep,
          changeHistory: [...existingDep.changeHistory, ...(dep.changeHistory || [])]
        };
      }

      return dep;
    });
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
 * Creates a minimal, valid manifest with an empty `dependencies` array.
 *
 * @remarks
 * Use this as the starting point when generating a manifest from scratch
 * (e.g. on first run in a new repository).
 *
 * @returns A new `DependencyManifest` with zeroed statistics.
 *
 * @category Manifest
 *
 * @example
 * ```ts
 * const manifest = createEmptyManifest({
 *   owner: 'my-org', name: 'my-repo',
 *   branch: 'main', commit: 'abc123',
 * });
 * await writeManifest('.dependabit/manifest.json', manifest);
 * ```
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
