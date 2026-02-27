/**
 * Skills.sh Checker
 * Monitors AI agent skills for version updates via GitHub tree SHAs
 *
 * Skills.sh tracks skills by their GitHub repository source.
 * This checker resolves skill versions using the GitHub API
 * to detect when a skill's folder content has changed.
 */

import crypto from 'node:crypto';

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
