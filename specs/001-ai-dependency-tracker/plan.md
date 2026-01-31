# Implementation Plan: AI-Powered Dependency Tracking System

**Branch**: `001-ai-dependency-tracker` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-dependency-tracker/spec.md`

## Summary

Build a GitHub Action that uses LLMs (GitHub Copilot by default) to automatically discover, track, and monitor external dependencies referenced in repositories. The system generates a manifest at `.dependabit/manifest.json`, updates it on commits, periodically checks for changes, and creates issues when updates are detected. Supports multiple dependency types (GitHub repos, NPM packages, documentation sites, APIs) with configurable monitoring schedules using a dependabot-style configuration.

**Technical Approach**: TypeScript-based GitHub Actions in a pnpm workspace monorepo, with separate packages for core detection logic, LLM integration, change monitoring, and GitHub API interactions. Actions built using @actions/core and @actions/github, with comprehensive logging and test coverage.

## Technical Context

**Language/Version**: TypeScript 5.9+ with ES2022 target, Node.js >= 20.0.0
**Primary Dependencies**: @actions/core, @actions/github, @octokit/rest, zod (schema validation), vitest (testing)
**Storage**: File-based (`.dependabit/manifest.json`, `.dependabit/config.yml`) version-controlled in repository
**Testing**: Vitest for unit/integration tests, @actions/github mocking for GitHub API tests
**Target Platform**: GitHub Actions runners (ubuntu-latest, Node.js 20)
**Project Type**: Monorepo with multiple packages (follows existing pnpm workspace structure)
**Performance Goals**: Manifest generation <5 min, updates <2 min, monitoring 100 deps <10 min
**Constraints**: GitHub Actions free tier limits, LLM API rate limits, <200MB workflow memory
**Scale/Scope**: Handle 50-100 external dependencies per repository, support 1000+ line analysis

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Modular Package Architecture

**Status**: COMPLIANT
**Implementation**: Feature will be split into 5 focused packages:
- `@dependabit/detector` - LLM-based dependency detection from codebase
- `@dependabit/manifest` - Manifest schema, validation, and CRUD operations
- `@dependabit/monitor` - Change detection and comparison logic
- `@dependabit/github-client` - GitHub API interactions (issues, releases, commits)
- `@dependabit/action` - GitHub Action entry points (generate, update, check)

Each package has single responsibility, independent tests, TypeScript exports, and focused README.

### ✅ II. Test-First Development (NON-NEGOTIABLE)

**Status**: COMPLIANT
**Approach**: TDD with Vitest
- Phase 0: Write tests for detection algorithms before implementation
- Phase 1: Contract tests for LLM integrations and GitHub API calls
- Integration tests for end-to-end action workflows
- Minimum 80% coverage for all public APIs

### ✅ III. Observable & Debuggable Operations

**Status**: COMPLIANT
**Implementation**: Structured JSON logging for all operations
- Every LLM call logs: prompt, model, response, latency, tokens, cost
- Every GitHub API call logs: endpoint, method, rate-limit status, response code
- Action outputs include summary reports with links to logs
- Error messages include remediation steps (e.g., "Check GITHUB_TOKEN permissions")

### ✅ IV. Conventional Commits & Semantic Versioning

**Status**: COMPLIANT
**Implementation**: Using existing git hooks and changesets
- Commits follow `type(scope): description` format (enforced by simple-git-hooks)
- Changesets for versioning packages independently
- Breaking changes trigger MAJOR version bumps with migration guides

### ✅ V. Non-Destructive Agent Collaboration

**Status**: COMPLIANT
**Implementation**: All changes are additive
- Manifest updates use merge strategies (never overwrite manually added entries)
- Configuration changes preserve user customizations
- Issues include "managed-by: dependabit" labels for clear attribution
- Code follows existing .editorconfig formatting rules

### Constitution Compliance Summary

**Overall Status**: ✅ COMPLIANT - No violations

All five core principles are satisfied. Feature design aligns with modular package architecture, includes comprehensive testing strategy, implements structured logging, follows conventional commits, and preserves user work through non-destructive updates.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-dependency-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology selection)
├── data-model.md        # Phase 1 output (manifest schema)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── manifest-schema.json
│   ├── config-schema.json
│   └── github-issues.md
└── tasks.md             # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```text
packages/
├── detector/
│   ├── src/
│   │   ├── llm/
│   │   │   ├── client.ts           # LLM provider abstraction
│   │   │   ├── copilot.ts          # GitHub Copilot integration
│   │   │   └── prompts.ts          # Detection prompts
│   │   ├── parsers/
│   │   │   ├── readme.ts           # README file parsing
│   │   │   ├── code-comments.ts    # Code comment extraction
│   │   │   └── package-files.ts    # package.json, requirements.txt, etc.
│   │   ├── detector.ts             # Main detection orchestrator
│   │   └── index.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── manifest/
│   ├── src/
│   │   ├── schema.ts               # Zod schemas for manifest/config
│   │   ├── manifest.ts             # Manifest CRUD operations
│   │   ├── config.ts               # Configuration parsing
│   │   ├── validator.ts            # Schema validation
│   │   └── index.ts
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── monitor/
│   ├── src/
│   │   ├── checkers/
│   │   │   ├── github-repo.ts      # Check GitHub releases/commits
│   │   │   ├── npm-package.ts      # Check NPM registry
│   │   │   ├── url-content.ts      # Hash-based content checking
│   │   │   └── index.ts
│   │   ├── comparator.ts           # Compare old vs new state
│   │   ├── severity.ts             # Classify change severity
│   │   ├── monitor.ts              # Main monitoring orchestrator
│   │   └── index.ts
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── github-client/
│   ├── src/
│   │   ├── issues.ts               # Issue creation/updates
│   │   ├── commits.ts              # Commit analysis
│   │   ├── releases.ts             # Release fetching
│   │   ├── rate-limit.ts           # Rate limit handling
│   │   ├── client.ts               # Octokit wrapper
│   │   └── index.ts
│   ├── tests/
│   ├── package.json
│   └── README.md
│
└── action/
    ├── src/
    │   ├── actions/
    │   │   ├── generate.ts         # Initial manifest generation
    │   │   ├── update.ts           # Update on push
    │   │   ├── check.ts            # Scheduled monitoring
    │   │   └── validate.ts         # Manifest validation
    │   ├── utils/
    │   │   ├── logger.ts           # Structured logging
    │   │   ├── inputs.ts           # Action input parsing
    │   │   └── outputs.ts          # Action output formatting
    │   └── index.ts
    ├── tests/
    ├── action.yml                  # GitHub Action metadata
    ├── package.json
    └── README.md

