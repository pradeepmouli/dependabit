---
name: dependabit-plugin-arxiv
description: Documentation site for dependabit
---

# @dependabit/plugin-arxiv

Documentation site for dependabit

## When to Use

- API surface: 1 functions, 1 classes, 3 types

## Configuration

### ArxivConfig

Configuration for the ArxivChecker.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `string` | yes | — | Abstract or PDF URL, or a bare arXiv ID (e.g. `2301.00001`). |
| `arxivId` | `string` | no | — | Explicit arXiv ID (e.g. `2301.00001`) — parsed from `url` when omitted. |

**Use when:**
- Monitoring an arXiv preprint for new versions or abstract revisions.

**Pitfalls:**
- `url` should point to the abstract page (`/abs/`) not the PDF (`/pdf/`).
- The ID extractor supports both, but the canonical URL in the manifest
- should use the abstract form.
- arXiv IDs do not carry version numbers; the checker always fetches the
- **latest** version.  If a paper is withdrawn, the API returns an empty
- entry and the checker throws.

## Quick Reference

**checker:** `createArxivChecker`, `ArxivPaper`, `ArxivSnapshot`, `ArxivChangeDetection`
**plugin-arxiv:** `ArxivChecker`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)