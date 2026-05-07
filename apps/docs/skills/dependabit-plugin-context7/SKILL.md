---
name: dependabit-plugin-context7
description: "Documentation site for dependabit Use when: Tracking libraries whose documentation is indexed by Context7 (e.g., React,...."
---

# @dependabit/plugin-context7

Documentation site for dependabit

## When to Use

**Use this skill when:**
- Tracking libraries whose documentation is indexed by Context7 (e.g., React, Next.js, Prisma).

**Do NOT use when:**
- Monitoring libraries without a Context7 entry — the fallback URL hash is very sensitive to dynamic page content.  Prefer a specific HTTP checker with normalised content in that case.

API surface: 1 functions, 1 classes, 3 types

## NEVER

- **Fallback URL hash instability**: when the API is unavailable and the checker falls back to direct URL hashing, any dynamic content on the documentation page (e.g., timestamps, ads, CDN-injected nonces) will produce false positive changes.
- **Zod schema mismatches**: if Context7 changes its API response shape, `Context7ResponseSchema.parse` will throw a `ZodError` and the checker silently falls back to URL hashing without logging the schema error.
- **`lastUpdated` change without version bump**: some Context7 libraries update their `lastUpdated` field without bumping the version number. This produces a `changes: ['lastUpdated']` result with `severity: 'minor'`.

## Configuration

**Context7Config** — Configuration for the Context7Checker. (3 options — see references/config.md)

**Pitfalls:**
- `libraryId` must match the exact Context7 library identifier.  If the API returns 404 for a valid URL, try extracting the ID from the URL manually and providing it explicitly rather than relying on URL parsing.
- When `auth.secret` is omitted, the checker makes unauthenticated requests, which may have lower rate limits or restricted access.

## Quick Reference

**checker:** `createContext7Checker` (Create a Context7 checker instance), `Context7Library` (Context7 library metadata), `Context7Snapshot` (Context7 snapshot result), `Context7ChangeDetection` (Context7 change detection result)
**plugin-context7:** `Context7Checker` (Monitors library documentation changes via the Context7 API, with a
fallback to direct URL content hashing when the API is unavailable)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)