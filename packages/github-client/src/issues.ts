/**
 * Issue Manager
 * Handles GitHub issue creation and management for dependency changes
 */

import { Octokit } from 'octokit';

export interface IssueData {
  owner: string;
  repo: string;
  title: string;
  body: string;
  severity: 'breaking' | 'major' | 'minor';
  dependency: {
    id: string;
    url: string;
  };
  assignee?: string;
}

export interface IssueResult {
  number: number;
  url: string;
  labels: string[];
  assignees?: string[] | undefined;
}

export interface UpdateIssueData {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  severity?: 'breaking' | 'major' | 'minor';
  append?: boolean;
}

export class IssueManager {
  private octokit: Octokit;

  constructor(auth?: string) {
    this.octokit = new Octokit({
      auth: auth || process.env['GITHUB_TOKEN']
    });
  }

  /**
   * Creates a new issue for a dependency change
   */
  async createIssue(data: IssueData): Promise<IssueResult> {
    const { owner, repo, title, body, severity, dependency, assignee } = data;

    // Prepare labels
    const labels = [
      'dependabit',
      `severity:${severity}`,
      'dependency-update'
    ];

    // Create the issue
    const response = await this.octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: this.formatIssueBody(body, dependency),
      labels,
      ...(assignee && { assignees: [assignee] })
    });

    return {
      number: response.data.number,
      url: response.data.html_url,
      labels,
      ...(assignee && { assignees: [assignee] })
    };
  }

  /**
   * Finds an existing issue for a dependency
   */
  async findExistingIssue(params: {
    owner: string;
    repo: string;
    dependencyId: string;
  }): Promise<IssueResult | null> {
    const { owner, repo, dependencyId } = params;

    try {
      // Search for open issues with dependabit label and dependency ID
      const query = `repo:${owner}/${repo} is:issue is:open label:dependabit ${dependencyId}`;
      
      const response = await this.octokit.rest.search.issuesAndPullRequests({
        q: query,
        per_page: 1
      });

      if (response.data.items.length === 0) {
        return null;
      }

      const issue = response.data.items[0];
      if (!issue) {
        return null;
      }

      return {
        number: issue.number,
        url: issue.html_url,
        labels: issue.labels.map(l => typeof l === 'string' ? l : l.name || '')
      };
    } catch (error) {
      console.error('Error finding existing issue:', error);
      return null;
    }
  }

  /**
   * Updates an existing issue
   */
  async updateIssue(data: UpdateIssueData): Promise<IssueResult> {
    const { owner, repo, issueNumber, body, severity, append } = data;

    let finalBody = body;

    // If appending, fetch current body first
    if (append) {
      const current = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });
      finalBody = `${current.data.body}\n\n---\n\n${body}`;
    }

    // Update labels if severity changed
    const updateParams: {
      owner: string;
      repo: string;
      issue_number: number;
      body: string;
      labels?: string[];
    } = {
      owner,
      repo,
      issue_number: issueNumber,
      body: finalBody
    };

    if (severity) {
      updateParams.labels = [
        'dependabit',
        `severity:${severity}`,
        'dependency-update'
      ];
    }

    const response = await this.octokit.rest.issues.update(updateParams);

    return {
      number: response.data.number,
      url: response.data.html_url,
      labels: response.data.labels.map(l => typeof l === 'string' ? l : l.name || '')
    };
  }

  /**
   * Formats the issue body with dependency metadata
   */
  private formatIssueBody(body: string, dependency: { id: string; url: string }): string {
    return `${body}

---

**Dependency Information**
- ID: \`${dependency.id}\`
- URL: ${dependency.url}

*This issue was automatically created by dependabit. Add \`false-positive\` or \`true-positive\` label to provide feedback.*`;
  }
}
