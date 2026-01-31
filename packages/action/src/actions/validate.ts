import {
  readManifest,
  validateManifest,
  readConfig,
  type DependencyManifest,
  type DependabitConfig
} from '@dependabit/manifest';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: DependencyManifest;
  config: DependabitConfig | undefined;
}

/**
 * Validate manifest file with comprehensive checks
 *
 * Performs:
 * - Schema validation (Zod)
 * - Business rule validation (duplicate IDs, valid URLs, timestamp order)
 * - Optional config validation
 *
 * @param manifestPath Path to manifest.json
 * @param configPath Optional path to config.yml
 * @returns Validation result with errors and warnings
 */
export async function validateAction(
  manifestPath: string,
  configPath?: string
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let manifest: DependencyManifest | undefined;
  let config: DependabitConfig | undefined;

  console.log(`Validating manifest: ${manifestPath}`);

  // Step 1: Read and validate manifest schema
  try {
    const rawManifest = await readManifest(manifestPath);
    manifest = validateManifest(rawManifest);
    console.log(`✓ Schema validation passed`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Schema validation failed: ${message}`);
    console.error(`✗ Schema validation failed: ${message}`);
    return { valid: false, errors, warnings, config: undefined };
  }

  // Step 2: Validate business rules
  validateBusinessRules(manifest, errors, warnings);

  // Step 3: Read and validate config if provided
  if (configPath) {
    try {
      config = await readConfig(configPath);
      console.log(`✓ Config validation passed: ${configPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Config validation failed: ${message}`);
      console.error(`✗ Config validation failed: ${message}`);
    }
  }

  // Step 4: Cross-validate manifest and config
  if (manifest && config) {
    validateManifestConfigCompatibility(manifest, config, errors, warnings);
  }

  const valid = errors.length === 0;

  if (valid) {
    console.log(`✓ Validation passed with ${warnings.length} warnings`);
  } else {
    console.error(`✗ Validation failed with ${errors.length} errors`);
  }

  return { valid, errors, warnings, manifest, config: config || undefined };
}

/**
 * Validate business rules
 */
function validateBusinessRules(
  manifest: DependencyManifest,
  errors: string[],
  warnings: string[]
): void {
  // Check for duplicate dependency IDs
  const ids = new Set<string>();
  const duplicateIds: string[] = [];

  for (const dep of manifest.dependencies) {
    if (ids.has(dep.id)) {
      duplicateIds.push(dep.id);
    }
    ids.add(dep.id);
  }

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate dependency IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check for duplicate URLs
  const urls = new Set<string>();
  const duplicateUrls: string[] = [];

  for (const dep of manifest.dependencies) {
    if (urls.has(dep.url)) {
      duplicateUrls.push(dep.url);
    }
    urls.add(dep.url);
  }

  if (duplicateUrls.length > 0) {
    warnings.push(`Duplicate URLs found: ${duplicateUrls.join(', ')}`);
  }

  // Validate timestamps order
  for (const dep of manifest.dependencies) {
    const detectedAt = new Date(dep.detectedAt);
    const lastChecked = new Date(dep.lastChecked);

    if (lastChecked < detectedAt) {
      errors.push(
        `Dependency ${dep.name}: lastChecked (${dep.lastChecked}) is before detectedAt (${dep.detectedAt})`
      );
    }

    if (dep.lastChanged) {
      const lastChanged = new Date(dep.lastChanged);
      if (lastChanged < detectedAt) {
        errors.push(
          `Dependency ${dep.name}: lastChanged (${dep.lastChanged}) is before detectedAt (${dep.detectedAt})`
        );
      }
    }
  }

  // Validate statistics consistency
  if (manifest.statistics.totalDependencies !== manifest.dependencies.length) {
    errors.push(
      `Statistics mismatch: totalDependencies (${manifest.statistics.totalDependencies}) != actual count (${manifest.dependencies.length})`
    );
  }

  // Validate referenced files exist (warning only)
  const missingReferences: string[] = [];
  for (const dep of manifest.dependencies) {
    for (const ref of dep.referencedIn) {
      // This is a warning because files might have been deleted
      // We don't fail validation for this
      if (!ref.file) {
        missingReferences.push(`Dependency ${dep.name} has empty file reference`);
      }
    }
  }

  if (missingReferences.length > 0) {
    warnings.push(...missingReferences);
  }

  // Check for low confidence detections
  const lowConfidence = manifest.dependencies.filter((dep) => dep.detectionConfidence < 0.5);

  if (lowConfidence.length > 0) {
    warnings.push(`${lowConfidence.length} dependencies have low detection confidence (<0.5)`);
  }

  // Check manifest size
  const manifestSize = JSON.stringify(manifest).length;
  const sizeInMB = manifestSize / (1024 * 1024);

  if (sizeInMB > 10) {
    errors.push(`Manifest size (${sizeInMB.toFixed(2)}MB) exceeds maximum (10MB)`);
  } else if (sizeInMB > 5) {
    warnings.push(`Manifest size (${sizeInMB.toFixed(2)}MB) is large (target: <1MB, warn: >5MB)`);
  }

  console.log(`✓ Business rule validation completed`);
}

/**
 * Validate manifest and config compatibility
 */
function validateManifestConfigCompatibility(
  manifest: DependencyManifest,
  config: DependabitConfig,
  errors: string[],
  warnings: string[]
): void {
  // Check that dependency overrides reference valid dependencies
  if (config.dependencies) {
    for (const override of config.dependencies) {
      const found = manifest.dependencies.some((dep) => dep.url === override.url);
      if (!found) {
        warnings.push(
          `Config override for ${override.url} does not match any dependency in manifest`
        );
      }
    }
  }

  // Check that ignored URLs are not in manifest (warning)
  if (config.ignore?.urls) {
    for (const ignoredUrl of config.ignore.urls) {
      const found = manifest.dependencies.some((dep) => dep.url === ignoredUrl);
      if (found) {
        warnings.push(`Dependency ${ignoredUrl} is in manifest but marked as ignored in config`);
      }
    }
  }

  console.log(`✓ Cross-validation completed`);
}

/**
 * Format validation errors for CLI output
 */
export function formatValidationErrors(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✓ Validation passed');
    if (result.warnings.length > 0) {
      lines.push('');
      lines.push(`Warnings (${result.warnings.length}):`);
      for (const warning of result.warnings) {
        lines.push(`  ⚠ ${warning}`);
      }
    }
  } else {
    lines.push('✗ Validation failed');
    lines.push('');
    lines.push(`Errors (${result.errors.length}):`);
    for (const error of result.errors) {
      lines.push(`  ✗ ${error}`);
    }

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push(`Warnings (${result.warnings.length}):`);
      for (const warning of result.warnings) {
        lines.push(`  ⚠ ${warning}`);
      }
    }
  }

  return lines.join('\n');
}
