<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 → 1.0.0
Change Type: MAJOR (Initial constitution ratification)

Modified Principles:
- All principles newly defined (initial version)

Added Sections:
- Core Principles (5 principles)
- Quality Standards
- Development Workflow
- Governance

Removed Sections: None

Templates Requiring Updates:
- ✅ plan-template.md - Constitution Check section already compatible
- ✅ spec-template.md - User story and requirements sections align with principles
- ✅ tasks-template.md - Task organization supports modular and test-first principles

Follow-up TODOs: None
==================
-->

# Dependabit Constitution

## Core Principles

### I. Modular Package Architecture

Every feature MUST be developed as a standalone, reusable package within the pnpm workspace monorepo.

**Rules:**
- Packages MUST be independently testable with their own test suites
- Each package MUST have a clear, single responsibility (no "catch-all" utility packages)
- Packages MUST export TypeScript definitions for all public APIs
- Cross-package dependencies MUST be explicitly declared in package.json
- Packages MUST include a focused README with usage examples

**Rationale:** AI-powered GitHub Actions require modular components that can be independently verified, updated, and reused across different automation workflows. Clear boundaries prevent cascade failures when AI models or APIs change.

### II. Test-First Development (NON-NEGOTIABLE)

All code changes MUST follow Test-Driven Development (TDD) with tests written and approved before implementation.

**Rules:**
- Tests MUST be written first and MUST fail initially
- Implementation proceeds only after test approval
- Red-Green-Refactor cycle strictly enforced
- Vitest framework required for all tests
- Minimum test coverage: 80% for public APIs
- Integration tests required for AI/LLM interactions and GitHub API calls

**Rationale:** AI-driven automation introduces non-deterministic behavior. Test-first development ensures reproducible behavior, catches regression in AI model responses, and validates GitHub Action workflows before deployment.

### III. Observable & Debuggable Operations

All operations MUST produce structured, parseable logs that enable debugging of AI decisions and GitHub Action runs.

**Rules:**
- Structured logging required (JSON format for machine parsing)
- Every AI/LLM call MUST log: prompt, model, response, latency, tokens
- GitHub API calls MUST log: endpoint, method, rate-limit status, response codes
- Error messages MUST include actionable remediation steps
- Performance metrics MUST be tracked: latency, token usage, API quotas

**Rationale:** GitHub Actions run in ephemeral environments. Comprehensive logging is critical for diagnosing failures, understanding AI behavior, auditing automation decisions, and optimizing token/API usage costs.

### IV. Conventional Commits & Semantic Versioning

All changes MUST follow Conventional Commits specification and semantic versioning for predictable releases.

**Rules:**
- Commit format: `type(scope): description` (enforced via git hooks)
- Types: feat, fix, docs, refactor, test, chore, perf, ci
- Breaking changes MUST include `BREAKING CHANGE:` footer
- Versioning: MAJOR.MINOR.PATCH semantic versioning
- Breaking changes trigger MAJOR version bump
- Changesets required for all publishable changes

**Rationale:** AI agents and automation tools need predictable version semantics. Conventional commits enable automated changelog generation, version bumping, and clear communication of breaking changes to dependent workflows.

### V. Non-Destructive Agent Collaboration

All AI agents MUST preserve existing work and coordinate changes through documented workflows.

**Rules:**
- Never reset, force-push, or overwrite user work
- Changes MUST be additive or clearly marked replacements
- Multi-agent changes MUST update shared documentation (README, AGENTS.md)
- Agents MUST verify compatibility with existing tooling (oxlint, oxfmt, vitest)
- Code formatting MUST match .editorconfig (2 spaces, no tabs, semicolons, single quotes)

**Rationale:** Multiple AI agents (Copilot, Claude, Gemini) collaborate on this project. Non-destructive patterns prevent data loss and enable rollback. Consistent formatting ensures agents don't create conflicts over style differences.

## Quality Standards

### Code Quality
- **Linting**: oxlint MUST pass with zero errors before commit
- **Formatting**: oxfmt MUST be applied (2-space indentation, semicolons, single quotes)
- **Type Safety**: TypeScript strict mode enabled, no implicit `any`
- **Performance**: GitHub Actions MUST complete within 5 minutes for CI/CD workflows
- **Security**: No credentials or API keys in code; use GitHub Secrets

### Testing Requirements
- **Unit Tests**: Required for all public APIs and utility functions
- **Integration Tests**: Required for AI model interactions and GitHub API integrations
- **E2E Tests**: Required for complete GitHub Action workflows (Playwright)
- **Coverage**: Minimum 80% for packages, 60% for integration layers
- **Test Speed**: Unit tests MUST complete within 10 seconds per package

### Documentation Standards
- **Package README**: Required for every package with installation, usage, API reference
- **Code Comments**: Required for complex AI prompts, algorithm logic, edge cases
- **Examples**: Each package MUST include runnable examples in README
- **ADRs**: Architecture Decision Records required for technology/pattern choices

## Development Workflow

### Pre-Commit Checklist
1. `pnpm install` - Ensure dependencies synchronized
2. `pnpm run lint` - Lint passes (auto-fix with `pnpm run lint:fix`)
3. `pnpm test` - All tests pass
4. `pnpm run format` - Code formatted consistently
5. Git hooks automatically run lint-staged checks via simple-git-hooks

### Feature Development Process
1. **Planning**: Create specification using `.specify/templates/spec-template.md`
2. **Design**: Document implementation plan using `.specify/templates/plan-template.md`
3. **Constitution Check**: Verify compliance with all principles before coding
4. **Test Creation**: Write failing tests per TDD principle (Principle II)
5. **Implementation**: Implement features to pass tests
6. **Validation**: Run full test suite + lint + format checks
7. **Documentation**: Update READMEs, examples, ADRs as needed
8. **Review**: Coordinate with other agents via AGENTS.md updates

### CI/CD Gates
- **Lint Gate**: oxlint must pass
- **Test Gate**: All tests must pass with minimum coverage
- **Format Gate**: oxfmt check must pass
- **Type Gate**: TypeScript compilation must succeed
- **Security Gate**: npm audit must show no high/critical vulnerabilities
- **Performance Gate**: GitHub Action workflows must complete within SLA

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests, code reviews, and agent operations MUST verify compliance with these principles.

### Amendment Process
1. Proposed changes MUST be documented with rationale
2. Impact analysis required across all templates and workflows
3. Version bump required following semantic versioning rules (see Principle IV)
4. Migration plan required for breaking changes
5. All affected documentation MUST be updated before amendment ratification

### Compliance Verification
- Constitution check integrated into `.specify/templates/plan-template.md`
- Violations MUST be explicitly justified in "Complexity Tracking" section
- Agents MUST coordinate via AGENTS.md when modifying shared workflows
- Runtime development guidance available in AGENTS.md

### Version Control
- MAJOR version: Breaking changes to principles, removal of principles
- MINOR version: New principles added, significant expansions
- PATCH version: Clarifications, typos, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
