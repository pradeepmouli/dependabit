/**
 * Action Output Formatting
 * Handles setting GitHub Action outputs and creating summaries
 */

import * as core from '@actions/core';
import type { DependencyManifest } from '@dependabit/manifest';

/**
 * Set outputs for the generate action
 */
export function setGenerateOutputs(
  manifest: DependencyManifest,
  manifestPath: string,
  statistics: {
    filesScanned: number;
    llmCalls: number;
    totalTokens: number;
    totalLatencyMs: number;
  }
): void {
  core.setOutput('manifest_path', manifestPath);
  core.setOutput('dependency_count', manifest.dependencies.length);
  core.setOutput('files_scanned', statistics.filesScanned);
  core.setOutput('llm_calls', statistics.llmCalls);
  core.setOutput('total_tokens', statistics.totalTokens);
  core.setOutput('average_confidence', manifest.statistics.averageConfidence);
}

/**
 * Create a summary report for the generate action
 */
export async function createGenerateSummary(
  manifest: DependencyManifest,
  statistics: {
    filesScanned: number;
    llmCalls: number;
    totalTokens: number;
    totalLatencyMs: number;
  }
): Promise<void> {
  await core.summary
    .addHeading('🔍 Dependency Detection Complete')
    .addRaw('\n')
    .addTable([
      [
        { data: 'Metric', header: true },
        { data: 'Value', header: true }
      ],
      ['Dependencies Found', manifest.dependencies.length.toString()],
      ['Files Scanned', statistics.filesScanned.toString()],
      ['LLM Calls', statistics.llmCalls.toString()],
      ['Total Tokens Used', statistics.totalTokens.toString()],
      ['Average Confidence', `${(manifest.statistics.averageConfidence * 100).toFixed(1)}%`],
      ['Analysis Time', `${(statistics.totalLatencyMs / 1000).toFixed(2)}s`]
    ])
    .addRaw('\n')
    .addHeading('📊 Dependencies by Type', 3)
    .addList(
      Object.entries(manifest.statistics.byType).map(
        ([type, count]) => `${type}: ${count}`
      )
    )
    .addRaw('\n')
    .addHeading('🔧 Dependencies by Access Method', 3)
    .addList(
      Object.entries(manifest.statistics.byAccessMethod).map(
        ([method, count]) => `${method}: ${count}`
      )
    )
    .write();
}

/**
 * Create a summary for detected dependencies
 */
export async function createDependencyListSummary(
  dependencies: Array<{ name: string; url: string; type: string; confidence: number }>
): Promise<void> {
  if (dependencies.length === 0) {
    await core.summary
      .addHeading('No Dependencies Found')
      .addRaw('No external informational dependencies were detected in this repository.')
      .write();
    return;
  }

  await core.summary
    .addHeading('🔗 Detected Dependencies', 3)
    .addTable([
      [
        { data: 'Name', header: true },
        { data: 'Type', header: true },
        { data: 'Confidence', header: true },
        { data: 'URL', header: true }
      ],
      ...dependencies.slice(0, 20).map(dep => [
        dep.name,
        dep.type,
        `${(dep.confidence * 100).toFixed(0)}%`,
        `[Link](${dep.url})`
      ])
    ])
    .write();

  if (dependencies.length > 20) {
    await core.summary
      .addRaw(`\n_...and ${dependencies.length - 20} more dependencies_\n`)
      .write();
  }
}

/**
 * Set outputs for the update action
 */
export function setUpdateOutputs(
  updatedManifest: DependencyManifest,
  existingManifest: DependencyManifest,
  filesChanged: number
): void {
  const dependenciesAdded = updatedManifest.dependencies.length - existingManifest.dependencies.length;
  const changesDetected = dependenciesAdded !== 0;

  core.setOutput('changes_detected', changesDetected);
  core.setOutput('dependencies_added', Math.max(0, dependenciesAdded));
  core.setOutput('dependencies_removed', Math.max(0, -dependenciesAdded));
  core.setOutput('total_dependencies', updatedManifest.dependencies.length);
  core.setOutput('files_analyzed', filesChanged);
}

/**
 * Create a summary report for the update action
 */
export async function createUpdateSummary(
  existingManifest: DependencyManifest,
  updatedManifest: DependencyManifest,
  stats: {
    commitsAnalyzed: number;
    filesChanged: number;
    urlsAdded: number;
    urlsRemoved: number;
  }
): Promise<void> {
  const dependenciesAdded = updatedManifest.dependencies.length - existingManifest.dependencies.length;
  const changesDetected = dependenciesAdded !== 0;

  await core.summary
    .addHeading('🔄 Manifest Update Complete')
    .addRaw('\n')
    .addTable([
      [
        { data: 'Metric', header: true },
        { data: 'Value', header: true }
      ],
      ['Commits Analyzed', stats.commitsAnalyzed.toString()],
      ['Files Changed', stats.filesChanged.toString()],
      ['URLs Added', stats.urlsAdded.toString()],
      ['URLs Removed', stats.urlsRemoved.toString()],
      ['Dependencies Before', existingManifest.dependencies.length.toString()],
      ['Dependencies After', updatedManifest.dependencies.length.toString()],
      ['Net Change', dependenciesAdded >= 0 ? `+${dependenciesAdded}` : dependenciesAdded.toString()],
      ['Changes Detected', changesDetected ? '✅ Yes' : '❌ No']
    ])
    .write();

  if (dependenciesAdded > 0) {
    const newDeps = updatedManifest.dependencies
      .filter(dep => !existingManifest.dependencies.some(existing => existing.url === dep.url))
      .slice(0, 10);

    if (newDeps.length > 0) {
      await core.summary
        .addHeading('🆕 New Dependencies', 3)
        .addList(newDeps.map(dep => `**${dep.name}**: ${dep.url} (${dep.type})`))
        .write();
    }
  }
}
