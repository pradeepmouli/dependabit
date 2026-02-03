import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReleaseManager } from '../src/releases.js';

// Mock the octokit module
vi.mock('octokit', () => {
  const mockGetLatestRelease = vi.fn().mockImplementation((params: any) => {
    // Return 404 for specific repos
    if (params.repo === 'no-releases') {
      const error: any = new Error('Not Found');
      error.status = 404;
      return Promise.reject(error);
    }
    return Promise.resolve({
      data: {
        tag_name: 'v1.0.0',
        name: 'Release v1.0.0',
        published_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        body: 'Release notes',
        html_url: 'https://github.com/test-owner/test-repo/releases/v1.0.0',
        prerelease: false,
        draft: false
      }
    });
  });

  const mockListReleases = vi.fn().mockImplementation((params: any) => {
    // Return empty for specific repos
    if (params.repo === 'no-releases') {
      const error: any = new Error('Not Found');
      error.status = 404;
      return Promise.reject(error);
    }
    return Promise.resolve({
      data: [
        {
          tag_name: 'v1.0.0',
          name: 'Release v1.0.0',
          published_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          body: 'Release notes',
          html_url: 'https://github.com/test-owner/test-repo/releases/v1.0.0',
          prerelease: false,
          draft: false
        }
      ]
    });
  });

  const mockGetReleaseByTag = vi.fn().mockResolvedValue({
    data: {
      tag_name: 'v1.0.0',
      name: 'Release v1.0.0',
      published_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      body: 'Release notes',
      html_url: 'https://github.com/test-owner/test-repo/releases/v1.0.0',
      prerelease: false,
      draft: false
    }
  });

  class MockOctokit {
    rest = {
      repos: {
        getLatestRelease: mockGetLatestRelease,
        listReleases: mockListReleases,
        getReleaseByTag: mockGetReleaseByTag
      }
    };
  }

  return {
    Octokit: MockOctokit
  };
});

describe('ReleaseManager', () => {
  let releaseManager: ReleaseManager;

  beforeEach(() => {
    releaseManager = new ReleaseManager();
    vi.clearAllMocks();
  });

  describe('getLatestRelease', () => {
    it('should fetch latest release', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo'
      };

      const result = await releaseManager.getLatestRelease(params);

      expect(result).toBeDefined();
      expect(result.tagName).toBeDefined();
      expect(result.publishedAt).toBeInstanceOf(Date);
    });

    it('should return null when no releases exist', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'no-releases'
      };

      const result = await releaseManager.getLatestRelease(params);

      expect(result).toBeNull();
    });

    it('should include release notes', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo'
      };

      const result = await releaseManager.getLatestRelease(params);

      expect(result?.body).toBeDefined();
      expect(result?.htmlUrl).toBeDefined();
    });
  });

  describe('getAllReleases', () => {
    it('should fetch all releases', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo'
      };

      const result = await releaseManager.getAllReleases(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'test-repo',
        page: 2,
        perPage: 10
      };

      const result = await releaseManager.getAllReleases(params);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no releases', async () => {
      const params = {
        owner: 'test-owner',
        repo: 'no-releases'
      };

      const result = await releaseManager.getAllReleases(params);

      expect(result).toEqual([]);
    });
  });

  describe('compareReleases', () => {
    it('should detect new releases', () => {
      const oldReleases = [{ tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }];

      const newReleases = [
        { tagName: 'v1.1.0', publishedAt: new Date('2024-01-02') },
        { tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }
      ];

      const result = releaseManager.compareReleases(oldReleases, newReleases);

      expect(result.newReleases).toHaveLength(1);
      expect(result.newReleases[0].tagName).toBe('v1.1.0');
    });

    it('should return empty when no new releases', () => {
      const oldReleases = [{ tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }];

      const newReleases = [{ tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }];

      const result = releaseManager.compareReleases(oldReleases, newReleases);

      expect(result.newReleases).toHaveLength(0);
    });
  });
});
