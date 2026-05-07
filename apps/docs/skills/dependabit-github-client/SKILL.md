---
name: dependabit-github-client
description: "Documentation site for dependabit Use when: Making authenticated GitHub API calls from the monitor or action packages...."
---

# @dependabit/github-client

Documentation site for dependabit

## When to Use

**Use this skill when:**
- Making authenticated GitHub API calls from the monitor or action packages where you need integrated rate-limit protection. → use `GitHubClient`
- Coordinating large batches of GitHub API calls (e.g., checking 100+ dependencies in one monitor run) where you need pre-flight quota checks. → use `RateLimitHandler`

**Do NOT use when:**
- You need a full Octokit feature set with plugins (e.g., pagination, throttling) — instantiate `Octokit` directly and pass it to `GitHubClient` via the constructor is not possible; use the separate `RateLimitHandler` for advanced budget management. (`GitHubClient`)
- Making a small number of one-off API calls — use GitHubClient with its built-in threshold check instead. (`RateLimitHandler`)

API surface: 6 functions, 9 classes, 19 types

## NEVER

- **Primary vs. secondary rate limits**: `checkRateLimit` only checks the primary REST API rate limit.  GitHub also enforces secondary (abuse) rate limits on burst patterns (many requests in a short window).  A 403 with `Retry-After` header indicates a secondary limit — this class does **not** handle that automatically.
- **Rate limit cache**: `getLastRateLimitCheck` returns a potentially stale value; it is updated only when `getRateLimit` or `checkRateLimit` is called.  Do not use it as a real-time indicator.
- `reserveBudget` does **not** lock the quota — another process could consume the reserved capacity between the check and the actual calls.
- The handler does not track the search or GraphQL categories individually for budget reservation; use `getRateLimitStatus` to inspect those limits manually.

## Configuration

5 configuration interfaces — see references/config.md for details.

## Quick Reference

**Key classes:** `GitHubClient` (Thin wrapper around Octokit that adds proactive rate-limit checking), `RateLimitHandler` (Manages GitHub API rate limits and provides budget-reservation utilities
for batch operations)

*34 exports total — see references/ for full API.*

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)