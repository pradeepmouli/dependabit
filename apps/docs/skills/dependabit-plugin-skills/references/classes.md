# Classes

## checker

### `SkillsChecker`
@dependabit/plugin-skills

Skills.sh plugin for monitoring AI agent skill versions
```ts
constructor(): SkillsChecker
```
**Methods:**
- `fetch(config: SkillsConfig): Promise<SkillSnapshot>` — Fetch skill information and create a snapshot
- `compare(prev: SkillSnapshot, curr: SkillSnapshot): Promise<SkillChangeDetection>` — Compare two skill snapshots to detect changes
