---
name: dependabit-plugin-arxiv
description: "Documentation site for dependabit Use when: Tracking research papers that your project cites or implements, to be...."
---

# @dependabit/plugin-arxiv

Documentation site for dependabit

## When to Use

**Use this skill when:**
- Tracking research papers that your project cites or implements, to be notified when authors publish revisions.

**Do NOT use when:**
- Monitoring large arXiv search result pages — this checker is designed for individual paper IDs only.

API surface: 1 functions, 1 classes, 3 types

## NEVER

- **No rate limit handling**: burst usage (checking many papers at once) will hit arXiv's rate limit.  Add a delay between concurrent checks.
- **Abstract hash instability**: arXiv occasionally re-formats abstracts (whitespace normalisation) without bumping the paper version.  This produces a false positive change detection for `abstract`.
- **Withdrawn papers**: if a paper is withdrawn, the arXiv API returns an empty entry; `fetch` will throw `'Could not parse arXiv response'`.

## Configuration

**ArxivConfig** — Configuration for the ArxivChecker. (2 options — see references/config.md)

**Pitfalls:**
- `url` should point to the abstract page (`/abs/`) not the PDF (`/pdf/`). The ID extractor supports both, but the canonical URL in the manifest should use the abstract form.
- arXiv IDs do not carry version numbers; the checker always fetches the **latest** version.  If a paper is withdrawn, the API returns an empty entry and the checker throws.

## Quick Reference

**checker:** `createArxivChecker` (Create an arXiv checker instance), `ArxivPaper` (arXiv paper metadata), `ArxivSnapshot` (arXiv snapshot result), `ArxivChangeDetection` (arXiv change detection result)
**plugin-arxiv:** `ArxivChecker` (Monitors arXiv preprints for new versions via the arXiv Atom API)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)