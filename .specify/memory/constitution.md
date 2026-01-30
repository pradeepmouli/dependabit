<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Change Type: MINOR (Added workflow-specific quality gates)

Modified Principles:
- None (core principles unchanged)

Added Sections:
- Development Workflow → Workflow Types (8 workflow types defined)
- Development Workflow → Core Workflow (Feature Development)
- Development Workflow → Extension Workflows (9 workflows documented)
- Development Workflow → Quality Gates by Workflow (8 workflow-specific gates)

Removed Sections:
- Development Workflow → Feature Development Process (consolidated into quality gates)

Templates Requiring Updates:
- ✅ All workflow prompts (.github/prompts/speckit.*.prompt.md) - already compatible
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

### Workflow Types

Development activities SHALL use the appropriate workflow type based on the nature of the work. Each workflow enforces specific quality gates and documentation requirements tailored to its purpose:

- **Baseline** (`/speckit.baseline`): Project context establishment - requires comprehensive documentation of existing architecture and change tracking
- **Feature Development** (`/speckit.specify`): New functionality - requires full specification, planning, and TDD approach
- **Bug Fixes** (`/speckit.bugfix`): Defect remediation - requires regression test BEFORE applying fix
- **Enhancements** (`/speckit.enhance`): Minor improvements to existing features - streamlined single-document workflow with simple single-phase plan (max 7 tasks)
- **Modifications** (`/speckit.modify`): Changes to existing features - requires impact analysis and backward compatibility assessment
- **Refactoring** (`/speckit.refactor`): Code quality improvements - requires baseline metrics, behavior preservation guarantee, and incremental validation
- **Hotfixes** (`/speckit.hotfix`): Emergency production issues - expedited process with deferred testing and mandatory post-mortem
- **Deprecation** (`/speckit.deprecate`): Feature sunset - requires phased rollout (warnings → disabled → removed), migration guide, and stakeholder approvals

The wrong workflow SHALL NOT be used - features must not bypass specification, bugs must not skip regression tests, refactorings must not alter behavior, and enhancements requiring complex multi-phase plans must use full feature development workflow.

### Core Workflow (Feature Development)

1. Feature request initiates with `/speckit.specify <description>`
2. Clarification via `/speckit.clarify` to resolve ambiguities
3. Technical planning with `/speckit.plan` to create implementation design
4. Task breakdown using `/speckit.tasks` for execution roadmap
5. Implementation via `/speckit.implement` following task order

### Extension Workflows

- **Baseline**: `/speckit.baseline` → baseline-spec.md + current-state.md establishing project context
- **Bugfix**: `/speckit.bugfix "<description>"` → bug-report.md + tasks.md with regression test requirement
- **Enhancement**: `/speckit.enhance "<description>"` → enhancement.md (condensed single-doc with spec + plan + tasks)
- **Modification**: `/speckit.modify <feature_num> "<description>"` → modification.md + impact analysis + tasks.md
- **Refactor**: `/speckit.refactor "<description>"` → refactor.md + baseline metrics + incremental tasks.md
- **Hotfix**: `/speckit.hotfix "<incident>"` → hotfix.md + expedited tasks.md + post-mortem.md (within 48 hours)
- **Deprecation**: `/speckit.deprecate <feature_num> "<reason>"` → deprecation.md + dependency scan + phased tasks.md
- **Review**: `/speckit.review <task_id>` → review implementation against spec + update tasks.md + generate report
- **Cleanup**: `/speckit.cleanup` → organize specs/ directory + archive old branches + update documentation

### Quality Gates by Workflow

**Baseline**:
- Comprehensive project analysis MUST be performed
- All major components MUST be documented in baseline-spec.md
- Current state MUST enumerate all changes by workflow type
- Architecture and technology stack MUST be accurately captured

**Feature Development**:
- Specification MUST be complete before planning
- Plan MUST pass constitution checks before task generation
- Tests MUST be written before implementation (TDD)
- Code review MUST verify constitution compliance

**Bugfix**:
- Bug reproduction MUST be documented with exact steps
- Regression test MUST be written before fix is applied
- Root cause MUST be identified and documented
- Prevention strategy MUST be defined

**Enhancement**:
- Enhancement MUST be scoped to a single-phase plan with no more than 7 tasks
- Changes MUST be clearly defined in the enhancement document
- Tests MUST be added for new behavior
- If complexity exceeds single-phase scope, full feature workflow MUST be used instead

**Modification**:
- Impact analysis MUST identify all affected files and contracts
- Original feature spec MUST be linked
- Backward compatibility MUST be assessed
- Migration path MUST be documented if breaking changes

**Refactor**:
- Baseline metrics MUST be captured before any changes unless explicitly exempted
- Tests MUST pass after EVERY incremental change
- Behavior preservation MUST be guaranteed (tests unchanged)
- Target metrics MUST show measurable improvement unless explicitly exempted

**Hotfix**:
- Severity MUST be assessed (P0/P1/P2)
- Rollback plan MUST be prepared before deployment
- Fix MUST be deployed and verified before writing tests (exception to TDD)
- Post-mortem MUST be completed within 48 hours of resolution

**Deprecation**:
- Dependency scan MUST be run to identify affected code
- Migration guide MUST be created before Phase 1
- All three phases MUST complete in sequence (no skipping)
- Stakeholder approvals MUST be obtained before starting

### Pre-Commit Checklist

1. `pnpm install` - Ensure dependencies synchronized
2. `pnpm run lint` - Lint passes (auto-fix with `pnpm run lint:fix`)
3. `pnpm test` - All tests pass
4. `pnpm run format` - Code formatted consistently
5. Git hooks automatically run lint-staged checks via simple-git-hooks

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

**Version**: 1.1.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
