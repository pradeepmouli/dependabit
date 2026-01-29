# Feature Specification: AI-Powered Dependency Tracking System

**Feature Branch**: `001-ai-dependency-tracker`  
**Created**: 2026-01-29  
**Status**: Draft  
**Input**: User description: "build a github action(s) that will 1. use an LLM (copilot by default) create a manifest of external resources/repos/projects/documents on which a project may depend 2. Use an LLM to update that manifest as triggered (i.e. commits to master branch) 3. Periodically look for changes to the entries listed in the manifest and open issues/PRs when changes occur (which can be manually or automatically assigned to copilot/claude etc...)"

## Clarifications

### Session 2026-01-29

- Q: Where should the dependency manifest file be stored in the repository? → A: Separate `.dependabit/` directory with `manifest.json` inside
- Q: How should the system classify the severity of detected dependency changes to prioritize issues? → A: Three-tier: breaking/major/minor changes
- Q: What should happen when the primary LLM service (GitHub Copilot) is unavailable or rate-limited? → A: Fail gracefully, create informational issue, retry on next scheduled run
- Q: How should the system access private repositories or resources that require authentication? → A: Support multiple auth methods (GitHub token, API keys, OAuth) via secrets
- Q: How often should the system check for dependency changes by default? → A: Configurable using configuration similar to dependabot

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Manifest Generation (Priority: P1)

A developer initializes dependency tracking for their project by having an LLM analyze the codebase and generate a manifest of all external dependencies (GitHub repos, documentation sites, API references, third-party libraries).

**Why this priority**: This is the foundation - without a manifest, no other features can function. Delivers immediate value by providing visibility into external dependencies that may not be captured in package.json or similar files.

**Independent Test**: Can be fully tested by running the GitHub Action on a sample repository and verifying it produces a valid manifest file listing all detected external resources with their current versions/states.

**Acceptance Scenarios**:

1. **Given** a repository with README files, documentation, and code comments referencing external resources, **When** the manifest generation action runs, **Then** a structured manifest file is created listing all detected external dependencies with metadata (URL, type, current version/state, detection method)
2. **Given** a repository with no external references, **When** the manifest generation action runs, **Then** an empty but valid manifest file is created
3. **Given** a repository with ambiguous references, **When** the LLM analyzes the content, **Then** the manifest includes confidence scores for each detected dependency

---

### User Story 2 - Automatic Manifest Updates on Push (Priority: P2)

When developers push changes to the master branch, the system automatically analyzes new commits for added or removed external dependencies and updates the manifest accordingly.

**Why this priority**: Keeps the manifest current without manual intervention, ensuring the dependency inventory stays synchronized with code changes.

**Independent Test**: Can be tested by committing code that adds new external references (e.g., new API documentation link in README) and verifying the manifest is automatically updated with the new entries.

**Acceptance Scenarios**:

1. **Given** a commit that adds a new external resource reference, **When** the update action is triggered, **Then** the manifest is updated to include the new dependency with appropriate metadata
2. **Given** a commit that removes references to an external resource, **When** the update action is triggered, **Then** the manifest is updated to mark the dependency as removed or no longer referenced
3. **Given** multiple commits pushed at once, **When** the update action runs, **Then** all changes are analyzed and the manifest reflects the cumulative updates

---

### User Story 3 - Change Detection and Issue Creation (Priority: P3)

The system periodically checks all external resources in the manifest for changes (new releases, breaking changes, deprecations, documentation updates) and automatically creates GitHub issues when changes are detected.

**Why this priority**: Proactive notification of upstream changes helps teams stay current and avoid breaking changes. This is the "automation value-add" that justifies the entire system.

**Independent Test**: Can be tested by having a manifest with a known external resource, simulating a change to that resource, and verifying an issue is created with relevant details and optional AI agent assignment.

**Acceptance Scenarios**:

1. **Given** an external GitHub repository in the manifest, **When** that repository publishes a new release, **Then** an issue is created describing the changes with a link to the release notes
2. **Given** an external documentation site in the manifest, **When** the content hash changes, **Then** an issue is created indicating potential documentation updates
3. **Given** a newly created issue for a dependency change, **When** assignment rules are configured, **Then** the issue is automatically assigned to the specified AI agent (Copilot, Claude, etc.) for review
4. **Given** multiple changes detected in one check cycle, **When** issues are created, **Then** they are labeled with severity (breaking/major/minor) and prioritized accordingly

---

### User Story 4 - Manual Manifest Management (Priority: P4)

Developers can manually add, edit, or remove entries in the manifest file and configure monitoring rules for specific dependencies.

**Why this priority**: Provides control for edge cases where automatic detection fails or custom monitoring rules are needed.

**Independent Test**: Can be tested by manually editing the manifest file to add a custom dependency and verifying the change detection system monitors it correctly.

**Acceptance Scenarios**:

