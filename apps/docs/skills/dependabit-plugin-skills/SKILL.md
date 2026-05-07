---
name: dependabit-plugin-skills
description: Documentation site for dependabit
---

# @dependabit/plugin-skills

Documentation site for dependabit

## Configuration

**SkillsConfig** — Configuration for the SkillsChecker. (7 options — see references/config.md)

**Pitfalls:**
- When `lockFilePath` points to a lock file with multiple skills and `lockSkillKey` is not set, the checker throws asking you to specify one. Always set `lockSkillKey` when monitoring a single skill from a multi-skill lock file.
- `apiToken` is optional but highly recommended — unauthenticated GitHub API requests have a 60 req/h limit shared per IP, which is easily exhausted in CI environments.

## Quick Reference

**checker:** `createSkillsChecker` (Create a skills checker instance), `SkillsChecker` (@dependabit/plugin-skills

Skills), `SkillInfo` (Skill metadata from GitHub), `SkillSnapshot` (Skill snapshot result), `SkillChangeDetection` (Skill change detection result)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes/` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)