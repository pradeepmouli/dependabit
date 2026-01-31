import { describe, it, expect } from 'vitest';
import { SummaryReporter } from '../../../src/utils/reporter.js';

describe('SummaryReporter', () => {
  let reporter: SummaryReporter;

  beforeEach(() => {
    reporter = new SummaryReporter();
  });

  describe('generateSummary', () => {
    it('should generate summary for dependency changes', () => {
      const changes = [
        {
          dependency: {
            id: 'dep1',
            name: 'Test Dependency',
            url: 'https://github.com/owner/repo'
          },
          severity: 'major',
          changes: ['version'],
          oldVersion: 'v1.0.0',
          newVersion: 'v1.1.0'
        }
      ];

      const summary = reporter.generateSummary(changes);

      expect(summary).toBeDefined();
      expect(summary).toContain('Test Dependency');
      expect(summary).toContain('v1.0.0');
      expect(summary).toContain('v1.1.0');
      expect(summary).toContain('major');
    });

    it('should handle multiple changes', () => {
      const changes = [
        {
          dependency: { id: 'dep1', name: 'Dep 1', url: 'https://example.com/1' },
          severity: 'breaking',
          changes: ['version'],
          oldVersion: 'v1.0.0',
          newVersion: 'v2.0.0'
        },
        {
          dependency: { id: 'dep2', name: 'Dep 2', url: 'https://example.com/2' },
          severity: 'minor',
          changes: ['content']
        }
      ];

      const summary = reporter.generateSummary(changes);

      expect(summary).toContain('Dep 1');
      expect(summary).toContain('Dep 2');
      expect(summary).toContain('breaking');
      expect(summary).toContain('minor');
    });

    it('should format breaking changes prominently', () => {
      const changes = [
        {
          dependency: { id: 'dep1', name: 'Breaking Dep', url: 'https://example.com' },
          severity: 'breaking',
          changes: ['version'],
          oldVersion: 'v1.0.0',
          newVersion: 'v2.0.0'
        }
      ];

      const summary = reporter.generateSummary(changes);

      expect(summary).toMatch(/breaking|⚠️|WARNING/i);
    });

    it('should include links to dependency URLs', () => {
      const changes = [
        {
          dependency: {
            id: 'dep1',
            name: 'Test Dep',
            url: 'https://github.com/owner/repo'
          },
          severity: 'major',
          changes: ['version']
        }
      ];

      const summary = reporter.generateSummary(changes);

      expect(summary).toContain('https://github.com/owner/repo');
    });

    it('should handle empty changes', () => {
      const summary = reporter.generateSummary([]);

      expect(summary).toBeDefined();
      expect(summary).toMatch(/no changes|up to date/i);
    });
  });

  describe('generateIssueBody', () => {
    it('should generate detailed issue body', () => {
      const change = {
        dependency: {
          id: 'dep1',
          name: 'Test Package',
          url: 'https://github.com/owner/repo',
          type: 'reference-implementation'
        },
        severity: 'major',
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v1.1.0',
        releaseNotes: 'New features added'
      };

      const body = reporter.generateIssueBody(change);

      expect(body).toContain('Test Package');
      expect(body).toContain('v1.0.0');
      expect(body).toContain('v1.1.0');
      expect(body).toContain('New features added');
      expect(body).toContain('https://github.com/owner/repo');
    });

    it('should include change details', () => {
      const change = {
        dependency: {
          id: 'dep1',
          name: 'Test',
          url: 'https://example.com'
        },
        severity: 'minor',
        changes: ['content', 'metadata'],
        diff: 'Content has been updated'
      };

      const body = reporter.generateIssueBody(change);

      expect(body).toContain('content');
      expect(body).toContain('metadata');
    });

    it('should format for breaking changes', () => {
      const change = {
        dependency: {
          id: 'dep1',
          name: 'Breaking Package',
          url: 'https://example.com'
        },
        severity: 'breaking',
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v2.0.0'
      };

      const body = reporter.generateIssueBody(change);

      expect(body).toMatch(/breaking|⚠️|action required/i);
    });
  });

  describe('formatChangeSummary', () => {
    it('should format version changes', () => {
      const result = reporter.formatChangeSummary({
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v1.1.0'
      });

      expect(result).toContain('v1.0.0');
      expect(result).toContain('v1.1.0');
      expect(result).toContain('→');
    });

    it('should format content changes', () => {
      const result = reporter.formatChangeSummary({
        changes: ['content'],
        contentDiff: '50 lines changed'
      });

      expect(result).toContain('content');
    });

    it('should handle multiple change types', () => {
      const result = reporter.formatChangeSummary({
        changes: ['version', 'content', 'metadata']
      });

      expect(result).toContain('version');
      expect(result).toContain('content');
      expect(result).toContain('metadata');
    });
  });
});
