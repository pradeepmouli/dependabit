/**
 * Manifest size validation and warnings
 * Checks manifest size and warns when approaching limits
 */

export interface SizeCheckResult {
  sizeBytes: number;
  sizeMB: number;
  status: 'ok' | 'warning' | 'error';
  message?: string | undefined;
}

export interface SizeCheckOptions {
  warnThreshold?: number; // MB (default: 1)
  errorThreshold?: number; // MB (default: 10)
}

/**
 * Check manifest size and return status
 */
export function checkManifestSize(
  content: string | Buffer,
  options?: SizeCheckOptions
): SizeCheckResult {
  const warnThreshold = (options?.warnThreshold ?? 1) * 1024 * 1024; // Convert MB to bytes
  const errorThreshold = (options?.errorThreshold ?? 10) * 1024 * 1024;

  const sizeBytes =
    typeof content === 'string' ? Buffer.byteLength(content, 'utf8') : content.length;

  const sizeMB = sizeBytes / (1024 * 1024);

  if (sizeBytes >= errorThreshold) {
    return {
      sizeBytes,
      sizeMB,
      status: 'error',
      message: `Manifest size (${sizeMB.toFixed(2)}MB) exceeds maximum limit of ${(errorThreshold / 1024 / 1024).toFixed(0)}MB. Consider splitting or pruning data.`
    };
  }

  if (sizeBytes >= warnThreshold) {
    return {
      sizeBytes,
      sizeMB,
      status: 'warning',
      message: `Manifest size (${sizeMB.toFixed(2)}MB) is approaching limit. Warning threshold: ${(warnThreshold / 1024 / 1024).toFixed(0)}MB, Max: ${(errorThreshold / 1024 / 1024).toFixed(0)}MB.`
    };
  }

  return {
    sizeBytes,
    sizeMB,
    status: 'ok'
  };
}

/**
 * Get formatted size string
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validate manifest object size before serialization
 */
export function validateManifestObject(
  manifest: unknown,
  options?: SizeCheckOptions
): SizeCheckResult {
  const serialized = JSON.stringify(manifest, null, 2);
  return checkManifestSize(serialized, options);
}

/**
 * Estimate manifest size impact of adding an entry
 */
export function estimateEntrySize(entry: unknown): number {
  const serialized = JSON.stringify(entry);
  return Buffer.byteLength(serialized, 'utf8');
}

/**
 * Check if adding an entry would exceed limits
 */
export function canAddEntry(
  currentManifest: unknown,
  newEntry: unknown,
  options?: SizeCheckOptions
): {
  canAdd: boolean;
  currentSize: SizeCheckResult;
  estimatedSize: SizeCheckResult;
} {
  const currentSize = validateManifestObject(currentManifest, options);
  const entrySize = estimateEntrySize(newEntry);

  // Estimate new size (accounting for JSON formatting)
  const estimatedBytes = currentSize.sizeBytes + entrySize + 100; // Add buffer for formatting
  const estimatedSizeMB = estimatedBytes / (1024 * 1024);

  const errorThreshold = (options?.errorThreshold ?? 10) * 1024 * 1024;
  const canAdd = estimatedBytes < errorThreshold;

  const estimatedResult = checkManifestSize(Buffer.alloc(estimatedBytes), options);

  return {
    canAdd,
    currentSize,
    estimatedSize: {
      ...estimatedResult,
      message: canAdd
        ? estimatedResult.message
        : `Adding entry would exceed size limit (estimated: ${estimatedSizeMB.toFixed(2)}MB)`
    }
  };
}
