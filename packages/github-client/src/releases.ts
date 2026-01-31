/**
 * Release Manager
 * Handles fetching and comparing GitHub releases
 */

import { Octokit } from 'octokit';

export interface Release {
  tagName: string;
  name: string;
  publishedAt: Date;
  body?: string;
  htmlUrl: string;
  prerelease?: boolean;
  draft?: boolean;
}

export interface ReleaseComparison {
  newReleases: Release[];
  oldReleases: Release[];
}

export class ReleaseManager {
  private octokit: Octokit;

  constructor(auth?: string) {
    this.octokit = new Octokit({
      auth: auth || process.env.GITHUB_TOKEN
    });
  }

  /**
   * Fetches the latest release from a repository
   */
  async getLatestRelease(params: {
    owner: string;
    repo: string;
  }): Promise<Release | null> {
    const { owner, repo } = params;

    try {
      const response = await this.octokit.rest.repos.getLatestRelease({
        owner,
        repo
      });

      return {
        tagName: response.data.tag_name,
        name: response.data.name || response.data.tag_name,
        publishedAt: new Date(response.data.published_at || response.data.created_at),
        body: response.data.body || undefined,
        htmlUrl: response.data.html_url,
        prerelease: response.data.prerelease,
        draft: response.data.draft
      };
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetches all releases from a repository
   */
  async getAllReleases(params: {
    owner: string;
    repo: string;
    page?: number;
    perPage?: number;
  }): Promise<Release[]> {
    const { owner, repo, page = 1, perPage = 30 } = params;

    try {
      const response = await this.octokit.rest.repos.listReleases({
        owner,
        repo,
        page,
        per_page: perPage
      });

      return response.data.map(release => ({
        tagName: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: new Date(release.published_at || release.created_at),
        body: release.body || undefined,
        htmlUrl: release.html_url,
        prerelease: release.prerelease,
        draft: release.draft
      }));
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Compares two sets of releases to find new ones
   */
  compareReleases(oldReleases: Release[], newReleases: Release[]): ReleaseComparison {
    const oldTags = new Set(oldReleases.map(r => r.tagName));
    const newTags = new Set(newReleases.map(r => r.tagName));

    // Find releases in new but not in old
    const newOnes = newReleases.filter(r => !oldTags.has(r.tagName));

    // Find releases in old but not in new (removed/deleted)
    const oldOnes = oldReleases.filter(r => !newTags.has(r.tagName));

    return {
      newReleases: newOnes,
      oldReleases: oldOnes
    };
  }

  /**
   * Fetches release notes for a specific tag
   */
  async getReleaseByTag(params: {
    owner: string;
    repo: string;
    tag: string;
  }): Promise<Release | null> {
    const { owner, repo, tag } = params;

    try {
      const response = await this.octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag
      });

      return {
        tagName: response.data.tag_name,
        name: response.data.name || response.data.tag_name,
        publishedAt: new Date(response.data.published_at || response.data.created_at),
        body: response.data.body || undefined,
        htmlUrl: response.data.html_url,
        prerelease: response.data.prerelease,
        draft: response.data.draft
      };
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }
}
