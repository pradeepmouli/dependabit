---
name: dependabit-plugin-context7
description: Documentation site for dependabit
---

# @dependabit/plugin-context7

Documentation site for dependabit

## When to Use

- API surface: 1 functions, 1 classes, 3 types

## Configuration

### Context7Config

Configuration for the Context7Checker.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `string` | yes | — |  |
| `libraryId` | `string` | no | — |  |
| `auth` | `{ type: "token" | "none"; secret?: string }` | no | — |  |

**Use when:**
- Monitoring a library's structured documentation via the Context7 API.

**Pitfalls:**
- `libraryId` must match the exact Context7 library identifier.  If the
- API returns 404 for a valid URL, try extracting the ID from the URL
- manually and providing it explicitly rather than relying on URL parsing.
- When `auth.secret` is omitted, the checker makes unauthenticated
- requests, which may have lower rate limits or restricted access.

## Quick Reference

**checker:** `createContext7Checker`, `Context7Library`, `Context7Snapshot`, `Context7ChangeDetection`
**plugin-context7:** `Context7Checker`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)