/**
 * Check Action
 * Monitors dependencies for changes and creates issues when updates are detected
 */

import { Monitor } from '@dependabit/monitor';
import type { DependencyConfig } from '@dependabit/monitor';
import { IssueManager, RateLimitHandler } from '@dependabit/github-client';
import { SummaryReporter } from '../utils/reporter.js';
import type { DependencyChange } from '../utils/reporter.js';

export interface Manifest {
  version: string;
  dependencies: Array<DependencyConfig & {
    name?: string;
    type?: string;
    lastChanged?: string;
  }>;
}

export interface CheckActionResult {
  checked: number;
  skipped: number;
  changes: DependencyChange[];
  issuesCreated: number;
  errors: number;
  rateLimitWarnings?: string[];
  updatedManifest: Manifest;
}

/**
 * Main check action - monitors dependencies and creates issues
 */
export async function checkAction(
  manifest: Manifest,
  options?: {
    owner?: string;
    repo?: string;
    createIssues?: boolean;
    dryRun?: boolean;
  }
): Promise<CheckActionResult> {
  const {
    owner = process.env['GITHUB_REPOSITORY_OWNER'] || '',
    repo = process.env['GITHUB_REPOSITORY']?.split('/')[1] || '',
    createIssues = true,
    dryRun = false
  } = options || {};

  const monitor = new Monitor();
  const issueManager = new IssueManager();
  const rateLimitHandler = new RateLimitHandler();
  const reporter = new SummaryReporter();

  const result: CheckActionResult = {
    checked: 0,
    skipped: 0,
    changes: [],
    issuesCreated: 0,
    errors: 0,
    rateLimitWarnings: [],
    updatedManifest: {
      ...manifest,
      dependencies: manifest.dependencies.map(dep => ({ ...dep }))
    }
  };

  // Check rate limit before starting
  const rateLimit = await rateLimitHandler.checkRateLimit();
  if (rateLimit.warning) {
    result.rateLimitWarnings?.push(rateLimit.warning);
  }

  // Filter enabled dependencies
  const enabledDeps = manifest.dependencies.filter(dep => {
    if (dep.monitoring?.enabled === false) {
      result.skipped++;
      return false;
    }
    return true;
  });

  console.log(`Checking ${enabledDeps.length} dependencies (${result.skipped} skipped)...`);

  // Check all dependencies
  const checkResults = await monitor.checkAll(enabledDeps);

  // Process results
  for (const checkResult of checkResults) {
    if (!checkResult) continue;
    
    const depIndex = manifest.dependencies.findIndex(d => d.id === checkResult.dependency.id);

    if (checkResult.error) {
      console.error(`Error checking ${checkResult.dependency.id}: ${checkResult.error}`);
      result.errors++;
      continue;
    }

    result.checked++;

    // Update manifest with new state
    if (checkResult.newSnapshot && depIndex >= 0) {
      const dep = result.updatedManifest.dependencies[depIndex];
      if (dep) {
        dep.currentStateHash = checkResult.newSnapshot.stateHash;
        dep.lastChecked = checkResult.newSnapshot.fetchedAt.toISOString();

        if (checkResult.newSnapshot.version) {
          dep.currentVersion = checkResult.newSnapshot.version;
        }
      }
    }

    // Handle detected changes
    if (checkResult.hasChanged && checkResult.changes && checkResult.severity) {
      const change: DependencyChange = {
        dependency: {
          id: checkResult.dependency.id,
          ...(checkResult.dependency.name && { name: checkResult.dependency.name }),
          url: checkResult.dependency.url,
          ...(checkResult.dependency.type && { type: checkResult.dependency.type })
        },
        severity: checkResult.severity,
        changes: checkResult.changes.changes,
        oldVersion: checkResult.changes.oldVersion,
        newVersion: checkResult.changes.newVersion
      };

      result.changes.push(change);

      // Update lastChanged timestamp
      if (depIndex >= 0) {
        const dep = result.updatedManifest.dependencies[depIndex];
        if (dep) {
          dep.lastChanged = new Date().toISOString();
        }
      }

      // Create issue if enabled
      if (createIssues && !dryRun && owner && repo) {
        try {
          // Check if issue already exists
          const existing = await issueManager.findExistingIssue({
            owner,
            repo,
            dependencyId: checkResult.dependency.id
          });

          if (existing) {
            // Update existing issue
            const updateBody = reporter.generateIssueBody(change);
            await issueManager.updateIssue({
              owner,
              repo,
              issueNumber: existing.number,
              body: updateBody,
              severity: checkResult.severity,
              append: true
            });
            console.log(`Updated existing issue #${existing.number} for ${checkResult.dependency.id}`);
          } else {
            // Create new issue
            const issueBody = reporter.generateIssueBody(change);
            const issue = await issueManager.createIssue({
              owner,
              repo,
              title: `Dependency Update: ${change.dependency.name || change.dependency.id}`,
              body: issueBody,
              severity: checkResult.severity,
              dependency: {
                id: checkResult.dependency.id,
                url: checkResult.dependency.url
              }
            });
            result.issuesCreated++;
            console.log(`Created issue #${issue.number} for ${checkResult.dependency.id}`);
          }
        } catch (error) {
          console.error(`Failed to create/update issue for ${checkResult.dependency.id}:`, error);
          result.errors++;
        }
      }
    }
  }

  // Generate and log summary
  const summary = reporter.generateSummary(result.changes);
  console.log('\n' + summary);

  // Check rate limit after processing
  const finalRateLimit = await rateLimitHandler.checkRateLimit();
  if (finalRateLimit.warning && !result.rateLimitWarnings?.includes(finalRateLimit.warning)) {
    result.rateLimitWarnings?.push(finalRateLimit.warning);
  }

  return result;
}
