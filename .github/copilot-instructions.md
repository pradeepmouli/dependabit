# dependabit Development Guidelines

## Project Overview

AI-powered dependency tracker for external resources. Automatically discovers, tracks, and monitors external dependencies (GitHub repos, docs sites, API references, research papers) referenced in codebases using LLM analysis.

## Tech Stack

- TypeScript 5, Node.js ≥20
- Vitest (test runner), oxlint (linter), oxfmt (formatter)
- pnpm workspaces (monorepo), changesets (releases), GitHub Actions (CI/CD)

## Project Structure

```text
src/                  # Core entry point
packages/detector/    # LLM-powered dependency detection
packages/monitor/     # Change monitoring and alerts
packages/manifest/    # Dependency manifest management
packages/github-client/ # GitHub API client
packages/plugins/     # Extensible plugin system
packages/utils/       # Shared utilities
specs/                # Specification documents
e2e/                  # End-to-end tests
```

## Commands

```bash
pnpm install        # Install dependencies
pnpm test           # Run tests
pnpm run type-check # TypeScript strict mode
pnpm run build      # Build
pnpm run lint       # oxlint
pnpm run format     # oxfmt
```

## Code Style

- TypeScript strict mode, no `any`
- oxlint for linting, oxfmt for formatting
- Conventional commits

## Key Patterns

- **LLM analysis pipeline** — detector package sends code/README to LLM, parses structured dependency output
- **Confidence scoring** — each detected dependency carries a confidence level
- **Plugin architecture** — extensible source parsers (README, comments, manifests)
- **GitHub Action** — `action.yml` exposes the tool as a composable CI workflow step

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
