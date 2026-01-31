import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueManager } from '../src/issues.js';

describe('IssueManager', () => {
  let issueManager: IssueManager;

  beforeEach(() => {
    issueManager = new IssueManager();
    vi.clearAllMocks();
  });

  describe('createIssue', () => {
    it('should create issue with severity label', async () => {
      const issueData = {
        owner: 'test-owner',
        repo: 'test-repo',
        title: 'Dependency Update: test-package',
        body: 'New version detected',
        severity: 'major' as const,
        dependency: {
          id: 'test-id',
          url: 'https://github.com/owner/repo'
        }
      };

      const result = await issueManager.createIssue(issueData);

      expect(result).toBeDefined();
      expect(result.number).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.labels).toContain('severity:major');
    });

    it('should include dependabit label', async () => {
      const issueData = {
        owner: 'test-owner',
        repo: 'test-repo',
        title: 'Dependency Update',
        body: 'Changes detected',
        severity: 'minor' as const,
        dependency: {
          id: 'test-id',
          url: 'https://example.com'
        }
      };

      const result = await issueManager.createIssue(issueData);

      expect(result.labels).toContain('dependabit');
    });

    it('should handle breaking changes with appropriate label', async () => {
      const issueData = {
        owner: 'test-owner',
        repo: 'test-repo',
        title: 'Breaking Change Detected',
        body: 'Major version update with breaking changes',
        severity: 'breaking' as const,
        dependency: {
          id: 'test-id',
          url: 'https://github.com/owner/repo'
        }
      };

      const result = await issueManager.createIssue(issueData);

      expect(result.labels).toContain('severity:breaking');
    });

    it('should assign issue to AI agent when specified', async () => {
      const issueData = {
        owner: 'test-owner',
        repo: 'test-repo',
        title: 'Dependency Update',
        body: 'Changes detected',
        severity: 'major' as const,
        dependency: {
          id: 'test-id',
          url: 'https://example.com'
        },
        assignee: 'copilot'
      };

      const result = await issueManager.createIssue(issueData);

      expect(result).toBeDefined();
      expect(result.assignees).toContain('copilot');
    });
  });

  describe('findExistingIssue', () => {
    it('should find existing issue for dependency', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo',
        dependencyId: 'test-id'
      };

      const result = await issueManager.findExistingIssue(params);

      expect(result).toBeDefined();
    });

    it('should return null when no existing issue found', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo',
        dependencyId: 'non-existent-id'
      };

      const result = await issueManager.findExistingIssue(params);

      expect(result).toBeNull();
    });
  });

  describe('updateIssue', () => {
    it('should update existing issue with new information', async () => {
      const updateData = {
        owner: 'test-owner',
        repo: 'test-repo',
        issueNumber: 123,
        body: 'Updated information',
        severity: 'breaking' as const
      };

      const result = await issueManager.updateIssue(updateData);

      expect(result).toBeDefined();
      expect(result.number).toBe(123);
    });

    it('should append to existing issue body when specified', async () => {
      const updateData = {
        owner: 'test-owner',
        repo: 'test-repo',
        issueNumber: 123,
        body: 'Additional update',
        append: true
      };

      const result = await issueManager.updateIssue(updateData);

      expect(result).toBeDefined();
    });
  });
});
