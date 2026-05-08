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

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
