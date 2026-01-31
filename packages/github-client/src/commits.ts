/**
 * Commit Analysis
 * Fetch and analyze commits from GitHub API
 */

import type { GitHubClient } from './client.js';

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email?: string;
    date: string;
  };
  url?: string;
}

export interface CommitFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions?: number;
  deletions?: number;
  changes?: number;
  patch?: string;
}

export interface CommitDiff {
  sha: string;
  files: CommitFile[];
}

export interface ParsedFiles {
  added: string[];
  modified: string[];
  removed: string[];
}

export interface FetchCommitsOptions {
  since?: string;
  until?: string;
  sha?: string;
  path?: string;
  per_page?: number;
  page?: number;
}

/**
 * Fetch commits from GitHub API
 */
export async function fetchCommits(
  client: GitHubClient,
  owner: string,
  repo: string,
  options: FetchCommitsOptions = {}
): Promise<CommitInfo[]> {
  const octokit = client.getOctokit();

  const response = await octokit.rest.repos.listCommits({
    owner,
    repo,
    ...options
  });

  return response.data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author?.name || 'Unknown',
      email: commit.commit.author?.email,
      date: commit.commit.author?.date || new Date().toISOString()
    },
    url: commit.html_url
  }));
}

/**
 * Get detailed diff for a specific commit
 */
export async function getCommitDiff(
  client: GitHubClient,
  owner: string,
  repo: string,
  sha: string
): Promise<CommitDiff> {
  const octokit = client.getOctokit();

  const response = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: sha
  });

  return {
    sha: response.data.sha,
    files: (response.data.files || []).map((file) => ({
      filename: file.filename,
      status: file.status as CommitFile['status'],
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch
    }))
  };
}

/**
 * Parse commit files into categorized lists
 */
export function parseCommitFiles(files: CommitFile[]): ParsedFiles {
  const result: ParsedFiles = {
    added: [],
    modified: [],
    removed: []
  };

  for (const file of files) {
    if (file.status === 'added') {
      result.added.push(file.filename);
    } else if (file.status === 'modified' || file.status === 'changed') {
      result.modified.push(file.filename);
    } else if (file.status === 'removed') {
      result.removed.push(file.filename);
    }
  }

  return result;
}

/**
 * Get commits between two refs
 */
export async function getCommitsBetween(
  client: GitHubClient,
  owner: string,
  repo: string,
  base: string,
  head: string
): Promise<CommitInfo[]> {
  const octokit = client.getOctokit();

  const response = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head
  });

  return response.data.commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author?.name || 'Unknown',
      email: commit.commit.author?.email,
      date: commit.commit.author?.date || new Date().toISOString()
    },
    url: commit.html_url
  }));
}
