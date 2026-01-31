/**
 * Common types for dependency checkers
 */

export interface DependencySnapshot {
  version?: string;
  stateHash: string;
  fetchedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ChangeDetection {
  hasChanged: boolean;
  changes: string[];
  oldVersion?: string;
  newVersion?: string;
  diff?: unknown;
  severity?: 'breaking' | 'major' | 'minor';
}

export interface AccessConfig {
  url: string;
  accessMethod: 'github-api' | 'http' | 'openapi' | 'context7' | 'arxiv';
  auth?: {
    type: 'token' | 'basic' | 'oauth' | 'none';
    secret?: string;
  };
}

export interface Checker {
  /**
   * Fetches the current state of a dependency
   */
  fetch(config: AccessConfig): Promise<DependencySnapshot>;

  /**
   * Compares two snapshots to detect changes
   */
  compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection>;
}
