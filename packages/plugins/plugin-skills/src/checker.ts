/**
 * Skills.sh Checker
 * Monitors AI agent skills for version updates via GitHub tree SHAs
 *
 * Skills.sh tracks skills by their GitHub repository source.
 * This checker resolves skill versions using the GitHub API
 * to detect when a skill's folder content has changed.
 */

import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

/**
 * Skills checker configuration
 */
export interface SkillsConfig {
  /** URL to the skill on skills.sh or its GitHub source */
  url: string;
  /** GitHub owner (parsed from URL if not provided) */
  owner?: string;
  /** GitHub repo (parsed from URL if not provided) */
  repo?: string;
  /** Skill name within the repo (parsed from URL if not provided) */
  skillName?: string;
  /** GitHub API token for higher rate limits */
  apiToken?: string;
  /** Optional local path to a skills lock file (e.g. skills-lock.json) */
  lockFilePath?: string;
  /** Optional skill key to select from lock file entries */
  lockSkillKey?: string;
}

interface SkillsLockEntry {
  source: string;
  sourceType?: string;
  computedHash?: string;
}

interface SkillsLockFile {
  version?: number;
  skills: Record<string, SkillsLockEntry>;
}

/**
 * Skill metadata from GitHub
 */
export interface SkillInfo {
  owner: string;
  repo: string;
  skillName: string;
  treeSha: string;
  lastCommitSha: string;
  lastCommitDate: string;
  files: string[];
}

/**
 * Skill snapshot result
 */
export interface SkillSnapshot {
  version: string;
  stateHash: string;
  fetchedAt: Date;
  metadata: {
    owner: string;
    repo: string;
    skillName: string;
    treeSha: string;
    lastCommitSha: string;
    lastCommitDate: string;
    fileCount: number;
    skillsShUrl: string;
  };
}

/**
 * Skill change detection result
 */
export interface SkillChangeDetection {
  hasChanged: boolean;
  changes: string[];
  oldVersion?: string;
  newVersion?: string;
  severity?: 'breaking' | 'major' | 'minor';
}

/**
 * Skills.sh checker implementation
 */
export class SkillsChecker {
  private githubApiUrl = 'https://api.github.com';

