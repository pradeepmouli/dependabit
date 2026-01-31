/**
 * GitHub Repository Checker
 * Monitors GitHub repositories for new releases and changes
 */

import type { Checker, DependencySnapshot, ChangeDetection, AccessConfig } from '../types.js';
import crypto from 'node:crypto';

export class GitHubRepoChecker implements Checker {
  /**
   * Fetches latest release information from a GitHub repository
   */
  async fetch(config: AccessConfig): Promise<DependencySnapshot> {
    const { url } = config;

    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }

    const owner = match[1];
    const repo = match[2];
    const cleanRepo = repo.replace(/\.git$/, '');

    try {
      // Fetch latest release from GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}/releases/latest`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'dependabit',
          ...(config.auth?.secret && { Authorization: `Bearer ${config.auth.secret}` })
        }
      });

      if (response.status === 404) {
        // No releases found, fall back to latest commit
        return this.fetchLatestCommit(owner, cleanRepo, config.auth?.secret);
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const release = (await response.json()) as {
        tag_name: string;
        name: string;
        published_at: string;
        body: string;
        html_url: string;
      };

      // Create state hash from release info
      const stateContent = JSON.stringify({
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at
      });
      const stateHash = crypto.createHash('sha256').update(stateContent).digest('hex');

      return {
        version: release.tag_name,
        stateHash,
        fetchedAt: new Date(),
        metadata: {
          name: release.name,
          publishedAt: release.published_at,
          body: release.body,
          htmlUrl: release.html_url
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch GitHub release: ${(error as Error).message}`);
    }
  }

  /**
   * Fallback: Fetch latest commit when no releases exist
   */
  private async fetchLatestCommit(
    owner: string,
    repo: string,
    token?: string
  ): Promise<DependencySnapshot> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'dependabit',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const commits = (await response.json()) as Array<{
      sha: string;
      commit: {
        message: string;
        author: { date: string };
      };
    }>;

    if (commits.length === 0 || !commits[0]) {
      throw new Error('No commits found in repository');
    }

    const latestCommit = commits[0];
    const stateHash = latestCommit.sha;

    return {
      stateHash,
      fetchedAt: new Date(),
      metadata: {
        sha: latestCommit.sha,
        message: latestCommit.commit.message,
        date: latestCommit.commit.author.date
      }
    };
  }

  /**
   * Compares two snapshots to detect version/state changes
   */
  async compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection> {
    const changes: string[] = [];

    // Check version change
    if (prev.version !== curr.version) {
      if (prev.version && curr.version) {
        changes.push('version');
      }
    }

    // Check state hash change
    if (prev.stateHash !== curr.stateHash) {
      changes.push('stateHash');
    }

    return {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: prev.version,
      newVersion: curr.version
    };
  }
}
