# Configuration

## SkillsConfig

Configuration for the SkillsChecker.

### Properties

#### url

URL to the skill on skills.sh or its GitHub source

**Type:** `string`

**Required:** yes

#### owner

GitHub owner (parsed from URL if not provided)

**Type:** `string`

#### repo

GitHub repo (parsed from URL if not provided)

**Type:** `string`

#### skillName

Skill name within the repo (parsed from URL if not provided)

**Type:** `string`

#### apiToken

GitHub API token for higher rate limits

**Type:** `string`

#### lockFilePath

Optional local path to a skills lock file (e.g. skills-lock.json)

**Type:** `string`

#### lockSkillKey

Optional skill key to select from lock file entries

**Type:** `string`

### Use when
- Monitoring a specific AI agent skill hosted on skills.sh or stored in a
- GitHub repository for version changes (detected via Git tree SHA).

### Pitfalls
- When `lockFilePath` points to a lock file with multiple skills and
- `lockSkillKey` is not set, the checker throws asking you to specify one.
- Always set `lockSkillKey` when monitoring a single skill from a
- multi-skill lock file.
- `apiToken` is optional but highly recommended — unauthenticated GitHub
- API requests have a 60 req/h limit shared per IP, which is easily
- exhausted in CI environments.