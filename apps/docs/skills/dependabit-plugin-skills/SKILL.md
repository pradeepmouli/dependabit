---
name: dependabit-plugin-skills
description: Documentation site for dependabit
---

# @dependabit/plugin-skills

Documentation site for dependabit

## When to Use

- API surface: 1 functions, 1 classes, 3 types

## Configuration

### SkillsConfig

Configuration for the SkillsChecker.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `string` | yes | — | URL to the skill on skills.sh or its GitHub source |
| `owner` | `string` | no | — | GitHub owner (parsed from URL if not provided) |
| `repo` | `string` | no | — | GitHub repo (parsed from URL if not provided) |
| `skillName` | `string` | no | — | Skill name within the repo (parsed from URL if not provided) |
| `apiToken` | `string` | no | — | GitHub API token for higher rate limits |
| `lockFilePath` | `string` | no | — | Optional local path to a skills lock file (e.g. skills-lock.json) |
| `lockSkillKey` | `string` | no | — | Optional skill key to select from lock file entries |

**Use when:**
- Monitoring a specific AI agent skill hosted on skills.sh or stored in a
- GitHub repository for version changes (detected via Git tree SHA).

**Pitfalls:**
- When `lockFilePath` points to a lock file with multiple skills and
- `lockSkillKey` is not set, the checker throws asking you to specify one.
- Always set `lockSkillKey` when monitoring a single skill from a
- multi-skill lock file.
- `apiToken` is optional but highly recommended — unauthenticated GitHub
- API requests have a 60 req/h limit shared per IP, which is easily
- exhausted in CI environments.

## Quick Reference

**checker:** `createSkillsChecker`, `SkillsChecker`, `SkillInfo`, `SkillSnapshot`, `SkillChangeDetection`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)