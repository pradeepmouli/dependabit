/**
 * Update Action
 * Analyze commits and update manifest with new/removed dependencies
 */

import * as core from '@actions/core';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { Detector, GitHubCopilotProvider, extractDependencyChanges } from '@dependabit/detector';
import { readManifest, writeManifest, mergeManifests, type DependencyManifest } from '@dependabit/manifest';
import { createGitHubClient, getCommitDiff } from '@dependabit/github-client';
import { createLogger, withTiming } from '../logger.js';
import { parseUpdateInputs } from '../utils/inputs.js';
import { setUpdateOutputs, createUpdateSummary } from '../utils/outputs.js';

/**
 * Main entry point for the update action
 */
export async function run(): Promise<void> {
  const logger = createLogger({ enableDebug: true });

  try {
    logger.startGroup('📋 Parsing Action Inputs');
    const inputs = parseUpdateInputs();
    logger.info('Action inputs parsed', {
      repoPath: inputs.repoPath,
      manifestPath: inputs.manifestPath,
      commits: inputs.commits.length > 0 ? inputs.commits : 'auto-detect'
    });
    logger.endGroup();

    // Get repository information from environment
    const repository = process.env['GITHUB_REPOSITORY'];
    if (!repository) {
      throw new Error('GITHUB_REPOSITORY environment variable not set');
    }
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid GITHUB_REPOSITORY format: ${repository}`);
    }

    // Check if manifest exists
    const manifestPath = join(inputs.repoPath, inputs.manifestPath);
    if (!existsSync(manifestPath)) {
      logger.info('⚠️  No existing manifest found. Run generate action first.');
      core.setOutput('changes_detected', false);
      core.setOutput('dependencies_added', 0);
      core.setOutput('dependencies_removed', 0);
      core.setOutput('total_dependencies', 0);
      core.setOutput('files_analyzed', 0);
      return;
    }

    // Read existing manifest
    logger.startGroup('📄 Reading Existing Manifest');
    const existingManifest = await readManifest(manifestPath);
    logger.info('Manifest loaded', {
      dependencyCount: existingManifest.dependencies.length,
      version: existingManifest.version
    });
    logger.endGroup();

    // Initialize GitHub client
    logger.startGroup('🔗 Initializing GitHub Client');
    const githubToken = process.env['GITHUB_TOKEN'];
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable not set');
    }
    const client = createGitHubClient({ auth: githubToken });
    logger.info('GitHub client initialized');
    logger.endGroup();

    // Determine commits to analyze
    logger.startGroup('📊 Analyzing Commits');
    let commitsToAnalyze = inputs.commits;
    
    if (commitsToAnalyze.length === 0) {
      // Auto-detect commits from the push event
      const headRef = process.env['GITHUB_SHA'];
      
      if (headRef) {
        // For push events, get commits from the push payload
        const eventPath = process.env['GITHUB_EVENT_PATH'];
        if (eventPath) {
          try {
            const event = JSON.parse(await import('node:fs').then(fs => fs.promises.readFile(eventPath, 'utf-8')));
            if (event.commits && Array.isArray(event.commits)) {
              commitsToAnalyze = event.commits.map((c: any) => c.id || c.sha);
              logger.info('Detected commits from push event', { count: commitsToAnalyze.length });
            }
          } catch (error) {
            logger.warning('Failed to parse GitHub event payload', { 
              error: String(error),
              eventPath 
            });
          }
        }
        
        // Fallback: analyze the last commit
        if (commitsToAnalyze.length === 0) {
          commitsToAnalyze = [headRef];
          logger.info('Using HEAD commit', { sha: headRef });
        }
      }
    }

    if (commitsToAnalyze.length === 0) {
      logger.info('⚠️  No commits to analyze');
      core.setOutput('changes_detected', false);
      return;
    }

    logger.info('Commits to analyze', { count: commitsToAnalyze.length, shas: commitsToAnalyze.slice(0, 5) });
    logger.endGroup();

    // Fetch and analyze commit diffs
    logger.startGroup('🔍 Analyzing Commit Diffs');
    const allChangedFiles: string[] = [];
    const allAddedUrls: Set<string> = new Set();
    const allRemovedUrls: Set<string> = new Set();

    for (const sha of commitsToAnalyze) {
      const diff = await withTiming(logger, `fetch-commit-${sha.substring(0, 7)}`, async () => {
        return await getCommitDiff(client, owner, repo, sha);
      });

      const changes = extractDependencyChanges(diff.files);
      
      // Track changed files
      for (const file of changes.changedFiles.relevantFiles) {
        if (!allChangedFiles.includes(file)) {
          allChangedFiles.push(file);
        }
      }

      // Track URL changes
      changes.addedUrls.forEach(url => allAddedUrls.add(url));
      changes.removedUrls.forEach(url => allRemovedUrls.add(url));

      logger.info('Commit analyzed', {
        sha: sha.substring(0, 7),
        filesChanged: diff.files.length,
        relevantFiles: changes.changedFiles.relevantFiles.length,
        addedUrls: changes.addedUrls.length,
        removedUrls: changes.removedUrls.length
      });
    }

    logger.info('All commits analyzed', {
      totalChangedFiles: allChangedFiles.length,
      totalAddedUrls: allAddedUrls.size,
      totalRemovedUrls: allRemovedUrls.size
    });
    logger.endGroup();

    // Re-analyze changed files if any
    logger.startGroup('🔍 Re-analyzing Changed Files');
    let newDependencies: DependencyManifest['dependencies'] = [];

    if (allChangedFiles.length > 0) {
      // Initialize LLM provider for selective analysis
      const llmProvider = new GitHubCopilotProvider({
        apiKey: githubToken
      });

      // Create detector
      const detector = new Detector({
        repoPath: inputs.repoPath,
        llmProvider
      });

      const result = await withTiming(logger, 'selective-analysis', async () => {
        return await detector.analyzeFiles(allChangedFiles);
      });

      newDependencies = result.dependencies;

      logger.info('Selective analysis complete', {
        filesAnalyzed: result.statistics.filesScanned,
        dependenciesFound: newDependencies.length,
        llmCalls: result.statistics.llmCalls
      });
    }
    logger.endGroup();

    // Create updated manifest
    logger.startGroup('🔄 Merging Manifests');
    const updatedManifest: DependencyManifest = {
      ...existingManifest,
      generatedAt: new Date().toISOString(),
      generatedBy: {
        action: 'dependabit-update',
        version: '1.0.0',
        llmProvider: 'github-copilot',
        llmModel: 'gpt-4'
      },
      repository: {
        owner,
        name: repo,
        branch: process.env['GITHUB_REF_NAME'] || existingManifest.repository.branch || 'main',
        commit: process.env['GITHUB_SHA'] || existingManifest.repository.commit || 'unknown'
      },
      dependencies: newDependencies
    };

    // Merge with existing manifest (preserves manual entries)
    const merged = mergeManifests(existingManifest, updatedManifest, {
      preserveManual: true,
      preserveHistory: true
    });

    // Mark removed dependencies
    const removedUrls = Array.from(allRemovedUrls);
    for (const dep of merged.dependencies) {
      if (removedUrls.includes(dep.url)) {
        // Mark as potentially removed (could be a false positive)
        logger.info('Dependency potentially removed', {
          name: dep.name,
          url: dep.url
        });
      }
    }

    const dependenciesAdded = merged.dependencies.length - existingManifest.dependencies.length;
    const changesDetected = dependenciesAdded !== 0 || removedUrls.length > 0;

    logger.info('Manifests merged', {
      before: existingManifest.dependencies.length,
      after: merged.dependencies.length,
      added: Math.max(0, dependenciesAdded),
      manualPreserved: merged.dependencies.filter(d => d.detectionMethod === 'manual').length
    });
    logger.endGroup();

    // Write updated manifest
    logger.startGroup('💾 Writing Updated Manifest');
    await writeManifest(manifestPath, merged);
    logger.info('Manifest updated', { path: manifestPath });
    logger.endGroup();

    // Set outputs
    logger.startGroup('📊 Setting Outputs');
    setUpdateOutputs(merged, existingManifest, allChangedFiles.length);
    logger.endGroup();

    // Create summary
    logger.startGroup('📝 Creating Summary');
    await createUpdateSummary(existingManifest, merged, {
      commitsAnalyzed: commitsToAnalyze.length,
      filesChanged: allChangedFiles.length,
      urlsAdded: allAddedUrls.size,
      urlsRemoved: allRemovedUrls.size
    });
    logger.endGroup();

    if (changesDetected) {
      logger.info('✅ Update action completed with changes');
    } else {
      logger.info('✅ Update action completed - no changes detected');
    }
  } catch (error) {
    logger.error('Update action failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

// Run the action
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
