/**
 * Generate Action Implementation
 * T041 [US1] Implement generate action
 */

import * as core from '@actions/core';
import { context } from '@actions/github';
import { Detector } from '@dependabit/detector';
import {
  writeManifest,
  type DependencyManifest
} from '@dependabit/manifest';
import { join } from 'node:path';
import { logInfo, logError, logWarning } from '../logger.js';

export interface GenerateOptions {
  /**
   * Repository path (defaults to GITHUB_WORKSPACE)
   */
  repoPath: string | undefined;

  /**
   * Output path for manifest
   */
  manifestPath: string | undefined;

  /**
   * LLM provider (github-copilot, claude, openai)
   */
  llmProvider: string | undefined;
}

/**
 * Generate initial dependency manifest
 */
export async function generateManifest(
  options: GenerateOptions = {
    repoPath: undefined,
    manifestPath: undefined,
    llmProvider: undefined
  }
): Promise<void> {
  const startTime = Date.now();

  try {
    // Get configuration
    const repoPath = options.repoPath || process.env['GITHUB_WORKSPACE'] || process.cwd();
    const manifestPath = options.manifestPath || join(repoPath, '.dependabit', 'manifest.json');
    const llmProvider = options.llmProvider || 'github-copilot';

    logInfo('Starting manifest generation', {
      repoPath,
      manifestPath,
      llmProvider
    });

    // Initialize detector
    // Note: Currently only github-copilot is implemented
    // TODO: Add support for other LLM providers (claude, openai)
    const detector = new Detector({
      repoPath
    });

    // Run detection
    logInfo('Analyzing repository for external dependencies...');
    const result = await detector.detect();

    logInfo(`Detected ${result.dependencies.length} dependencies`, {
      statistics: result.statistics
    });

    // Create manifest
    const manifest: DependencyManifest = {
      version: '1.0.0' as const,
      generatedAt: new Date().toISOString(),
      generatedBy: {
        action: 'dependabit',
        version: '0.1.0',
        llmProvider
      },
      repository: {
        owner: context.repo.owner,
        name: context.repo.repo,
        branch: context.ref.replace('refs/heads/', ''),
        commit: context.sha
      },
      dependencies: result.dependencies,
      statistics: {
        totalDependencies: result.statistics.dependencies,
        byType: result.statistics.byType,
        byAccessMethod: calculateByAccessMethod(result.dependencies),
        byDetectionMethod: calculateByDetectionMethod(result.dependencies),
        averageConfidence: result.statistics.averageConfidence
      }
    };

    // Write manifest
    await writeManifest(manifestPath, manifest);

    logInfo(`Manifest written to ${manifestPath}`, {
      totalDependencies: result.dependencies.length,
      byType: result.statistics.byType
    });

    // Set action outputs
    core.setOutput('manifest-path', manifestPath);
    core.setOutput('dependencies-count', result.dependencies.length);
    core.setOutput('statistics', JSON.stringify(result.statistics));

    // Create summary
    await createSummary(manifest, Date.now() - startTime);

    logInfo('Manifest generation completed successfully', {
      durationMs: Date.now() - startTime
    });
  } catch (error) {
    logError('Manifest generation failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    core.setFailed(
      `Failed to generate manifest: ${error instanceof Error ? error.message : String(error)}`
    );

    throw error;
  }
}

/**
 * Create GitHub Actions summary
 */
async function createSummary(
  manifest: DependencyManifest,
  durationMs: number
): Promise<void> {
  const summary = core.summary
    .addHeading('Dependency Manifest Generated 📦')
    .addRaw('\n')
    .addTable([
      [
        { data: 'Metric', header: true },
        { data: 'Value', header: true }
      ],
      ['Total Dependencies', String(manifest.statistics.totalDependencies)],
      ['Average Confidence', `${(manifest.statistics.averageConfidence * 100).toFixed(1)}%`],
      ['Duration', `${(durationMs / 1000).toFixed(2)}s`]
    ])
    .addHeading('Dependencies by Type', 3);

  // Add type breakdown
  const typeTable: string[][] = [
    ['Type', 'Count']
  ];

  for (const [type, count] of Object.entries(manifest.statistics.byType)) {
    typeTable.push([type, String(count)]);
  }

  summary.addTable(typeTable);

  // Add sample dependencies
  if (manifest.dependencies.length > 0) {
    summary.addHeading('Sample Dependencies', 3);

    const sampleTable: string[][] = [
      ['Name', 'Type', 'URL', 'Confidence']
    ];

    const samples = manifest.dependencies.slice(0, 5);
    for (const dep of samples) {
      sampleTable.push([
        dep.name,
        dep.type,
        `[Link](${dep.url})`,
        `${(dep.detectionConfidence * 100).toFixed(0)}%`
      ]);
    }

    summary.addTable(sampleTable);
  }

  await summary.write();
}

/**
 * Calculate dependencies by access method
 */
function calculateByAccessMethod(dependencies: any[]): Record<string, number> {
  const byAccessMethod: Record<string, number> = {};
  for (const dep of dependencies) {
    byAccessMethod[dep.accessMethod] = (byAccessMethod[dep.accessMethod] || 0) + 1;
  }
  return byAccessMethod;
}

/**
 * Calculate dependencies by detection method
 */
function calculateByDetectionMethod(dependencies: any[]): Record<string, number> {
  const byDetectionMethod: Record<string, number> = {};
  for (const dep of dependencies) {
    byDetectionMethod[dep.detectionMethod] = (byDetectionMethod[dep.detectionMethod] || 0) + 1;
  }
  return byDetectionMethod;
}
