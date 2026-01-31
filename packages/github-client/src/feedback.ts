/**
 * False positive feedback listener for dependency tracking
 * Monitors GitHub issue labels to collect user feedback on detections
 */

export interface IssueWithLabels {
  number: number;
  title: string;
  labels: Array<string | { name: string }>;
  created_at?: string;
}

export interface IssueManagerInterface {
  listIssues(): Promise<Array<IssueWithLabels>>;
  getIssue(issueNumber: number): Promise<IssueWithLabels>;
}

export interface FeedbackConfig {
  truePositiveLabel?: string;
  falsePositiveLabel?: string;
}

export interface FeedbackData {
  truePositives: Array<{ number: number; title: string; created_at?: string | undefined }>;
  falsePositives: Array<{ number: number; title: string; created_at?: string | undefined }>;
  total: number;
}

export interface FeedbackRate {
  falsePositiveRate: number;
  truePositiveRate: number;
  totalFeedback: number;
}

export interface CollectOptions {
  startDate?: Date;
  endDate?: Date;
  repository?: string;
}

/**
 * Listener that monitors issue labels for false positive feedback
 */
export class FeedbackListener {
  private issueManager: IssueManagerInterface;
  private truePositiveLabel: string;
  private falsePositiveLabel: string;

  constructor(issueManager: IssueManagerInterface, config: FeedbackConfig = {}) {
    this.issueManager = issueManager;
    this.truePositiveLabel = config.truePositiveLabel || 'true-positive';
    this.falsePositiveLabel = config.falsePositiveLabel || 'false-positive';
  }

  /**
   * Collect feedback from issues with feedback labels
   */
  async collectFeedback(options: CollectOptions = {}): Promise<FeedbackData> {
    const issues = await this.issueManager.listIssues();

    const truePositives: FeedbackData['truePositives'] = [];
    const falsePositives: FeedbackData['falsePositives'] = [];

    for (const issue of issues) {
      // Filter by date range if specified
      if (options.startDate && issue.created_at) {
        const issueDate = new Date(issue.created_at);
        if (issueDate < options.startDate) continue;
      }
      if (options.endDate && issue.created_at) {
        const issueDate = new Date(issue.created_at);
        if (issueDate > options.endDate) continue;
      }

      // Filter by repository if specified
      if (options.repository && (issue as any).repository !== options.repository) {
        continue;
      }

      const labels = issue.labels || [];
      const labelNames = labels.map((l: string | { name: string }) => 
        (typeof l === 'string' ? l : l.name)
      );

      if (labelNames.includes(this.truePositiveLabel)) {
        truePositives.push({
          number: issue.number,
          title: issue.title,
          created_at: issue.created_at
        });
      } else if (labelNames.includes(this.falsePositiveLabel)) {
        falsePositives.push({
          number: issue.number,
          title: issue.title,
          created_at: issue.created_at
        });
      }
    }

    return {
      truePositives,
      falsePositives,
      total: truePositives.length + falsePositives.length
    };
  }

  /**
   * Calculate false positive rate from collected feedback
   */
  async getFeedbackRate(options: CollectOptions = {}): Promise<FeedbackRate> {
    const feedback = await this.collectFeedback(options);

    if (feedback.total === 0) {
      return {
        falsePositiveRate: 0,
        truePositiveRate: 0,
        totalFeedback: 0
      };
    }

    return {
      falsePositiveRate: feedback.falsePositives.length / feedback.total,
      truePositiveRate: feedback.truePositives.length / feedback.total,
      totalFeedback: feedback.total
    };
  }

  /**
   * Get feedback from recent time window (e.g., last 30 days)
   */
  async getRecentFeedback(days: number, referenceDate?: Date): Promise<FeedbackData> {
    const endDate = referenceDate || new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return this.collectFeedback({ startDate, endDate });
  }

  /**
   * Check if a specific issue has feedback label
   */
  async monitorIssue(issueNumber: number): Promise<boolean> {
    const issue = await this.issueManager.getIssue(issueNumber);
    const labels = issue.labels || [];
    const labelNames = labels.map((l: string | { name: string }) => 
      (typeof l === 'string' ? l : l.name)
    );

    return (
      labelNames.includes(this.truePositiveLabel) ||
      labelNames.includes(this.falsePositiveLabel)
    );
  }
}
