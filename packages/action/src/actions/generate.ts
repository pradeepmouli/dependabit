/**
 * Generate Action
 * Initial manifest generation by analyzing the repository
 */

import * as core from '@actions/core';
import { join } from 'node:path';
import { Detector, GitHubCopilotProvider } from '@dependabit/detector';
import { writeManifest, type DependencyManifest } from '@dependabit/manifest';
import { createLogger, withTiming } from '../logger.js';
import { parseGenerateInputs } from '../utils/inputs.js';
import { setGenerateOutputs, createGenerateSummary, createDependencyListSummary } from '../utils/outputs.js';

/**
 * Main entry point for the generate action
 */
export async function run(): Promise<void> {
  const logger = createLogger({ enableDebug: true });
  
  try {
    logger.startGroup('📋 Parsing Action Inputs');
    const inputs = parseGenerateInputs();
    logger.info('Action inputs parsed', {
      repoPath: inputs.repoPath,
      llmProvider: inputs.llmProvider,
      llmModel: inputs.llmModel || 'default',
      manifestPath: inputs.manifestPath
    });
    logger.endGroup();

    // Initialize LLM provider
    logger.startGroup('🤖 Initializing LLM Provider');
    const llmProvider = new GitHubCopilotProvider({
      ...(inputs.llmApiKey && { apiKey: inputs.llmApiKey }),
      ...(inputs.llmModel && { model: inputs.llmModel })
    });
    logger.info('LLM provider initialized', {
      provider: inputs.llmProvider,
      model: inputs.llmModel || 'gpt-4',
      hasApiKey: !!inputs.llmApiKey
    });
    logger.endGroup();

    // Create detector
    logger.startGroup('🔍 Detecting Dependencies');
    const detector = new Detector({
      repoPath: inputs.repoPath,
      llmProvider
    });

    const result = await withTiming(logger, 'dependency-detection', async () => {
      return await detector.detectDependencies();
    });

    logger.info('Detection complete', {
      dependencyCount: result.dependencies.length,
      filesScanned: result.statistics.filesScanned,
      urlsFound: result.statistics.urlsFound,
      llmCalls: result.statistics.llmCalls,
      totalTokens: result.statistics.totalTokens
    });
    logger.endGroup();

    // Create manifest
    logger.startGroup('📄 Creating Manifest');
    const manifest = await createManifest(inputs.repoPath, result.dependencies, inputs.llmProvider);
    
    const manifestPath = join(inputs.repoPath, inputs.manifestPath);
    await writeManifest(manifestPath, manifest);
    
    logger.info('Manifest written', {
      path: manifestPath,
      dependencyCount: manifest.dependencies.length
    });
    logger.endGroup();

    // Set outputs
    logger.startGroup('📊 Setting Outputs');
    setGenerateOutputs(manifest, inputs.manifestPath, result.statistics);
    logger.endGroup();

    // Create summary
    logger.startGroup('📝 Creating Summary');
    await createGenerateSummary(manifest, result.statistics);
    await createDependencyListSummary(
      manifest.dependencies.map(dep => ({
        name: dep.name,
        url: dep.url,
        type: dep.type,
        confidence: dep.detectionConfidence
      }))
    );
    logger.endGroup();

    logger.info('✅ Generate action completed successfully');
  } catch (error) {
    logger.error('Generate action failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create the manifest structure
 */
async function createManifest(
  repoPath: string,
  dependencies: any[],
  llmProvider: string
): Promise<DependencyManifest> {
  // Get repository info from GitHub context or git
  const owner = process.env['GITHUB_REPOSITORY']?.split('/')[0] || 'unknown';
  const name = process.env['GITHUB_REPOSITORY']?.split('/')[1] || 'unknown';
  const branch = process.env['GITHUB_REF_NAME'] || 'main';
  const commit = process.env['GITHUB_SHA'] || 'unknown';

  // Calculate statistics
  const byType: Record<string, number> = {};
  const byAccessMethod: Record<string, number> = {};
  const byDetectionMethod: Record<string, number> = {};
  let totalConfidence = 0;

  for (const dep of dependencies) {
    byType[dep.type] = (byType[dep.type] || 0) + 1;
    byAccessMethod[dep.accessMethod] = (byAccessMethod[dep.accessMethod] || 0) + 1;
    byDetectionMethod[dep.detectionMethod] = (byDetectionMethod[dep.detectionMethod] || 0) + 1;
    totalConfidence += dep.detectionConfidence;
  }

  const averageConfidence = dependencies.length > 0 ? totalConfidence / dependencies.length : 0;

  const manifest: DependencyManifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    generatedBy: {
      action: 'dependabit',
      version: '1.0.0',
      llmProvider: llmProvider,
      llmModel: 'gpt-4'
    },
    repository: {
      owner,
      name,
      branch,
      commit
    },
    dependencies,
    statistics: {
      totalDependencies: dependencies.length,
      byType,
      byAccessMethod,
      byDetectionMethod,
      averageConfidence
    }
  };

  return manifest;
}

// Run the action
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
