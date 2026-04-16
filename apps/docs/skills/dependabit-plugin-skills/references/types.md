# Types & Enums

## checker

### `SkillInfo`
Skill metadata from GitHub
**Properties:**
- `owner: string`
- `repo: string`
- `skillName: string`
- `treeSha: string`
- `lastCommitSha: string`
- `lastCommitDate: string`
- `files: string[]`

### `SkillSnapshot`
Skill snapshot result
**Properties:**
- `version: string`
- `stateHash: string`
- `fetchedAt: Date`
- `metadata: { owner: string; repo: string; skillName: string; treeSha: string; lastCommitSha: string; lastCommitDate: string; fileCount: number; skillsShUrl: string }`

### `SkillChangeDetection`
Skill change detection result
**Properties:**
- `hasChanged: boolean`
- `changes: string[]`
- `oldVersion: string` (optional)
- `newVersion: string` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)