1. **Given** a developer manually adds a dependency to the manifest, **When** the validation action runs, **Then** the entry is validated and monitoring begins on the next scheduled check
2. **Given** a developer configures check frequency in a dependabot-style configuration file, **When** the scheduled checks run, **Then** dependencies are checked according to their configured schedules
3. **Given** a developer marks a dependency as "ignore changes", **When** changes are detected, **Then** no issues are created for that dependency

---

### Edge Cases

- What happens when the LLM is unavailable or rate-limited during manifest generation or update? System fails gracefully, creates an informational issue notifying the team, and automatically retries on the next scheduled workflow run.
- How does the system handle private repositories or resources requiring authentication? System supports multiple authentication methods (GitHub token, API keys, OAuth tokens) configured via GitHub Secrets, with per-dependency auth configuration in the manifest.
- What happens when a monitored external resource becomes permanently unavailable (404)?
- How are false positives (spurious change detections) minimized?
- What happens when the manifest file grows very large (hundreds of dependencies)?
- How does the system handle different types of resources (Git repos, NPM packages, documentation sites, API endpoints)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST analyze repository content (README, docs, code comments, configuration files) to detect external dependencies
- **FR-002**: System MUST support multiple LLM providers with GitHub Copilot as default (configurable to Claude, OpenAI, etc.)
- **FR-003**: System MUST generate a structured manifest file in JSON format stored at `.dependabit/manifest.json` with schema validation
- **FR-004**: System MUST trigger manifest updates on commits to the default branch (configurable)
- **FR-005**: System MUST support configurable scheduled checks for dependency changes using a dependabot-style configuration file specifying check frequency, schedules, and per-dependency overrides
- **FR-006**: System MUST create GitHub issues when dependency changes are detected
- **FR-007**: System MUST support automatic assignment of issues to AI agents based on configuration
- **FR-008**: System MUST track metadata for each dependency: URL, type, version/state, last checked timestamp, detection confidence
- **FR-009**: System MUST handle different dependency types: GitHub repositories, NPM packages, documentation URLs, API endpoints, blog posts, papers
- **FR-010**: System MUST log all LLM interactions (prompts, responses, tokens, latency) for debugging
- **FR-011**: System MUST respect GitHub API rate limits and implement appropriate backoff strategies
- **FR-012**: System MUST validate manifest schema before committing changes
- **FR-013**: System MUST provide summary reports of changes detected in each monitoring cycle
- **FR-014**: System MUST allow manual configuration of monitoring rules per dependency
- **FR-015**: System MUST gracefully handle LLM failures by creating informational issues, logging errors, and retrying on next scheduled run without manual intervention
- **FR-016**: System MUST support multiple authentication methods (GitHub token, API keys, OAuth) for accessing private resources via GitHub Secrets configuration
- **FR-017**: System MUST support a dependabot-style YAML configuration file (`.dependabit/config.yml`) for defining monitoring schedules, update strategies, and per-dependency settings

### Key Entities

- **Dependency Manifest**: Central data structure listing all tracked external resources stored at `.dependabit/manifest.json`; includes metadata (URLs, types, versions, last-checked timestamps, confidence scores); version-controlled within repository
- **Dependency Entry**: Individual record in manifest representing one external resource; contains URL, type classification, current version/state hash, detection method, monitoring rules, authentication configuration (reference to GitHub Secret), last change detected timestamp
- **Change Detection Record**: Log of detected changes to dependencies; includes timestamp, change type, old/new state comparison, severity classification (breaking/major/minor)
- **Monitor Configuration**: Dependabot-style configuration file (`.dependabit/config.yml`) defining monitoring rules; includes global check schedules, per-dependency frequency overrides, change detection methods, issue creation rules, AI agent assignment preferences

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System successfully generates a manifest with 90%+ accuracy (detected dependencies match manual review) for a sample repository within 5 minutes
- **SC-002**: Manifest updates complete within 2 minutes of a commit to master branch
- **SC-003**: Scheduled change detection checks complete for repositories with up to 100 dependencies within 10 minutes
- **SC-004**: Issues are created within 15 minutes of detecting a dependency change
- **SC-005**: False positive rate (issues created for non-meaningful changes) is below 10%
- **SC-006**: System operates within GitHub Actions free tier limits for repositories with typical dependency counts (< 50 external dependencies)
- **SC-007**: All LLM interactions are logged with complete traceability for debugging and cost optimization
- **SC-008**: System handles at least 3 different dependency types (GitHub repos, NPM packages, documentation sites) in initial release

## Assumptions

- GitHub Actions environment has access to GitHub API and configured LLM provider
- Repositories using this system have external dependencies documented in discoverable locations (README, docs, code comments)
- LLM provider APIs are generally available with reasonable rate limits
- Users accept that AI-based detection may not be 100% accurate and manual review/correction is sometimes needed
- Change detection for external resources can be accomplished through API calls, content hashing, or version checks
- GitHub repository has appropriate permissions for creating issues and committing manifest updates
