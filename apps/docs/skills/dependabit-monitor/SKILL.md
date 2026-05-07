---
name: dependabit-monitor
description: "Documentation site for dependabit Use when: Polling a set of tracked dependencies for state changes on a schedule.."
---

# @dependabit/monitor

Documentation site for dependabit

## When to Use

**Use this skill when:**
- Polling a set of tracked dependencies for state changes on a schedule. → use `Monitor`
- Implementing a custom checker for a new access method (e.g., a proprietary API or registry).  Register it with Monitor.registerChecker. → use `GitHubRepoChecker`
- Implementing a custom checker for a new access method (e.g., a proprietary API or registry).  Register it with Monitor.registerChecker. → use `URLContentChecker`
- Implementing a custom checker for a new access method (e.g., a proprietary API or registry).  Register it with Monitor.registerChecker. → use `OpenAPIChecker`

**Do NOT use when:**
- You only need to check a single dependency type — instantiate the specific checker (e.g., `GitHubRepoChecker`) directly to avoid loading all built-in checkers.

API surface: 2 functions, 7 classes, 5 types

## NEVER

- **Concurrent update races**: if two `Monitor` instances watch the same dependency and call `updateDependency` on the shared manifest file simultaneously, one write will silently overwrite the other.  Serialise monitor runs or use a single shared `Monitor` instance.
- **ETag drift false positives**: the `URLContentChecker` hashes the full HTTP response body.  Dynamic content (ads, timestamps, CSP nonces) in the response will produce hash changes that are not real dependency updates.  Use `monitoring.ignoreChanges: true` for URLs with high natural churn, or replace them with a more specific checker.
- **Clock skew**: `Scheduler.shouldCheckDependency` compares `dependency.lastChecked` to wall clock time.  If the system clock jumps backward (e.g., NTP correction), dependencies may be skipped until the clock catches up to the stored `lastChecked` timestamp.
- `fetch` should throw only for unrecoverable errors (network failure, auth error).  Temporary 5xx responses should be retried inside the implementation to avoid marking the dependency as errored.
- `compare` receives the **stored** previous snapshot and the **live** current snapshot.  Do not assume both snapshots were produced by the same checker version.
- `fetch` should throw only for unrecoverable errors (network failure, auth error).  Temporary 5xx responses should be retried inside the implementation to avoid marking the dependency as errored.
- `compare` receives the **stored** previous snapshot and the **live** current snapshot.  Do not assume both snapshots were produced by the same checker version.
- `fetch` should throw only for unrecoverable errors (network failure, auth error).  Temporary 5xx responses should be retried inside the implementation to avoid marking the dependency as errored.
- `compare` receives the **stored** previous snapshot and the **live** current snapshot.  Do not assume both snapshots were produced by the same checker version.

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**normalizer:** `normalizeHTML` (Normalizes HTML content for consistent comparison), `normalizeURL` (Normalizes a URL by removing tracking parameters)
**Monitor:** `Monitor` (Orchestrates dependency checking across multiple access methods), `GitHubRepoChecker` (Contract for all dependency checker implementations), `URLContentChecker` (Contract for all dependency checker implementations), `OpenAPIChecker` (Contract for all dependency checker implementations), `CheckResult` (The outcome of a single dependency check performed by Monitor), `Checker` (Contract for all dependency checker implementations), `DependencySnapshot` (A point-in-time snapshot of a dependency's state), `ChangeDetection` (The result of comparing two DependencySnapshot objects)
**comparator:** `StateComparator`
**severity:** `SeverityClassifier`, `Severity`
**scheduler:** `Scheduler` (Scheduler for per-dependency monitoring

Determines which...)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)