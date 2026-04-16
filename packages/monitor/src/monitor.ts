/**
 * Monitor Orchestrator
 * Coordinates dependency checking across multiple access methods
 */

import { GitHubRepoChecker } from './checkers/github-repo.js';
import { URLContentChecker } from './checkers/url-content.js';
import { OpenAPIChecker } from './checkers/openapi.js';
import { SeverityClassifier } from './severity.js';
import type { Checker, AccessConfig, DependencySnapshot, ChangeDetection } from './types.js';

/**
 * Runtime descriptor passed to the monitor for a single tracked dependency.
 *
 * @remarks
 * Extends {@link AccessConfig} with identity, state-tracking, and monitoring
 * rule fields.  This is typically constructed by reading a
 * `DependencyEntry` from a manifest and projecting the relevant fields.
 *
 * @config
 * @category Monitor
 *
 * @pitfalls
 * - `currentStateHash` must reflect the **last known good state** fetched by
 *   the monitor.  An empty string or stale hash causes the first check to
 *   always report a change (false positive on first run).
 * - `lastChecked` is used by the `Scheduler` to decide whether a dependency
 *   is due for checking.  An incorrect or missing timestamp causes either
 *   perpetual over-checking (missing timestamp) or silent skipping (future
 *   timestamp).
 */
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

/**
 * The outcome of a single dependency check performed by {@link Monitor}.
 *
 * @remarks
 * When `hasChanged` is `false` and `error` is undefined, the dependency's
 * state is unchanged.  When `error` is set, the check failed and the
 * snapshot should **not** be used to update the manifest.
 *
 * @category Monitor
 */
export interface CheckResult {
  dependency: DependencyConfig;
  hasChanged: boolean;
  changes?: ChangeDetection;
  severity?: 'breaking' | 'major' | 'minor' | undefined;
  newSnapshot?: DependencySnapshot;
  /** Non-empty string if the check failed; callers should log and skip. */
  error?: string;
}

/**
 * Orchestrates dependency checking across multiple access methods.
 *
 * @remarks
 * Built-in checkers are registered for `github-api`, `http`, and `openapi`
 * access methods.  Additional checkers (e.g., from plugin packages) can be
 * registered with {@link Monitor.registerChecker}.
 *
 * All checks in {@link Monitor.checkAll} run concurrently via
 * `Promise.all`.  If one checker throws, its result contains an `error`
 * string but the other checks complete normally.
 *
 * @category Monitor
 *
 * @useWhen
 * Polling a set of tracked dependencies for state changes on a schedule.
 *
 * @avoidWhen
 * You only need to check a single dependency type — instantiate the
 * specific checker (e.g., `GitHubRepoChecker`) directly to avoid loading
 * all built-in checkers.
 *
 * @pitfalls
 * - **Concurrent update races**: if two `Monitor` instances watch the same
 *   dependency and call `updateDependency` on the shared manifest file
 *   simultaneously, one write will silently overwrite the other.  Serialise
 *   monitor runs or use a single shared `Monitor` instance.
 * - **ETag drift false positives**: the `URLContentChecker` hashes the full
 *   HTTP response body.  Dynamic content (ads, timestamps, CSP nonces) in
 *   the response will produce hash changes that are not real dependency
 *   updates.  Use `monitoring.ignoreChanges: true` for URLs with high
 *   natural churn, or replace them with a more specific checker.
 * - **Clock skew**: `Scheduler.shouldCheckDependency` compares
 *   `dependency.lastChecked` to wall clock time.  If the system clock jumps
 *   backward (e.g., NTP correction), dependencies may be skipped until the
 *   clock catches up to the stored `lastChecked` timestamp.
 *
 * @example
 * ```ts
 * import { Monitor } from '@dependabit/monitor';
 *
 * const monitor = new Monitor();
 * const results = await monitor.checkAll(dependencies);
 * for (const result of results) {
 *   if (result.hasChanged) {
 *     console.log(`${result.dependency.url} changed with severity ${result.severity}`);
 *   }
 * }
 * ```
 */
export class Monitor {
  private checkers: Map<string, Checker>;
  private classifier: SeverityClassifier;

  constructor() {
    this.checkers = new Map();
    this.checkers.set('github-api', new GitHubRepoChecker());
    this.checkers.set('http', new URLContentChecker());
    this.checkers.set('openapi', new OpenAPIChecker());

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
    const enabledDeps = dependencies.filter((dep) => {
      if (dep.monitoring?.enabled === false) {
        return false;
      }
      if (dep.monitoring?.ignoreChanges === true) {
        return false;
      }
      return true;
    });

    // Check all dependencies in parallel
    const results = await Promise.all(enabledDeps.map((dep) => this.checkDependency(dep)));

    return results;
  }

  /**
   * Registers a custom checker for an access method
   */
  registerChecker(accessMethod: string, checker: Checker): void {
    this.checkers.set(accessMethod, checker);
  }
}
