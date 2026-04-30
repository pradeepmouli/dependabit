---
name: dependabit
description: "Use when working with dependabit (action, detector, github-client, manifest, monitor, test-utils, utils, plugins, plugin-arxiv, plugin-context7, plugin-skills)."
---
# dependabit

**Use this skill for ANY work with dependabit.** It routes to the correct package.

## When to Use

Use this router when:
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit
- Documentation site for dependabit

## Decision Tree

1. Documentation site for dependabit? → `dependabit-action`
2. Documentation site for dependabit? → `dependabit-detector`
3. Documentation site for dependabit? → `dependabit-github-client`
4. Documentation site for dependabit? → `dependabit-manifest`
5. Documentation site for dependabit? → `dependabit-monitor`
6. Documentation site for dependabit? → `dependabit-test-utils`
7. Documentation site for dependabit? → `dependabit-utils`
8. Documentation site for dependabit? → `dependabit-plugins`
9. Documentation site for dependabit? → `dependabit-plugin-arxiv`
10. Documentation site for dependabit? → `dependabit-plugin-context7`
11. Documentation site for dependabit? → `dependabit-plugin-skills`

## Routing Logic

### action → `dependabit-action`

Key APIs: `Logger`, `main`, `createLogger`, `withTiming`

### detector → `dependabit-detector`

- You need to plug in a custom or self-hosted language model as the classification backend for the detector.
- Scanning a freshly-cloned or locally-checked-out repository to build an initial manifest, or during CI to detect newly-introduced dependencies from a commit diff.

Key APIs: `GitHubCopilotProvider`, `Detector`, `createDetectionPrompt`, `createClassificationPrompt`, `parseReadme`

### github-client → `dependabit-github-client`

- Making authenticated GitHub API calls from the monitor or action packages where you need integrated rate-limit protection.
- Coordinating large batches of GitHub API calls (e.g., checking 100+ dependencies in one monitor run) where you need pre-flight quota checks.

Key APIs: `GitHubClient`, `AuthManager`, `IssueManager`, `createGitHubClient`, `fetchCommits`

### manifest → `dependabit-manifest`

- Loading an existing manifest to pass to the monitor or detector.
- Applying the output of Detector to an existing manifest without losing manually-curated entries or historical change records.
- Parsing config from an in-memory string (e.g., fetched from GitHub API).

Key APIs: `ValidationError`, `validateManifest`, `validateDependencyEntry`, `validateConfig`

### monitor → `dependabit-monitor`

- Polling a set of tracked dependencies for state changes on a schedule.
- Implementing a custom checker for a new access method (e.g., a proprietary API or registry).  Register it with Monitor.registerChecker.
- Implementing a custom checker for a new access method (e.g., a proprietary API or registry).  Register it with Monitor.registerChecker.

Key APIs: `Monitor`, `GitHubRepoChecker`, `URLContentChecker`, `normalizeHTML`, `normalizeURL`

### test-utils → `dependabit-test-utils`

Key APIs: `createMockFn`, `spyOn`, `createMockTimer`

### utils → `dependabit-utils`

Key APIs: `capitalize`, `camelCase`, `kebabCase`

### plugins → `dependabit-plugins`

- Managing a set of plugins across the lifetime of an application.
- Isolating plugins in a test suite (via createPluginRegistry).
- Loading plugins from dynamic imports, configuration-driven plugin lists, or test fixtures where you want to confirm a plugin satisfies the contract before registering it.

Key APIs: `PluginRegistry`, `PluginLoader`, `createPluginRegistry`, `registerPlugin`, `getPlugin`

### plugin-arxiv → `dependabit-plugin-arxiv`

- Tracking research papers that your project cites or implements, to be notified when authors publish revisions.

Key APIs: `ArxivChecker`, `createArxivChecker`

### plugin-context7 → `dependabit-plugin-context7`

- Tracking libraries whose documentation is indexed by Context7 (e.g., React, Next.js, Prisma).

Key APIs: `Context7Checker`, `createContext7Checker`

### plugin-skills → `dependabit-plugin-skills`

Key APIs: `SkillsChecker`, `createSkillsChecker`

## Critical Patterns

Top pitfall per package:
- Provider implementations must return valid JSON matching the `LLMResponse` shape.  Returning plain text causes the detector to silently produce zero LLM-sourced results. (detector)
- **Primary vs. secondary rate limits**: `checkRateLimit` only checks the primary REST API rate limit.  GitHub also enforces secondary (abuse) rate limits on burst patterns (many requests in a short window).  A 403 with `Retry-After` header indicates a secondary limit — this class does **not** handle that automatically. (github-client)
- The file is parsed as JSON, not YAML.  Passing a YAML manifest path will throw a `SyntaxError`; use `readConfig` for YAML. (manifest)
- **Concurrent update races**: if two `Monitor` instances watch the same dependency and call `updateDependency` on the shared manifest file simultaneously, one write will silently overwrite the other.  Serialise monitor runs or use a single shared `Monitor` instance. (monitor)
- **Silent collision override is intentional by design in the old API**; the current implementation *throws* on collision.  Do not assume `register` is idempotent. (plugins)
- **No rate limit handling**: burst usage (checking many papers at once) will hit arXiv's rate limit.  Add a delay between concurrent checks. (plugin-arxiv)
- **Fallback URL hash instability**: when the API is unavailable and the checker falls back to direct URL hashing, any dynamic content on the documentation page (e.g., timestamps, ads, CDN-injected nonces) will produce false positive changes. (plugin-context7)

## Anti-Rationalization

| Thought | Reality |
|---------|---------|
| "I'll just use detector for everything" | detector is for documentation site for dependabit. You only need programmatic heuristics — constructing a stub provider that always returns an empty `dependencies` array has a small overhead but is safe. |
| "I'll just use github-client for everything" | github-client is for documentation site for dependabit. You need a full Octokit feature set with plugins (e.g., pagination, throttling) — instantiate `Octokit` directly and pass it to `GitHubClient` via the constructor is not possible; use the separate `RateLimitHandler` for advanced budget management. |
| "I'll just use manifest for everything" | manifest is for documentation site for dependabit. You want to completely replace the existing manifest — just write `updated` directly via writeManifest. |
| "I'll just use monitor for everything" | monitor is for documentation site for dependabit. You only need to check a single dependency type — instantiate the specific checker (e.g., `GitHubRepoChecker`) directly to avoid loading all built-in checkers. |
| "I'll just use plugins for everything" | plugins is for documentation site for dependabit. Using the `globalRegistry` singleton directly in tests that run in parallel — mutations to the global registry leak between test cases. |
| "I'll just use plugin-arxiv for everything" | plugin-arxiv is for documentation site for dependabit. Monitoring large arXiv search result pages — this checker is designed for individual paper IDs only. |
| "I'll just use plugin-context7 for everything" | plugin-context7 is for documentation site for dependabit. Monitoring libraries without a Context7 entry — the fallback URL hash is very sensitive to dynamic page content.  Prefer a specific HTTP checker with normalised content in that case. |

## Example Invocations

User: "I need to documentation site for dependabit"  
→ Load `dependabit-action`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-detector`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-github-client`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-manifest`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-monitor`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-test-utils`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-utils`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-plugins`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-plugin-arxiv`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-plugin-context7`

User: "I need to documentation site for dependabit"  
→ Load `dependabit-plugin-skills`

## NEVER

- NEVER load all package skills simultaneously — pick the one matching your task
- If your task spans multiple packages, load the foundational one first (typically core/shared), then the specific one
