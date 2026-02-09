import { describe, it, expect } from 'vitest';
import {
  checkManifestSize,
  formatSize,
  validateManifestObject,
  estimateEntrySize,
  canAddEntry
} from './size-check.js';

describe('checkManifestSize', () => {
  it('should return ok status for small content', () => {
    const content = 'small content';
    const result = checkManifestSize(content);

    expect(result.status).toBe('ok');
    expect(result.message).toBeUndefined();
  });

  it('should return warning status when exceeding warn threshold', () => {
    const content = Buffer.alloc(1.5 * 1024 * 1024); // 1.5 MB
    const result = checkManifestSize(content);

    expect(result.status).toBe('warning');
    expect(result.message).toContain('approaching limit');
  });

  it('should return error status when exceeding error threshold', () => {
    const content = Buffer.alloc(11 * 1024 * 1024); // 11 MB
    const result = checkManifestSize(content);

    expect(result.status).toBe('error');
    expect(result.message).toContain('exceeds maximum limit');
  });

  it('should handle exact threshold values', () => {
    const exactWarnSize = 1 * 1024 * 1024; // Exactly 1 MB
    const result = checkManifestSize(Buffer.alloc(exactWarnSize));

    expect(result.status).toBe('warning');
  });

  it('should support custom thresholds', () => {
    const content = Buffer.alloc(2.5 * 1024 * 1024); // 2.5 MB
    const result = checkManifestSize(content, {
      warnThreshold: 2,
      errorThreshold: 5
    });

    expect(result.status).toBe('warning');
  });

  it('should handle empty content', () => {
    const result = checkManifestSize('');

    expect(result.status).toBe('ok');
    expect(result.sizeBytes).toBe(0);
    expect(result.sizeMB).toBe(0);
  });

  it('should handle Buffer input', () => {
    const buffer = Buffer.from('test content');
    const result = checkManifestSize(buffer);

    expect(result.sizeBytes).toBe(buffer.length);
    expect(result.status).toBe('ok');
  });

  it('should handle string input with multi-byte characters', () => {
    const content = '你好世界🌍'; // Multi-byte UTF-8 characters
    const result = checkManifestSize(content);

    expect(result.sizeBytes).toBe(Buffer.byteLength(content, 'utf8'));
  });
});

describe('formatSize', () => {
  it('should format bytes correctly', () => {
    expect(formatSize(512)).toBe('512 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatSize(1024)).toBe('1.00 KB');
    expect(formatSize(5 * 1024)).toBe('5.00 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
  });

  it('should handle zero', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('should handle large values', () => {
    expect(formatSize(100 * 1024 * 1024)).toBe('100.00 MB');
  });
});

describe('validateManifestObject', () => {
  it('should validate small manifest objects', () => {
    const manifest = { dependencies: [{ id: '1', name: 'test' }] };
    const result = validateManifestObject(manifest);

    expect(result.status).toBe('ok');
  });

  it('should detect large manifest objects', () => {
    const largeDeps = Array.from({ length: 10000 }, (_, i) => ({
      id: `dep-${i}`,
      name: `dependency-${i}`,
      url: `https://github.com/org/repo-${i}`,
      description: 'A'.repeat(100)
    }));

    const manifest = { dependencies: largeDeps };
    const result = validateManifestObject(manifest);

    expect(result.status).not.toBe('ok');
  });

  it('should handle empty objects', () => {
    const result = validateManifestObject({});

    expect(result.status).toBe('ok');
  });

  it('should support custom thresholds', () => {
    const manifest = { data: 'x'.repeat(500 * 1024) }; // ~500 KB
    const result = validateManifestObject(manifest, {
      warnThreshold: 0.4,
      errorThreshold: 1
    });

    expect(result.status).toBe('warning');
  });
});

describe('estimateEntrySize', () => {
  it('should estimate size of simple entries', () => {
    const entry = { id: '1', name: 'test' };
    const size = estimateEntrySize(entry);

    expect(size).toBeGreaterThan(0);
    expect(size).toBe(JSON.stringify(entry).length);
  });

  it('should estimate size of complex entries', () => {
    const entry = {
      id: '1',
      name: 'complex-dependency',
      metadata: {
        version: '1.0.0',
        tags: ['tag1', 'tag2', 'tag3'],
        description: 'A long description with multiple words'
      }
    };

    const size = estimateEntrySize(entry);
    expect(size).toBeGreaterThan(50);
  });

  it('should handle null', () => {
    expect(estimateEntrySize(null)).toBe(4); // "null"
  });

  it('should handle arrays', () => {
    const entry = [1, 2, 3];
    const size = estimateEntrySize(entry);
    expect(size).toBe(JSON.stringify(entry).length);
  });
});

describe('canAddEntry', () => {
  it('should allow adding small entries to small manifests', () => {
    const manifest = { dependencies: [] };
    const entry = { id: '1', name: 'test' };

    const result = canAddEntry(manifest, entry);

    expect(result.canAdd).toBe(true);
    expect(result.currentSize.status).toBe('ok');
  });

  it('should prevent adding entries when it would exceed limit', () => {
    // Create a manifest that's already close to the limit
    const largeDeps = Array.from({ length: 10000 }, (_, i) => ({
      id: `dep-${i}`,
      url: `https://example.com/${i}`,
      description: 'A'.repeat(800) // ~800 bytes each, total ~8MB
    }));

    const manifest = { dependencies: largeDeps };
    const newEntry = {
      id: 'new-dep',
      url: 'https://example.com/new',
      description: 'B'.repeat(3000000) // Very large entry ~3MB
    };

    const result = canAddEntry(manifest, newEntry, {
      errorThreshold: 10
    });

    expect(result.canAdd).toBe(false);
    expect(result.estimatedSize.message).toContain('exceed size limit');
  });

  it('should show warning status when approaching limit', () => {
    const deps = Array.from({ length: 1000 }, (_, i) => ({
      id: `dep-${i}`,
      data: 'x'.repeat(900) // Each ~900 bytes
    }));

    const manifest = { dependencies: deps };
    const entry = { id: 'new', data: 'y'.repeat(100) };

    const result = canAddEntry(manifest, entry, {
      warnThreshold: 0.8,
      errorThreshold: 10
    });

    expect(result.canAdd).toBe(true);
    expect(result.estimatedSize.status).toBe('warning');
  });

  it('should handle adding entry to empty manifest', () => {
    const manifest = {};
    const entry = { id: '1', name: 'first' };

    const result = canAddEntry(manifest, entry);

    expect(result.canAdd).toBe(true);
  });

  it('should account for JSON formatting overhead', () => {
    const manifest = { dependencies: [{ id: '1' }] };
    const entry = { id: '2' };

    const result = canAddEntry(manifest, entry);

    // Estimated size should be larger than current + entry due to formatting buffer
    expect(result.estimatedSize.sizeBytes).toBeGreaterThan(
      result.currentSize.sizeBytes + estimateEntrySize(entry)
    );
  });
});
