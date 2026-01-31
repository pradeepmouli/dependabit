# Dependabit Auto-Update Feature

## Overview

The auto-update feature automatically analyzes commits pushed to the main/master branch and updates the dependency manifest with any new or removed external dependencies.

## How It Works

1. **Trigger**: Workflow triggers on push to `main` or `master` branch
2. **Commit Analysis**: Fetches and analyzes all commits in the push
3. **Diff Parsing**: Extracts added/removed URLs and dependencies from diffs
4. **Selective Re-Analysis**: Only re-analyzes changed files (not entire repo)
5. **Manifest Update**: Merges new dependencies with existing manifest
6. **Auto-Commit**: Commits updated manifest back to repository

## Workflow Configuration

The auto-update workflow is defined in `.github/workflows/dependabit-update.yml`:

```yaml
on:
  push:
    branches: [main, master]
    paths:
      - '**.md'
      - '**.ts'
      - '**.py'
      - 'package.json'
      # ... other relevant files
```

## Key Features

### Non-Destructive Updates
- Preserves manually added dependencies
- Preserves change history
- Gracefully handles merge conflicts

### Efficient Analysis
- Only analyzes changed files
- Reduces LLM API calls
- Faster execution (< 2 minutes)

### Smart Detection
- Extracts URLs from code changes
- Detects package.json additions/removals
- Identifies documentation updates
- Recognizes research paper references

## Usage

### Automatic
Simply push changes to main/master and the workflow runs automatically.

### Manual Trigger
You can also manually trigger the update:

```bash
gh workflow run dependabit-update.yml
```

## Outputs

The action provides several outputs:
- `changes_detected`: Boolean indicating if changes were found
- `dependencies_added`: Number of dependencies added
- `dependencies_removed`: Number of dependencies removed
- `total_dependencies`: Total dependencies in manifest
- `files_analyzed`: Number of files analyzed

## Implementation Details

### Commit Analysis
Located in `packages/github-client/src/commits.ts`:
- `fetchCommits()`: Get commits from GitHub API
- `getCommitDiff()`: Get file changes for a commit
- `parseCommitFiles()`: Categorize changed files

### Diff Parsing
Located in `packages/detector/src/diff-parser.ts`:
- `parseDiff()`: Extract additions/deletions from unified diff
- `extractAddedContent()`: Find URLs and dependencies in added lines
- `extractRemovedContent()`: Find removed dependencies
- `getChangedFiles()`: Identify relevant files

### Selective Re-Analysis
Located in `packages/detector/src/detector.ts`:
- `analyzeFiles()`: Analyze only specified files
- Uses same detection logic as full scan
- More efficient for incremental updates

### Update Action
Located in `packages/action/src/actions/update.ts`:
- Main orchestration logic
- Reads existing manifest
- Analyzes commits
- Merges results
- Writes updated manifest

## Configuration

### Environment Variables
- `GITHUB_TOKEN`: Authentication (automatically provided)
- `GITHUB_REPOSITORY`: Repo identifier (automatically provided)
- `GITHUB_SHA`: Current commit (automatically provided)

### Inputs
- `action`: Set to 'update'
- `repo_path`: Repository path (default: '.')
- `manifest_path`: Manifest location (default: '.dependabit/manifest.json')
- `llm_provider`: LLM provider (default: 'github-copilot')

## Testing

Run tests with:

```bash
pnpm test packages/github-client/test/commits.test.ts
pnpm test packages/detector/test/diff-parser.test.ts
pnpm test packages/action/test/actions/update.test.ts
```

## Troubleshooting

### Workflow not triggering
- Check that push is to main/master branch
- Verify file paths match workflow filter
- Check workflow permissions

### No changes detected
- Verify commits actually modify relevant files
- Check that manifest already exists
- Review workflow logs for details

### Commit conflicts
- The workflow uses `[skip ci]` to prevent loops
- Manual conflicts should be rare (non-destructive merge)

## Performance

- **Target**: < 2 minutes per update
- **Efficiency**: Only analyzes changed files
- **Optimization**: Minimal LLM calls

## Future Enhancements

- [ ] Support for PR-based updates
- [ ] Configurable branch patterns
- [ ] Custom ignore patterns
- [ ] Dependency removal detection improvements
- [ ] Integration with issue creation
