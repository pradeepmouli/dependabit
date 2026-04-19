---
name: dependabit-detector
description: Documentation site for dependabit
---

# @dependabit/detector

Documentation site for dependabit

## When to Use

- API surface: 16 functions, 2 classes, 12 types, 1 constants

## Configuration

### LLMProviderConfig

Configuration passed to an LLM provider at construction time.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `apiKey` | `string` | no | — |  |
| `endpoint` | `string` | no | — |  |
| `model` | `string` | no | — | Model identifier; pin this value to avoid classification drift. |
| `maxTokens` | `number` | no | — |  |
| `temperature` | `number` | no | — |  |

**Pitfalls:**
- `model` controls which checkpoint is used. Leaving it `undefined` causes
- the provider to select its default, which can change between SDK
- versions — pin the model to avoid silent classification drift.
- `maxTokens` caps the completion, not the prompt.  Very large repository
- files will still consume prompt budget; use `Detector.ignorePatterns`
- to exclude large generated files.

### DetectorOptions

Configuration options for the Detector orchestrator.

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `repoPath` | `string` | yes | — | Absolute path to the root of the repository on disk. |
| `llmProvider` | `LLMProvider` | yes | — | LLM provider used for document analysis and dependency classification. |
| `ignorePatterns` | `string[]` | no | — | Path segments to exclude during directory traversal. |
| `useGitExcludes` | `boolean` | no | — | When `true`, `.gitignore` files and git's global excludes are loaded
and applied during traversal. |
| `repoOwner` | `string` | no | — | GitHub owner used to filter self-referential URLs. |
| `repoName` | `string` | no | — | GitHub repository name used to filter self-referential URLs. |

**Use when:**
- You want to scan a local repository clone for informational dependencies
- that package managers do not track.

**Avoid when:**
- The repository has not been cloned to disk — the detector reads files
- from the filesystem and cannot operate on a bare Git remote.

**Pitfalls:**
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

## Quick Reference

**Detector:** `createDetectionPrompt`, `createClassificationPrompt`, `GitHubCopilotProvider`, `Detector`, `LLMProvider`, `LLMResponse`, `RateLimitInfo`, `DetectedDependency`, `LLMUsageMetadata`, `DetectionResult`, `SYSTEM_PROMPT`
**readme:** `parseReadme`, `extractGitHubReferences`, `ExtractedReference`
**code-comments:** `parseCodeComments`, `extractSpecReferences`, `CommentReference`
**package-files:** `parsePackageJson`, `parseRequirementsTxt`, `parseCargoToml`, `parseGoMod`, `PackageMetadata`
**diff-parser:** `parseDiff`, `extractAddedContent`, `extractRemovedContent`, `getChangedFiles`, `parseCommitDiffs`, `extractDependencyChanges`, `DiffParseResult`, `ExtractedContent`, `ChangedFilesResult`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)