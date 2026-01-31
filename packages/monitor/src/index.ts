/**
 * @dependabit/monitor - Dependency change detection and monitoring
 */

export { Monitor } from './monitor.js';
export type { DependencyConfig, CheckResult } from './monitor.js';

export { GitHubRepoChecker } from './checkers/github-repo.js';
export { URLContentChecker } from './checkers/url-content.js';

export { StateComparator } from './comparator.js';
export { SeverityClassifier } from './severity.js';
export type { Severity } from './severity.js';

export { normalizeHTML, normalizeURL } from './normalizer.js';

export { Scheduler } from './scheduler.js';

export type {
  Checker,
  DependencySnapshot,
  ChangeDetection,
  AccessConfig
} from './types.js';
