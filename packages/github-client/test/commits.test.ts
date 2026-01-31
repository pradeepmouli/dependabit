import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCommits, getCommitDiff, parseCommitFiles } from '../src/commits.js';

// Mock the octokit module
const mockListCommits = vi.fn();
const mockGetCommit = vi.fn();

vi.mock('octokit', () => {
  class MockOctokit {
    rest = {
      repos: {
        listCommits: mockListCommits,
        getCommit: mockGetCommit
      }
    };
  }

  return {
    Octokit: MockOctokit
  };
});

describe('Commit Analysis Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCommits', () => {
    it('should fetch commits from GitHub API', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'feat: add new dependency',
            author: { name: 'Test User', date: '2024-01-01T00:00:00Z' }
          }
        },
        {
          sha: 'def456',
          commit: {
            message: 'fix: update README',
            author: { name: 'Test User', date: '2024-01-01T01:00:00Z' }
          }
        }
      ];

      mockListCommits.mockResolvedValue({
        data: mockCommits
      });

      const client = {
        getOctokit: () => ({ rest: { repos: { listCommits: mockListCommits } } })
      } as any;
      const result = await fetchCommits(client, 'owner', 'repo', { since: '2024-01-01T00:00:00Z' });

      expect(result).toHaveLength(2);
      expect(result[0].sha).toBe('abc123');
      expect(result[1].sha).toBe('def456');
      expect(mockListCommits).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        since: '2024-01-01T00:00:00Z'
      });
    });

    it('should handle empty commit list', async () => {
      mockListCommits.mockResolvedValue({ data: [] });

      const client = {
        getOctokit: () => ({ rest: { repos: { listCommits: mockListCommits } } })
      } as any;
      const result = await fetchCommits(client, 'owner', 'repo');

      expect(result).toHaveLength(0);
    });
  });

  describe('getCommitDiff', () => {
    it('should fetch commit diff with file changes', async () => {
      const mockCommitData = {
        sha: 'abc123',
        files: [
          {
            filename: 'README.md',
            status: 'modified',
            additions: 5,
            deletions: 2,
            changes: 7,
            patch: '@@ -1,3 +1,6 @@\n-Old line\n+New line\n+Another line'
          },
          {
            filename: 'src/index.ts',
            status: 'added',
            additions: 10,
            deletions: 0,
            changes: 10,
            patch: '@@ -0,0 +1,10 @@\n+export function test() {}'
          }
        ]
      };

      mockGetCommit.mockResolvedValue({ data: mockCommitData });

      const client = {
        getOctokit: () => ({ rest: { repos: { getCommit: mockGetCommit } } })
      } as any;
      const result = await getCommitDiff(client, 'owner', 'repo', 'abc123');

      expect(result.sha).toBe('abc123');
      expect(result.files).toHaveLength(2);
      expect(result.files[0].filename).toBe('README.md');
      expect(result.files[0].status).toBe('modified');
      expect(result.files[1].filename).toBe('src/index.ts');
      expect(result.files[1].status).toBe('added');
    });

    it('should handle commit without file changes', async () => {
      mockGetCommit.mockResolvedValue({
        data: { sha: 'abc123', files: [] }
      });

      const client = {
        getOctokit: () => ({ rest: { repos: { getCommit: mockGetCommit } } })
      } as any;
      const result = await getCommitDiff(client, 'owner', 'repo', 'abc123');

      expect(result.files).toHaveLength(0);
    });
  });

  describe('parseCommitFiles', () => {
    it('should extract changed files from commit', () => {
      const files = [
        { filename: 'README.md', status: 'modified' as const, patch: '...' },
        { filename: 'src/index.ts', status: 'added' as const, patch: '...' },
        { filename: 'docs/guide.md', status: 'modified' as const, patch: '...' },
        { filename: 'test.ts', status: 'removed' as const }
      ];

      const result = parseCommitFiles(files);

      expect(result.modified).toContain('README.md');
      expect(result.modified).toContain('docs/guide.md');
      expect(result.added).toContain('src/index.ts');
      expect(result.removed).toContain('test.ts');
    });

    it('should handle empty file list', () => {
      const result = parseCommitFiles([]);

      expect(result.added).toHaveLength(0);
      expect(result.modified).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should group files by type of change', () => {
      const files = [
        { filename: 'file1.md', status: 'added' as const, patch: '...' },
        { filename: 'file2.md', status: 'added' as const, patch: '...' },
        { filename: 'file3.md', status: 'modified' as const, patch: '...' }
      ];

      const result = parseCommitFiles(files);

      expect(result.added).toHaveLength(2);
      expect(result.modified).toHaveLength(1);
    });
  });
});
