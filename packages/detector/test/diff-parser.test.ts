import { describe, it, expect } from 'vitest';
import { parseDiff, extractAddedContent, extractRemovedContent, getChangedFiles } from '../src/diff-parser.js';

describe('Diff Parser Tests', () => {
  describe('parseDiff', () => {
    it('should parse unified diff format', () => {
      const diff = `@@ -1,3 +1,4 @@
 Line 1
-Old line
+New line
+Another new line
 Line 3`;

      const result = parseDiff(diff);

      expect(result.additions).toContain('New line');
      expect(result.additions).toContain('Another new line');
      expect(result.deletions).toContain('Old line');
    });

    it('should handle diff with only additions', () => {
      const diff = `@@ -0,0 +1,3 @@
+First line
+Second line
+Third line`;

      const result = parseDiff(diff);

      expect(result.additions).toHaveLength(3);
      expect(result.deletions).toHaveLength(0);
    });

    it('should handle diff with only deletions', () => {
      const diff = `@@ -1,3 +0,0 @@
-First line
-Second line
-Third line`;

      const result = parseDiff(diff);

      expect(result.additions).toHaveLength(0);
      expect(result.deletions).toHaveLength(3);
    });

    it('should ignore context lines (no +/-)', () => {
      const diff = `@@ -1,5 +1,5 @@
 Context line 1
-Old line
+New line
 Context line 2
 Context line 3`;

      const result = parseDiff(diff);

      expect(result.additions).toHaveLength(1);
      expect(result.deletions).toHaveLength(1);
      expect(result.additions[0]).toBe('New line');
    });
  });

  describe('extractAddedContent', () => {
    it('should extract URLs from added lines', () => {
      const additions = [
        'Check out https://example.com/api for details',
        'See documentation at https://docs.example.com',
        'Regular line without URL'
      ];

      const result = extractAddedContent(additions);

      expect(result.urls).toContain('https://example.com/api');
      expect(result.urls).toContain('https://docs.example.com');
      expect(result.urls).toHaveLength(2);
    });

    it('should extract dependencies from package.json additions', () => {
      const additions = [
        '  "dependencies": {',
        '    "axios": "^1.0.0",',
        '    "lodash": "^4.17.21"',
        '  }'
      ];

      const result = extractAddedContent(additions, 'package.json');

      expect(result.packageDeps).toContain('axios');
      expect(result.packageDeps).toContain('lodash');
    });

    it('should extract references from code comments', () => {
      const additions = [
        '// Based on https://github.com/example/repo',
        '/* Reference: https://arxiv.org/abs/2301.12345 */',
        'const x = 5; // Regular comment'
      ];

      const result = extractAddedContent(additions);

      expect(result.urls).toContain('https://github.com/example/repo');
      expect(result.urls).toContain('https://arxiv.org/abs/2301.12345');
    });

    it('should handle empty additions', () => {
      const result = extractAddedContent([]);

      expect(result.urls).toHaveLength(0);
      expect(result.packageDeps).toHaveLength(0);
    });
  });

  describe('extractRemovedContent', () => {
    it('should extract URLs from removed lines', () => {
      const deletions = [
        'Old link: https://old-example.com',
        'Deprecated: https://deprecated.example.com/api'
      ];

      const result = extractRemovedContent(deletions);

      expect(result.urls).toContain('https://old-example.com');
      expect(result.urls).toContain('https://deprecated.example.com/api');
    });

    it('should extract dependencies from package.json deletions', () => {
      const deletions = [
        '    "old-package": "^1.0.0",',
        '    "deprecated-lib": "^2.0.0"'
      ];

      const result = extractRemovedContent(deletions, 'package.json');

      expect(result.packageDeps).toContain('old-package');
      expect(result.packageDeps).toContain('deprecated-lib');
    });
  });

  describe('getChangedFiles', () => {
    it('should identify files relevant for dependency analysis', () => {
      const files = [
        { filename: 'README.md', status: 'modified' as const },
        { filename: 'src/index.ts', status: 'modified' as const },
        { filename: 'package.json', status: 'modified' as const },
        { filename: 'docs/guide.md', status: 'added' as const },
        { filename: 'test/unit.test.ts', status: 'modified' as const }
      ];

      const result = getChangedFiles(files);

      expect(result.relevantFiles).toContain('README.md');
      expect(result.relevantFiles).toContain('package.json');
      expect(result.relevantFiles).toContain('docs/guide.md');
      expect(result.packageFiles).toContain('package.json');
    });

    it('should exclude irrelevant file types', () => {
      const files = [
        { filename: 'image.png', status: 'added' as const },
        { filename: 'video.mp4', status: 'added' as const },
        { filename: 'README.md', status: 'modified' as const }
      ];

      const result = getChangedFiles(files);

      expect(result.relevantFiles).not.toContain('image.png');
      expect(result.relevantFiles).not.toContain('video.mp4');
      expect(result.relevantFiles).toContain('README.md');
    });

    it('should identify package manifest files', () => {
      const files = [
        { filename: 'package.json', status: 'modified' as const },
        { filename: 'requirements.txt', status: 'modified' as const },
        { filename: 'Cargo.toml', status: 'modified' as const },
        { filename: 'go.mod', status: 'modified' as const }
      ];

      const result = getChangedFiles(files);

      expect(result.packageFiles).toContain('package.json');
      expect(result.packageFiles).toContain('requirements.txt');
      expect(result.packageFiles).toContain('Cargo.toml');
      expect(result.packageFiles).toContain('go.mod');
    });
  });
});