.github/
├── workflows/
│   ├── dependabit-generate.yml     # Workflow: initial setup
│   ├── dependabit-update.yml       # Workflow: on push to main
│   └── dependabit-check.yml        # Workflow: scheduled monitoring
└── actions/
    └── dependabit/                 # Composite action wrapper
        └── action.yml

tests/
├── e2e/
│   ├── full-workflow.spec.ts       # Complete action workflow
│   ├── fixtures/
│   │   └── sample-repo/            # Test repository
│   └── helpers/
└── integration/
    └── action-integration.spec.ts  # Cross-package integration

docs/
└── ai-dependency-tracker/
    ├── architecture.md             # System architecture
    ├── llm-integration.md          # LLM provider guide
    └── troubleshooting.md          # Common issues
```

**Structure Decision**: Monorepo with 5 packages following existing pnpm workspace pattern. Each package represents a distinct responsibility: detection (LLM), manifest (storage), monitoring (change detection), github-client (API), action (GitHub Actions integration). The `action` package depends on all others and serves as the GitHub Action entry point. E2E tests at workspace root validate full workflows.

## Hybrid Detection Architecture

**LLM Integration Strategy**: Programmatic-first with LLM fallback for ambiguous cases

The detector package implements a 7-step hybrid approach that minimizes LLM usage while maintaining high accuracy:

### Step 1: Programmatic Parsing
- **README Parser**: Extracts markdown links, bare URLs, reference-style links
- **Code Comment Parser**: Multi-language support (TS/JS/Python/Go/Rust/Java/C/C++/PHP/Ruby/Shell)
- **Package File Parser**: Metadata from package.json, requirements.txt, Cargo.toml, go.mod
- **Filtering**: Excludes package manager URLs (npm, PyPI, crates.io) - handled by dependabot

### Step 2: LLM 2nd Pass for Document Analysis
- Analyzes README files for dependencies not explicitly linked
- Identifies tools, libraries, API services, research papers mentioned in text
- Discovers documentation sites referenced but not linked
- Limited to 5 README files for performance

### Step 3: Programmatic Type Categorization
Determines dependency type using URL/context pattern matching:
- `research-paper`: arXiv URLs, "paper"/"research" keywords
- `schema`: OpenAPI, Swagger, GraphQL, Protobuf patterns
- `documentation`: /docs, /guide, /tutorial, /reference URLs
- `reference-implementation`: GitHub repos with "example"/"implementation" context
- `api-example`: API examples in context
- **Confidence**: 0.9 for programmatic matches

### Step 4: LLM Fallback for Type Categorization
- Only invoked when Step 3 returns null
- Uses GitHub Copilot CLI (`gh copilot suggest`)
- Prompts LLM to classify dependency type
- **Confidence**: 0.5 for LLM matches

### Step 5: Programmatic Access Method Determination
Determines access method using URL pattern matching:
- `github-api`: github.com URLs
- `arxiv`: arxiv.org URLs
- `openapi`: OpenAPI/Swagger/API specification patterns
- `context7`: Context7 documentation URLs
- Returns null if cannot determine programmatically

### Step 6: LLM Fallback for Access Method
- Only invoked when Step 5 returns null
- Uses GitHub Copilot CLI to determine best access method
- Parses JSON response with access method and confidence
- Defaults to `http` on parsing failure

### Step 7: Manifest Entry Creation
- Generates UUID for each dependency
- Combines programmatic and LLM metadata
- Includes detection method, confidence, timestamps
- Records all file references with line numbers

### GitHub Copilot CLI Integration
- **Command**: `gh copilot suggest` via shell execution
- **Authentication**: Native GitHub authentication (no API keys)
- **Response Parsing**: Handles plain JSON and markdown-wrapped responses
- **Token Estimation**: Approximates usage (CLI doesn't provide exact metrics)
- **Error Handling**: Graceful fallback to defaults on CLI failures

### Benefits of Hybrid Approach
- ⚡ **Performance**: Most categorization is programmatic (no API latency)
- 💰 **Cost-Effective**: Minimizes LLM API calls (~10-20% of dependencies)
- 🎯 **Accuracy**: Programmatic matches have 0.9 confidence vs 0.5 for LLM
- 🔋 **Efficiency**: LLM used only for ambiguous edge cases
- 🔐 **Security**: Native GitHub authentication, no API key management
- 🚀 **Simplicity**: gh CLI pre-installed on GitHub Actions runners

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - tracking table not needed.
