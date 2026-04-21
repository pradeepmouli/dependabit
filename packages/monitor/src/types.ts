/**
 * Common types for dependency checkers.
 *
 * @remarks
 * These types define the low-level protocol between the {@link Monitor}
 * orchestrator and individual checker implementations.
 *
 * @module
 */

/**
 * A point-in-time snapshot of a dependency's state.
 *
 * @remarks
 * `stateHash` is a hex-encoded SHA-256 (or equivalent) of the dependency's
 * content at the time of the fetch.  It is used for equality comparison
 * between snapshots — a hash change signals a potential update.
 *
 * @category Monitor
 *
 * @never
 * - Different checker implementations may compute `stateHash` differently
 *   (e.g., hashing the full HTTP body vs. only the version string).
 *   Snapshots produced by different checkers for the same URL are **not**
 *   interchangeable and should not be compared directly.
 */
export interface DependencySnapshot {
  version?: string | undefined;
  stateHash: string;
  fetchedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * The result of comparing two {@link DependencySnapshot} objects.
 *
 * @remarks
 * When `hasChanged` is `true`, `changes` lists the fields that differed
 * (e.g. `'version'`, `'content'`).  The strings are checker-specific and
 * should not be parsed programmatically.
 *
 * @category Monitor
 *
 * @never
 * - `hasChanged: true` does not guarantee a real change; ETag drift in
 *   dynamic HTTP responses can trigger false positives for URL-based
 *   checkers.  See `URLContentChecker` pitfalls.
 */
export interface ChangeDetection {
  hasChanged: boolean;
  changes: string[];
  oldVersion?: string | undefined;
  newVersion?: string | undefined;
  diff?: unknown;
  severity?: 'breaking' | 'major' | 'minor';
}

/**
 * Minimum configuration required to fetch and compare a dependency.
 *
 * @config
 * @category Monitor
 *
 * @never
 * - `auth.secret` contains the raw credential value at runtime.  **Never**
 *   persist this object to disk or logs.  Store the secret reference in
 *   `DependencyEntry.auth.secretEnvVar` and resolve it at runtime.
 */
export interface AccessConfig {
  url: string;
  accessMethod: 'github-api' | 'http' | 'openapi' | 'context7' | 'arxiv';
  auth?: {
    type: 'token' | 'basic' | 'oauth' | 'none';
    secret?: string;
  };
}

/**
 * Contract for all dependency checker implementations.
 *
 * @remarks
 * The {@link Monitor} selects a checker based on `AccessConfig.accessMethod`
 * and calls `fetch` followed by `compare`.  Plugins implement this interface
 * to extend the set of supported access methods.
 *
 * @category Monitor
 *
 * @useWhen
 * Implementing a custom checker for a new access method (e.g., a proprietary
 * API or registry).  Register it with {@link Monitor.registerChecker}.
 *
 * @never
 * - `fetch` should throw only for unrecoverable errors (network failure,
 *   auth error).  Temporary 5xx responses should be retried inside the
 *   implementation to avoid marking the dependency as errored.
 * - `compare` receives the **stored** previous snapshot and the **live**
 *   current snapshot.  Do not assume both snapshots were produced by the
 *   same checker version.
 */
export interface Checker {
  /**
   * Fetches the current state of a dependency.
   */
  fetch(config: AccessConfig): Promise<DependencySnapshot>;

  /**
   * Compares two snapshots to detect changes.
   */
  compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection>;
}
