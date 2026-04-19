---
name: dependabit-monitor
description: Documentation site for dependabit
---

# @dependabit/monitor

Documentation site for dependabit

## When to Use

- API surface: 2 functions, 7 classes, 5 types

## Configuration

### DependencyConfig

Runtime descriptor passed to the monitor for a single tracked dependency.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `string` | yes | — |  |
| `name` | `string` | no | — |  |
| `type` | `string` | no | — |  |
| `currentStateHash` | `string` | yes | — |  |
| `currentVersion` | `string` | no | — |  |
| `lastChecked` | `string` | no | — |  |
| `monitoring` | `{ enabled?: boolean; ignoreChanges?: boolean }` | no | — |  |
| `url` | `string` | yes | — |  |
| `accessMethod` | `"context7" | "arxiv" | "openapi" | "github-api" | "http"` | yes | — |  |
| `auth` | `{ type: "token" | "oauth" | "basic" | "none"; secret?: string }` | no | — |  |

**Pitfalls:**
- `currentStateHash` must reflect the **last known good state** fetched by
- the monitor.  An empty string or stale hash causes the first check to
- always report a change (false positive on first run).
- `lastChecked` is used by the `Scheduler` to decide whether a dependency
- is due for checking.  An incorrect or missing timestamp causes either
- perpetual over-checking (missing timestamp) or silent skipping (future
- timestamp).

### AccessConfig

Minimum configuration required to fetch and compare a dependency.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `string` | yes | — |  |
| `accessMethod` | `"context7" | "arxiv" | "openapi" | "github-api" | "http"` | yes | — |  |
| `auth` | `{ type: "token" | "oauth" | "basic" | "none"; secret?: string }` | no | — |  |

**Pitfalls:**
- `auth.secret` contains the raw credential value at runtime.  **Never**
- persist this object to disk or logs.  Store the secret reference in
- `DependencyEntry.auth.secretEnvVar` and resolve it at runtime.

## Quick Reference

**normalizer:** `normalizeHTML`, `normalizeURL`
**Monitor:** `Monitor`, `GitHubRepoChecker`, `URLContentChecker`, `OpenAPIChecker`, `CheckResult`, `Checker`, `DependencySnapshot`, `ChangeDetection`
**comparator:** `StateComparator`
**severity:** `SeverityClassifier`, `Severity`
**scheduler:** `Scheduler`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)