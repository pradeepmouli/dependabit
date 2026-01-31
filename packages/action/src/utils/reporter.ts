/**
 * Summary Reporter
 * Generates human-readable summaries for dependency change reports
 */

export interface DependencyChange {
  dependency: {
    id: string;
    name?: string;
    url: string;
    type?: string;
  };
  severity: 'breaking' | 'major' | 'minor';
  changes: string[];
  oldVersion?: string;
  newVersion?: string;
  releaseNotes?: string;
  diff?: string;
  contentDiff?: string;
}

export class SummaryReporter {
  /**
   * Generates a summary report for all dependency changes
   */
  generateSummary(changes: DependencyChange[]): string {
    if (changes.length === 0) {
      return '✅ All dependencies are up to date. No changes detected.';
    }

    const breaking = changes.filter(c => c.severity === 'breaking');
    const major = changes.filter(c => c.severity === 'major');
    const minor = changes.filter(c => c.severity === 'minor');

    let summary = '# Dependency Changes Detected\n\n';
    summary += `**Total Changes**: ${changes.length}\n`;
    summary += `- 🔴 Breaking: ${breaking.length}\n`;
    summary += `- 🟡 Major: ${major.length}\n`;
    summary += `- 🟢 Minor: ${minor.length}\n\n`;

    if (breaking.length > 0) {
      summary += '## ⚠️ Breaking Changes\n\n';
      breaking.forEach(change => {
        summary += this.formatChangeItem(change);
      });
    }

    if (major.length > 0) {
      summary += '## 🔔 Major Updates\n\n';
      major.forEach(change => {
        summary += this.formatChangeItem(change);
      });
    }

    if (minor.length > 0) {
      summary += '## 📝 Minor Updates\n\n';
      minor.forEach(change => {
        summary += this.formatChangeItem(change);
      });
    }

    return summary;
  }

  /**
   * Generates detailed issue body for a single dependency change
   */
  generateIssueBody(change: DependencyChange): string {
    const { dependency, severity, changes, oldVersion, newVersion, releaseNotes } = change;

    let body = '';

    // Header with severity indicator
    const severityEmoji = {
      breaking: '⚠️',
      major: '🔔',
      minor: '📝'
    }[severity];

    body += `${severityEmoji} **${severity.toUpperCase()}** dependency update detected\n\n`;

    // Dependency information
    body += `## Dependency: ${dependency.name || dependency.id}\n\n`;
    body += `- **URL**: ${dependency.url}\n`;
    if (dependency.type) {
      body += `- **Type**: ${dependency.type}\n`;
    }

    // Version change
    if (oldVersion && newVersion) {
      body += `\n## Version Change\n\n`;
      body += `\`${oldVersion}\` → \`${newVersion}\`\n`;
    }

    // Changes detected
    body += `\n## Changes Detected\n\n`;
    changes.forEach(change => {
      body += `- ${change}\n`;
    });

    // Release notes if available
    if (releaseNotes) {
      body += `\n## Release Notes\n\n`;
      body += releaseNotes;
    }

    // Action required for breaking changes
    if (severity === 'breaking') {
      body += `\n## ⚠️ Action Required\n\n`;
      body += `This is a **breaking change** that may require updates to your code.\n`;
      body += `Please review the changes and update your implementation accordingly.\n`;
    }

    return body;
  }

  /**
   * Formats change summary for display
   */
  formatChangeSummary(change: {
    changes: string[];
    oldVersion?: string;
    newVersion?: string;
    contentDiff?: string;
  }): string {
    let summary = '';

    if (change.oldVersion && change.newVersion) {
      summary += `Version: ${change.oldVersion} → ${change.newVersion}\n`;
    }

    if (change.changes.includes('content')) {
      summary += 'Content updated\n';
      if (change.contentDiff) {
        summary += `Changes: ${change.contentDiff}\n`;
      }
    }

    if (change.changes.includes('metadata')) {
      summary += 'Metadata updated\n';
    }

    if (change.changes.includes('version')) {
      summary += 'Version updated\n';
    }

    return summary.trim();
  }

  /**
   * Formats a single change item for the summary
   */
  private formatChangeItem(change: DependencyChange): string {
    const name = change.dependency.name || change.dependency.id;
    let item = `### ${name}\n\n`;
    item += `- **URL**: ${change.dependency.url}\n`;
    
    if (change.oldVersion && change.newVersion) {
      item += `- **Version**: \`${change.oldVersion}\` → \`${change.newVersion}\`\n`;
    }

    if (change.changes.length > 0) {
      item += `- **Changes**: ${change.changes.join(', ')}\n`;
    }

    item += '\n';
    return item;
  }
}
