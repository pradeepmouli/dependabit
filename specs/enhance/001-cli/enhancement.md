# Enhancement: Add CLI

**Enhancement ID**: enhance-001
**Branch**: `enhance/001-cli`
**Created**: 2026-02-04
**Priority**: [x] High | [ ] Medium | [ ] Low
**Component**: CLI package and tooling
**Status**: [x] Planned | [ ] In Progress | [ ] Complete

## Input
User description: "Add a CLI"

## Overview
Add a command-line interface (CLI) to make Dependabit accessible outside of GitHub Actions. This will allow developers to run dependency detection, manifest generation, updates, and validation directly from their terminal during development and for local testing.

## Motivation
Currently, Dependabit only works through GitHub Actions workflows, which limits its usability during local development and testing. A CLI would:
- Enable local development and testing without pushing to GitHub
- Allow integration with other CI/CD systems beyond GitHub Actions
- Provide faster feedback loops during manifest configuration
- Support on-demand dependency checks and validation
- Make the tool more accessible to developers working on projects without GitHub Actions

## Proposed Changes

The CLI should provide commands that mirror the GitHub Action capabilities:

- **Generate command**: Create initial manifest by analyzing the repository
- **Update command**: Update existing manifest with new dependencies
- **Validate command**: Check manifest schema and structure
- **Check command** (future): Monitor external dependencies for changes

**Files to Modify**:
- Create `packages/cli/package.json` - New CLI package with commander.js dependency
- Create `packages/cli/src/index.ts` - CLI entry point with command routing
- Create `packages/cli/src/commands/generate.ts` - Generate command implementation
- Create `packages/cli/src/commands/update.ts` - Update command implementation
- Create `packages/cli/src/commands/validate.ts` - Validate command implementation
- Modify root `package.json` - Add CLI scripts and bin entry
- Create `packages/cli/README.md` - CLI documentation

**Breaking Changes**: [ ] Yes | [x] No

## Implementation Plan

**Phase 1: Implementation**

**Tasks**:
1. [ ] Create CLI package structure with TypeScript and commander.js
2. [ ] Implement generate command that mirrors GitHub Action functionality
3. [ ] Implement update command with file-watching capabilities
4. [ ] Implement validate command for manifest verification
5. [ ] Add CLI-specific logging and progress indicators
6. [ ] Write CLI documentation and usage examples
7. [ ] Add tests for CLI commands and argument parsing

**Acceptance Criteria**:
- [ ] CLI can run `generate`, `update`, and `validate` commands locally
- [ ] CLI provides clear help text and usage examples
- [ ] CLI accepts standard options: --repo-path, --manifest-path, --llm-provider, --llm-model, --verbose
- [ ] CLI provides user-friendly output with progress indicators
- [ ] CLI handles errors gracefully with clear messages
- [ ] CLI can be installed globally via npm/pnpm
- [ ] All commands work without GitHub Actions environment

## Testing
- [ ] Unit tests added for command parsers
- [ ] Integration tests for CLI command execution
- [ ] Manual testing with sample repositories
- [ ] Edge cases verified (invalid paths, missing config, etc.)

## Verification Checklist
- [ ] Changes implemented as described
- [ ] Tests written and passing
- [ ] No regressions in existing functionality
- [ ] Documentation updated (README.md, CLI help text)
- [ ] Code reviewed (if appropriate)

## Notes
- Use commander.js for CLI framework (popular, well-maintained)
- Reuse existing detector, manifest, and monitor packages
- Add chalk for colored output and ora for spinners
- Consider adding interactive prompts with inquirer for future enhancements
- Make sure API keys can be passed via environment variables (LLM_API_KEY, GITHUB_TOKEN)
- CLI should work with the same configuration file (.dependabit/config.yml) as GitHub Actions

---
*Enhancement created using `/enhance` workflow - See .specify/extensions/workflows/enhance/*
