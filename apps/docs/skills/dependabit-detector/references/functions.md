# Functions

## Detector

### `createDetectionPrompt`
Renders a detection prompt by substituting the content-type, file path,
and raw content into `DETECTION_PROMPT_TEMPLATE`.
```ts
createDetectionPrompt(contentType: string, filePath: string, content: string): string
```
**Parameters:**
- `contentType: string` — Human-readable label for the content (e.g. `"README"`).
- `filePath: string` — Repository-relative file path for context.
- `content: string` — Raw file content to analyze (not truncated here — callers
  should truncate before passing to stay within token budgets).
**Returns:** `string` — Rendered prompt string ready to send to an LLM provider.

### `createClassificationPrompt`
Renders a classification prompt for a single URL, asking the LLM to
determine the dependency type and best access method.
```ts
createClassificationPrompt(url: string, context: string): string
```
**Parameters:**
- `url: string` — The URL to classify.
- `context: string` — Surrounding text or code comments that mention the URL,
  used to improve classification accuracy.
**Returns:** `string` — Rendered prompt string.

## readme

### `parseReadme`
Parse README content and extract external references
```ts
parseReadme(content: string, filePath: string): ExtractedReference[]
```
**Parameters:**
- `content: string`
- `filePath: string` — default: `'README.md'`
**Returns:** `ExtractedReference[]`

### `extractGitHubReferences`
Extract GitHub repository mentions (owner/repo format)
```ts
extractGitHubReferences(content: string): { owner: string; repo: string; context: string }[]
```
**Parameters:**
- `content: string`
**Returns:** `{ owner: string; repo: string; context: string }[]`

## code-comments

### `parseCodeComments`
Parse code files and extract references from comments
```ts
parseCodeComments(content: string, filePath: string): CommentReference[]
```
**Parameters:**
- `content: string`
- `filePath: string`
**Returns:** `CommentReference[]`

### `extractSpecReferences`
Extract specification and RFC references from comments
```ts
extractSpecReferences(content: string): { spec: string; context: string }[]
```
**Parameters:**
- `content: string`
**Returns:** `{ spec: string; context: string }[]`

## package-files

### `parsePackageJson`
Parse package.json and extract metadata URLs (NOT dependencies)
```ts
parsePackageJson(content: string): PackageMetadata
```
**Parameters:**
- `content: string`
**Returns:** `PackageMetadata`

### `parseRequirementsTxt`
Parse requirements.txt and extract URLs from comments
EXCLUDES actual packages (handled by dependabot)
```ts
parseRequirementsTxt(content: string): PackageMetadata
```
**Parameters:**
- `content: string`
**Returns:** `PackageMetadata`

### `parseCargoToml`
Parse Cargo.toml and extract metadata URLs
EXCLUDES actual dependencies (handled by dependabot)
```ts
parseCargoToml(content: string): PackageMetadata
```
**Parameters:**
- `content: string`
**Returns:** `PackageMetadata`

### `parseGoMod`
Parse go.mod and extract URLs from comments
EXCLUDES actual dependencies (handled by dependabot)
```ts
parseGoMod(content: string): PackageMetadata
```
**Parameters:**
- `content: string`
**Returns:** `PackageMetadata`

## diff-parser

### `parseDiff`
Parse a unified diff and extract additions and deletions
```ts
parseDiff(patch: string): DiffParseResult
```
**Parameters:**
- `patch: string`
**Returns:** `DiffParseResult`

### `extractAddedContent`
Extract meaningful content from added lines
```ts
extractAddedContent(additions: string[], filename?: string): ExtractedContent
```
**Parameters:**
- `additions: string[]`
- `filename: string` (optional)
**Returns:** `ExtractedContent`

### `extractRemovedContent`
Extract meaningful content from removed lines
```ts
extractRemovedContent(deletions: string[], filename?: string): ExtractedContent
```
**Parameters:**
- `deletions: string[]`
- `filename: string` (optional)
**Returns:** `ExtractedContent`

### `getChangedFiles`
Identify files relevant for dependency analysis

Note: Filenames in relevantFiles preserve their original case from the commit.
Case-insensitive matching is used for identification, but original casing is maintained
for consistency with file system operations.
```ts
getChangedFiles(files: CommitFile[]): ChangedFilesResult
```
**Parameters:**
- `files: CommitFile[]`
**Returns:** `ChangedFilesResult`

### `parseCommitDiffs`
Parse all diffs from commit files
```ts
parseCommitDiffs(files: CommitFile[]): Map<string, DiffParseResult>
```
**Parameters:**
- `files: CommitFile[]`
**Returns:** `Map<string, DiffParseResult>`

### `extractDependencyChanges`
Extract all dependency-related content from commit diffs
```ts
extractDependencyChanges(files: CommitFile[]): { addedUrls: string[]; removedUrls: string[]; addedPackages: string[]; removedPackages: string[]; changedFiles: ChangedFilesResult }
```
**Parameters:**
- `files: CommitFile[]`
**Returns:** `{ addedUrls: string[]; removedUrls: string[]; addedPackages: string[]; removedPackages: string[]; changedFiles: ChangedFilesResult }`
