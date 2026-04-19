# Configuration

## LLMProviderConfig

Configuration passed to an LLM provider at construction time.

### Properties

#### apiKey



**Type:** `string`

#### endpoint



**Type:** `string`

#### model

Model identifier; pin this value to avoid classification drift.

**Type:** `string`

#### maxTokens



**Type:** `number`

#### temperature



**Type:** `number`

### Pitfalls
- `model` controls which checkpoint is used. Leaving it `undefined` causes
- the provider to select its default, which can change between SDK
- versions — pin the model to avoid silent classification drift.
- `maxTokens` caps the completion, not the prompt.  Very large repository
- files will still consume prompt budget; use `Detector.ignorePatterns`
- to exclude large generated files.

## DetectorOptions

Configuration options for the Detector orchestrator.

All options except `repoPath` and `llmProvider` have safe defaults.
The detector respects `.gitignore` files and git's global excludes file
by default; set `useGitExcludes` to `false` to disable that behaviour.

### Properties

#### repoPath

Absolute path to the root of the repository on disk.

**Type:** `string`

**Required:** yes

#### llmProvider

LLM provider used for document analysis and dependency classification.

**Type:** `LLMProvider`

**Required:** yes

#### ignorePatterns

Path segments to exclude during directory traversal.

**Type:** `string[]`

#### useGitExcludes

When `true`, `.gitignore` files and git's global excludes are loaded
and applied during traversal.

**Type:** `boolean`

#### repoOwner

GitHub owner used to filter self-referential URLs.

**Type:** `string`

#### repoName

GitHub repository name used to filter self-referential URLs.

**Type:** `string`

### Use when
- You want to scan a local repository clone for informational dependencies
- that package managers do not track.

### Pitfalls
- `ignorePatterns` performs substring matching on path segments; overly
- broad patterns (e.g. `"src"`) will silently exclude large parts of the
- repository.
- `repoOwner` / `repoName` are used to filter self-referential URLs from
- results. Omitting them causes the repo's own URLs to appear as
- dependencies.
- Token budgets: the LLM provider is called once per README (up to 5) and
- once per unclassified URL. Large repositories with many READMEs can
- exhaust the provider's context window mid-run; truncation at 5 000
- characters per document is intentional but may miss late-appearing URLs.