import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReleaseManager } from '../../src/releases.js';

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
      const oldReleases = [
        { tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }
      ];

      const newReleases = [
        { tagName: 'v1.1.0', publishedAt: new Date('2024-01-02') },
        { tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }
      ];

      const result = releaseManager.compareReleases(oldReleases, newReleases);

      expect(result.newReleases).toHaveLength(1);
      expect(result.newReleases[0].tagName).toBe('v1.1.0');
    });

    it('should return empty when no new releases', () => {
      const oldReleases = [
        { tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }
      ];

      const newReleases = [
        { tagName: 'v1.0.0', publishedAt: new Date('2024-01-01') }
      ];

      const result = releaseManager.compareReleases(oldReleases, newReleases);

      expect(result.newReleases).toHaveLength(0);
    });
  });
});