  private isSkillsLockPath(input: string): boolean {
    const value = input.toLowerCase().trim();

    // Treat only local filesystem-like paths as lock files.
    // Explicitly exclude HTTP(S) URLs so we don't try to read them via fs.
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return false;
    }
    return value.endsWith('skills-lock.json') || value.includes('skills-lock.json#');
  }

  private extractLockSkillKey(url: string): string | undefined {
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) {
      return undefined;
    }

    const fragment = url.substring(hashIndex + 1).trim();
    return fragment.length > 0 ? fragment : undefined;
  }

  private normalizeLockPath(url: string): string {
    const hashIndex = url.indexOf('#');
    return hashIndex === -1 ? url : url.substring(0, hashIndex);
  }

  private async readSkillsLock(path: string): Promise<SkillsLockFile> {
    const content = await readFile(path, 'utf-8');
    const parsed = JSON.parse(content) as Partial<SkillsLockFile>;

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.skills ||
      typeof parsed.skills !== 'object'
    ) {
      throw new Error(`Invalid skills lock file format: ${path}`);
    }

    return parsed as SkillsLockFile;
  }

  private resolveLockSkill(
    lock: SkillsLockFile,
    lockPath: string,
    requestedKey?: string
  ): { key: string; entry: SkillsLockEntry } {
    const keys = Object.keys(lock.skills);

    if (keys.length === 0) {
      throw new Error(`No skills found in lock file: ${lockPath}`);
    }

    if (requestedKey) {
      const entry = lock.skills[requestedKey];
      if (!entry) {
        throw new Error(
          `Skill '${requestedKey}' not found in ${lockPath}. Available skills: ${keys.join(', ')}`
        );
      }
      return { key: requestedKey, entry };
    }

    if (keys.length > 1) {
      throw new Error(
        `Multiple skills found in ${lockPath}. Specify one via lockSkillKey, skillName, or '#<skill-key>' in the URL.`
      );
    }

    const key = keys[0]!;
    return { key, entry: lock.skills[key]! };
  }

  private buildSnapshotFromLock(
    lockPath: string,
    skillKey: string,
    entry: SkillsLockEntry
  ): SkillSnapshot {
    const parsed = this.parseSkillUrl(entry.source);
    if (!parsed || !parsed.owner || !parsed.repo) {
      throw new Error(
        `Invalid skill source '${entry.source}' for skill '${skillKey}' in lock file ${lockPath}. ` +
          `Expected a supported skills.sh or GitHub URL.`
      );
    }
    const owner = parsed.owner;
    const repo = parsed.repo;
    const skillName = parsed.skillName || skillKey;
    const computedHash =
      entry.computedHash || crypto.createHash('sha256').update(entry.source).digest('hex');

    return {
      version: computedHash.substring(0, 8),
      stateHash: computedHash,
      fetchedAt: new Date(),
      metadata: {
        owner,
        repo,
        skillName,
        treeSha: computedHash,
        lastCommitSha: computedHash.substring(0, 40),
        lastCommitDate: new Date().toISOString(),
        fileCount: 1,
        skillsShUrl: `skills-lock://${basename(lockPath)}#${skillKey}`
      }
    };
  }

  /**
   * Parse a skills.sh URL or GitHub URL into owner/repo/skill components
   *
   * Supported formats:
   * - https://skills.sh/owner/repo/skill-name
   * - https://github.com/owner/repo (whole repo as skill source)
   * - https://github.com/owner/repo/tree/main/skills/skill-name
   * - owner/repo/skill-name (shorthand)
   */
  private parseSkillUrl(input: string): { owner: string; repo: string; skillName?: string } | null {
    // skills.sh URL: https://skills.sh/owner/repo/skill-name
    const skillsShMatch = input.match(/skills\.sh\/([^/]+)\/([^/]+)(?:\/([^/?#]+))?/);
    if (skillsShMatch) {
      const result: { owner: string; repo: string; skillName?: string } = {
        owner: skillsShMatch[1]!,
        repo: skillsShMatch[2]!
      };
      if (skillsShMatch[3]) result.skillName = skillsShMatch[3];
      return result;
    }

    // GitHub tree URL: https://github.com/owner/repo/tree/branch/skills/skill-name
    const ghTreeMatch = input.match(
      /github\.com\/([^/]+)\/([^/]+)\/tree\/[^/]+\/(?:skills\/)?([^/?#]+)/
    );
    if (ghTreeMatch) {
      const result: { owner: string; repo: string; skillName?: string } = {
        owner: ghTreeMatch[1]!,
        repo: ghTreeMatch[2]!
      };
      if (ghTreeMatch[3]) result.skillName = ghTreeMatch[3];
      return result;
    }

    // GitHub repo URL: https://github.com/owner/repo
    const ghRepoMatch = input.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (ghRepoMatch) {
      return {
        owner: ghRepoMatch[1]!,
        repo: ghRepoMatch[2]!.replace(/\.git$/, '')
      };
    }

    // Shorthand: owner/repo or owner/repo/skill-name
    const shortMatch = input.match(/^([^/]+)\/([^/]+)(?:\/([^/?#]+))?$/);
    if (shortMatch) {
      const result: { owner: string; repo: string; skillName?: string } = {
        owner: shortMatch[1]!,
        repo: shortMatch[2]!
      };
      if (shortMatch[3]) result.skillName = shortMatch[3];
      return result;
    }

    return null;
  }

  /**
   * Fetch the tree SHA for a skill's directory via GitHub API
   */
  private async fetchSkillTree(
    owner: string,
    repo: string,
    skillName: string | undefined,
    apiToken?: string
  ): Promise<SkillInfo> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'dependabit-plugin-skills/1.0'
    };

    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    }

    // Get the default branch
    const repoResponse = await fetch(`${this.githubApiUrl}/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
    }
    const repoData = (await repoResponse.json()) as { default_branch: string };
    const branch = repoData.default_branch;

    // Determine the skill path
    const skillPath = skillName ? `skills/${skillName}` : '';

    // Get latest commit for the skill path
    const commitsUrl = skillPath
      ? `${this.githubApiUrl}/repos/${owner}/${repo}/commits?sha=${branch}&path=${skillPath}&per_page=1`
      : `${this.githubApiUrl}/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1`;

    const commitsResponse = await fetch(commitsUrl, { headers });
    if (!commitsResponse.ok) {
      throw new Error(`GitHub API error fetching commits: ${commitsResponse.status}`);
    }
    const commits = (await commitsResponse.json()) as Array<{
      sha: string;
      commit: { committer: { date: string } };
    }>;

    if (commits.length === 0) {
      throw new Error(`No commits found for ${owner}/${repo}${skillPath ? `/${skillPath}` : ''}`);
    }

    const latestCommit = commits[0]!;

    // Get the tree for the skill directory
    const treeUrl = skillPath
      ? `${this.githubApiUrl}/repos/${owner}/${repo}/contents/${skillPath}?ref=${branch}`
      : `${this.githubApiUrl}/repos/${owner}/${repo}/git/trees/${branch}`;

    const treeResponse = await fetch(treeUrl, { headers });
    if (!treeResponse.ok) {
      throw new Error(`GitHub API error fetching tree: ${treeResponse.status}`);
    }

    const treeData = (await treeResponse.json()) as
      | Array<{ name: string; sha: string }>
      | { sha: string; tree: Array<{ path: string }> };

    // Extract tree SHA and file list
    let treeSha: string;
    let files: string[];

    if (Array.isArray(treeData)) {
      // contents API returns array of files
      treeSha = crypto
        .createHash('sha256')
        .update(treeData.map((f) => `${f.name}:${f.sha}`).join('\n'))
        .digest('hex');
      files = treeData.map((f) => f.name);
    } else {
      // git trees API returns tree object
      treeSha = treeData.sha;
      files = treeData.tree.map((f) => f.path);
    }

    return {
      owner,
      repo,
      skillName: skillName || repo,
      treeSha,
      lastCommitSha: latestCommit.sha,
      lastCommitDate: latestCommit.commit.committer.date,
      files
    };
  }

  /**
   * Fetch skill information and create a snapshot
   */
  async fetch(config: SkillsConfig): Promise<SkillSnapshot> {
    const { url, owner: providedOwner, repo: providedRepo, skillName: providedSkill } = config;

    const lockPath =
      config.lockFilePath || (this.isSkillsLockPath(url) ? this.normalizeLockPath(url) : null);
    if (lockPath) {
      try {
        const lock = await this.readSkillsLock(lockPath);
        const lockSkillKey =
          config.lockSkillKey || providedSkill || this.extractLockSkillKey(url) || undefined;
        const { key, entry } = this.resolveLockSkill(lock, lockPath, lockSkillKey);
        return this.buildSnapshotFromLock(lockPath, key, entry);
      } catch (error) {
        throw new Error(`Failed to fetch skill info from lock file: ${(error as Error).message}`);
      }
    }

    // Parse URL or use provided values
    const parsed = this.parseSkillUrl(url);
    const owner = providedOwner || parsed?.owner;
    const repo = providedRepo || parsed?.repo;
    const skillName = providedSkill || parsed?.skillName;

    if (!owner || !repo) {
      throw new Error(`Could not parse skill source from: ${url}`);
    }

    try {
      const info = await this.fetchSkillTree(owner, repo, skillName, config.apiToken);

      return {
        version: info.treeSha.substring(0, 8),
        stateHash: info.treeSha,
        fetchedAt: new Date(),
        metadata: {
          owner: info.owner,
          repo: info.repo,
          skillName: info.skillName,
          treeSha: info.treeSha,
          lastCommitSha: info.lastCommitSha,
          lastCommitDate: info.lastCommitDate,
          fileCount: info.files.length,
          skillsShUrl: `https://skills.sh/${info.owner}/${info.repo}${skillName ? `/${skillName}` : ''}`
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch skill info: ${(error as Error).message}`);
    }
  }

  /**
   * Compare two skill snapshots to detect changes
   */
  async compare(prev: SkillSnapshot, curr: SkillSnapshot): Promise<SkillChangeDetection> {
    const changes: string[] = [];

    // Check tree SHA change (content hash of skill directory)
    if (prev.metadata.treeSha !== curr.metadata.treeSha) {
      changes.push('content');
    }

    // Check file count change (structural change)
    if (prev.metadata.fileCount !== curr.metadata.fileCount) {
      changes.push('structure');
    }

    // Determine severity
    let severity: 'breaking' | 'major' | 'minor' = 'minor';
    if (changes.includes('structure')) {
      // Files added/removed suggests a significant change
      severity = 'major';
    } else if (changes.includes('content')) {
      // Content change only
      severity = 'minor';
    }

    const result: SkillChangeDetection = {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: prev.version,
      newVersion: curr.version
    };

    if (changes.length > 0) {
      result.severity = severity;
    }

    return result;
  }
}

/**
 * Create a skills checker instance
 */
export function createSkillsChecker(): SkillsChecker {
  return new SkillsChecker();
}
