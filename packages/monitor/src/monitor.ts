/**
 * Monitor Orchestrator
 * Coordinates dependency checking across multiple access methods
 */

import { GitHubRepoChecker } from './checkers/github-repo.js';
import { URLContentChecker } from './checkers/url-content.js';
import { StateComparator } from './comparator.js';
import { SeverityClassifier } from './severity.js';
import type { Checker, AccessConfig, DependencySnapshot, ChangeDetection } from './types.js';

export interface DependencyConfig extends AccessConfig {
  id: string;
  name?: string;
  type?: string;
  currentStateHash: string;
  currentVersion?: string;
  lastChecked?: string;
  monitoring?: {
    enabled?: boolean;
    ignoreChanges?: boolean;
  };
}

export interface CheckResult {
  dependency: DependencyConfig;
  hasChanged: boolean;
  changes?: ChangeDetection;
  severity?: 'breaking' | 'major' | 'minor' | undefined;
  newSnapshot?: DependencySnapshot;
  error?: string;
}

export class Monitor {
  private checkers: Map<string, Checker>;
  private comparator: StateComparator;
  private classifier: SeverityClassifier;

  constructor() {
    this.checkers = new Map();
    this.checkers.set('github-api', new GitHubRepoChecker());
    this.checkers.set('http', new URLContentChecker());

    this.comparator = new StateComparator();
    this.classifier = new SeverityClassifier();
  }

  /**
   * Checks a single dependency for changes
   */
  async checkDependency(dependency: DependencyConfig): Promise<CheckResult> {
    try {
      // Get appropriate checker for access method
      const checker = this.checkers.get(dependency.accessMethod);
      if (!checker) {
        throw new Error(`Unsupported access method: ${dependency.accessMethod}`);
      }

      // Fetch current state
      const newSnapshot = await checker.fetch(dependency);

      // Create old snapshot from stored data
      const oldSnapshot: DependencySnapshot = {
        stateHash: dependency.currentStateHash,
        version: dependency.currentVersion,
        fetchedAt: dependency.lastChecked ? new Date(dependency.lastChecked) : new Date()
      };

      // Compare states
      const changes = await checker.compare(oldSnapshot, newSnapshot);

      // Classify severity if changes detected
      let severity: 'breaking' | 'major' | 'minor' | undefined;
      if (changes.hasChanged) {
        severity = this.classifier.classify(changes);
      }

      return {
        dependency,
        hasChanged: changes.hasChanged,
        changes,
        severity,
        newSnapshot
      };
    } catch (error) {
      return {
        dependency,
        hasChanged: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Checks multiple dependencies, respecting monitoring rules
   */
  async checkAll(dependencies: DependencyConfig[]): Promise<CheckResult[]> {
    // Filter out disabled dependencies
    const enabledDeps = dependencies.filter(dep => {
      if (dep.monitoring?.enabled === false) {
        return false;
      }
      if (dep.monitoring?.ignoreChanges === true) {
        return false;
      }
      return true;
    });

    // Check all dependencies in parallel
    const results = await Promise.all(
      enabledDeps.map(dep => this.checkDependency(dep))
    );

    return results;
  }

  /**
   * Registers a custom checker for an access method
   */
  registerChecker(accessMethod: string, checker: Checker): void {
    this.checkers.set(accessMethod, checker);
  }
}
