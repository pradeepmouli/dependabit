/**
 * Action Output Formatting
 * T043 [US1] Implement action output formatting
 */

import * as core from '@actions/core';
import type { DependencyManifest } from '@dependabit/manifest';

/**
 * Format and set action outputs
 */
export function setActionOutputs(manifest: DependencyManifest, manifestPath: string): void {
  // Set basic outputs
  core.setOutput('manifest-path', manifestPath);
  core.setOutput('dependencies-count', manifest.statistics.totalDependencies);
  core.setOutput('average-confidence', manifest.statistics.averageConfidence.toFixed(3));

  // Set statistics as JSON
  core.setOutput('statistics', JSON.stringify(manifest.statistics, null, 2));

  // Set by-type breakdown
  core.setOutput('by-type', JSON.stringify(manifest.statistics.byType, null, 2));

  // Set repository info
  core.setOutput('repository', JSON.stringify(manifest.repository, null, 2));
}

/**
 * Format manifest summary for display
 */
export function formatManifestSummary(manifest: DependencyManifest): string {
  const lines: string[] = [];

  lines.push('# Dependency Manifest Summary');
  lines.push('');
  lines.push(`**Total Dependencies:** ${manifest.statistics.totalDependencies}`);
  lines.push(`**Average Confidence:** ${(manifest.statistics.averageConfidence * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('## Dependencies by Type');
  for (const [type, count] of Object.entries(manifest.statistics.byType)) {
    lines.push(`- **${type}:** ${count}`);
  }

  lines.push('');
  lines.push('## Dependencies by Detection Method');
  for (const [method, count] of Object.entries(manifest.statistics.byDetectionMethod)) {
    lines.push(`- **${method}:** ${count}`);
  }

  return lines.join('\n');
}

/**
 * Format error message with remediation steps
 */
export function formatErrorMessage(error: Error, context?: Record<string, unknown>): string {
  const lines: string[] = [];

  lines.push(`❌ **Error:** ${error.message}`);
  lines.push('');

  // Add remediation suggestions based on error type
  if (error.message.includes('GITHUB_TOKEN')) {
    lines.push('**Remediation:**');
    lines.push('- Ensure `GITHUB_TOKEN` is set in your environment');
    lines.push('- Check that the token has required permissions');
    lines.push('- For GitHub Actions, ensure you have `permissions: read-all` or specific permissions set');
  } else if (error.message.includes('Rate limit')) {
    lines.push('**Remediation:**');
    lines.push('- Wait for rate limit to reset');
    lines.push('- Use a personal access token with higher rate limits');
    lines.push('- Reduce the frequency of runs');
  } else if (error.message.includes('LLM')) {
    lines.push('**Remediation:**');
    lines.push('- Check LLM provider configuration');
    lines.push('- Verify API credentials are correct');
    lines.push('- Try again later if service is unavailable');
  }

  if (context) {
    lines.push('');
    lines.push('**Context:**');
    lines.push('```json');
    lines.push(JSON.stringify(context, null, 2));
    lines.push('```');
  }

  return lines.join('\n');
}
