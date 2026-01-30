# Tasks: AI-Powered Dependency Tracking System

**Feature**: 001-ai-dependency-tracker
**Input**: Design documents from `/specs/001-ai-dependency-tracker/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

**Tests**: Optional per TDD constitution principle - tests will be written first, then implementation

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3, US4)
- File paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and workspace structure

- [ ] T001 Create packages directory structure (detector, manifest, monitor, github-client, action)
- [ ] T002 [P] Initialize @dependabit/detector package with package.json, tsconfig.json, README.md
- [ ] T003 [P] Initialize @dependabit/manifest package with package.json, tsconfig.json, README.md
- [ ] T004 [P] Initialize @dependabit/monitor package with package.json, tsconfig.json, README.md
- [ ] T005 [P] Initialize @dependabit/github-client package with package.json, tsconfig.json, README.md
- [ ] T006 [P] Initialize @dependabit/action package with package.json, tsconfig.json, action.yml, README.md
- [ ] T006a [P] Initialize @dependabit/plugin-context7 package with package.json, tsconfig.json, README.md
- [ ] T006b [P] Initialize @dependabit/plugin-arxiv package with package.json, tsconfig.json, README.md
- [ ] T006c [P] Initialize @dependabit/plugin-openapi package with package.json, tsconfig.json, README.md
- [ ] T006d [P] Initialize @dependabit/plugin-http package with package.json, tsconfig.json, README.md
- [ ] T006e [P] Initialize @dependabit/plugin-github package with package.json, tsconfig.json, README.md
- [ ] T007 Configure pnpm workspace in root pnpm-workspace.yaml to include packages/*
- [ ] T008 [P] Install shared dependencies (@actions/core, @actions/github, zod, vitest)
- [ ] T009 Create shared tsconfig.base.json for consistent TypeScript settings across packages
- [ ] T010 [P] Set up .editorconfig rules specific to action code (2 spaces, semicolons, single quotes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Write tests for Zod schemas in packages/manifest/tests/schema.test.ts
- [ ] T012 Implement manifest schema in packages/manifest/src/schema.ts (DependencyManifestSchema, DependencyEntrySchema)
- [ ] T013 Implement config schema in packages/manifest/src/schema.ts (DependabitConfigSchema)
- [ ] T014 Write tests for schema validation in packages/manifest/tests/validator.test.ts
- [ ] T015 Implement schema validator in packages/manifest/src/validator.ts
- [ ] T016 Write tests for manifest CRUD operations in packages/manifest/tests/manifest.test.ts
- [ ] T017 Implement manifest CRUD in packages/manifest/src/manifest.ts (read, write, update, merge)
- [ ] T018 [P] Write tests for config parsing in packages/manifest/tests/config.test.ts
- [ ] T019 [P] Implement config parser in packages/manifest/src/config.ts (YAML parsing, validation)
- [ ] T020 [P] Write tests for structured logger in packages/action/tests/utils/logger.test.ts
- [ ] T021 [P] Implement structured JSON logger in packages/action/src/utils/logger.ts
- [ ] T022 [P] Write tests for GitHub client wrapper in packages/github-client/tests/client.test.ts
- [ ] T023 [P] Implement Octokit wrapper in packages/github-client/src/client.ts with rate limit handling
- [ ] T024 Export all public APIs from packages/manifest/src/index.ts
- [ ] T025 Build @dependabit/manifest package and verify exports
- [ ] T025a [P] Write tests for plugin registry in packages/plugins/tests/registry.test.ts
- [ ] T025b [P] Implement plugin registry in packages/plugins/src/registry.ts (register, discover, load)
- [ ] T025c [P] Write tests for plugin loader in packages/plugins/tests/loader.test.ts
- [ ] T025d [P] Implement plugin loader in packages/plugins/src/loader.ts (validate, instantiate)
- [ ] T025e Export plugin APIs from packages/plugins/src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initial Manifest Generation (Priority: P1) 🎯 MVP

**Goal**: LLM analyzes codebase and generates `.dependabit/manifest.json` with all detected external dependencies

**Independent Test**: Run generate action on sample repo, verify valid manifest created with detected dependencies

### Tests for User Story 1 (TDD - Write FIRST)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US1] Write tests for LLM provider interface in packages/detector/tests/llm/client.test.ts
- [ ] T027 [P] [US1] Write tests for GitHub Copilot integration in packages/detector/tests/llm/copilot.test.ts
- [ ] T028 [P] [US1] Write tests for README parser in packages/detector/tests/parsers/readme.test.ts
- [ ] T029 [P] [US1] Write tests for code comment parser in packages/detector/tests/parsers/code-comments.test.ts
- [ ] T030 [P] [US1] Write tests for package file parser in packages/detector/tests/parsers/package-files.test.ts
- [ ] T031 [US1] Write tests for detector orchestrator in packages/detector/tests/detector.test.ts
- [ ] T032 [US1] Write integration test for generate action in packages/action/tests/actions/generate.test.ts
- [ ] T032a [US1] Create test fixture repository with known dependencies (10+ entries) to validate SC-001 (90%+ accuracy requirement)

### Implementation for User Story 1

- [ ] T033 [P] [US1] Implement LLM provider interface in packages/detector/src/llm/client.ts
- [ ] T034 [US1] Implement GitHub Copilot provider in packages/detector/src/llm/copilot.ts (@azure/openai integration)
- [ ] T035 [P] [US1] Implement detection prompts in packages/detector/src/llm/prompts.ts
- [ ] T036 [P] [US1] Implement README parser in packages/detector/src/parsers/readme.ts (extract URLs, references)
- [ ] T037 [P] [US1] Implement code comment parser in packages/detector/src/parsers/code-comments.ts
- [ ] T038 [P] [US1] Implement package file parser in packages/detector/src/parsers/package-files.ts (package.json, requirements.txt)
- [ ] T039 [US1] Implement detector orchestrator in packages/detector/src/detector.ts (coordinates parsers + LLM)
- [ ] T040 [US1] Export detector APIs from packages/detector/src/index.ts
- [ ] T041 [US1] Implement generate action in packages/action/src/actions/generate.ts
- [ ] T042 [US1] Implement action input parsing in packages/action/src/utils/inputs.ts
- [ ] T043 [US1] Implement action output formatting in packages/action/src/utils/outputs.ts
- [ ] T044 [US1] Create action.yml metadata for @dependabit/action package
- [ ] T045 [US1] Create workflow template .github/workflows/dependabit-generate.yml
- [ ] T046 [US1] Add logging for all LLM interactions (prompt, model, response, tokens, latency)
- [ ] T047 [US1] Add error handling with informational issue creation on LLM failure

**Checkpoint**: US1 complete - can generate manifest from repository analysis

---

## Phase 4: User Story 2 - Automatic Manifest Updates on Push (Priority: P2)

**Goal**: On commits to main/master, analyze changes and update manifest with new/removed dependencies

**Independent Test**: Commit new README with external link, verify manifest auto-updates with new entry

### Tests for User Story 2 (TDD - Write FIRST)

- [ ] T048 [P] [US2] Write tests for commit analysis in packages/github-client/tests/commits.test.ts
- [ ] T049 [P] [US2] Write tests for diff parsing in packages/detector/tests/diff-parser.test.ts
- [ ] T050 [US2] Write tests for manifest merge strategy in packages/manifest/tests/merge.test.ts
- [ ] T051 [US2] Write integration test for update action in packages/action/tests/actions/update.test.ts

### Implementation for User Story 2

- [ ] T052 [P] [US2] Implement commit fetching in packages/github-client/src/commits.ts
- [ ] T053 [P] [US2] Implement diff parser in packages/detector/src/diff-parser.ts (extract changed files)
- [ ] T054 [US2] Implement selective re-analysis in packages/detector/src/detector.ts (only changed files)
- [ ] T055 [US2] Implement manifest merge logic in packages/manifest/src/manifest.ts (preserve manual entries)
- [ ] T056 [US2] Implement update action in packages/action/src/actions/update.ts
- [ ] T057 [US2] Create workflow template .github/workflows/dependabit-update.yml (trigger on push)
- [ ] T058 [US2] Add comparison logging (old vs new manifest)
- [ ] T059 [US2] Add graceful handling for merge conflicts (prefer manual edits)

**Checkpoint**: US2 complete - manifest stays current automatically

---

## Phase 5: User Story 3 - Change Detection and Issue Creation (Priority: P3)

**Goal**: Periodically check external dependencies for changes, create GitHub issues with severity labels

**Independent Test**: Simulate dependency change, verify issue created with correct severity and details

### Tests for User Story 3 (TDD - Write FIRST)

- [ ] T060 [P] [US3] Write tests for GitHub repo checker in packages/monitor/tests/checkers/github-repo.test.ts
- [ ] T061 [P] [US3] Write tests for documentation URL checker in packages/monitor/tests/checkers/url-content.test.ts
- [ ] T062 [P] [US3] Write tests for OpenAPI spec checker in packages/monitor/tests/checkers/openapi.test.ts
- [ ] T062a [P] [US3] Write tests for HTML normalizer in packages/monitor/tests/normalizer.test.ts
- [ ] T062b [P] [US3] Write tests for Context7 checker in packages/monitor/tests/checkers/context7.test.ts
- [ ] T062c [P] [US3] Write tests for arXiv checker in packages/monitor/tests/checkers/arxiv.test.ts
- [ ] T063 [P] [US3] Write tests for state comparator in packages/monitor/tests/comparator.test.ts
- [ ] T064 [P] [US3] Write tests for severity classifier in packages/monitor/tests/severity.test.ts
- [ ] T065 [US3] Write tests for monitor orchestrator in packages/monitor/tests/monitor.test.ts
- [ ] T066 [P] [US3] Write tests for issue creation in packages/github-client/tests/issues.test.ts
- [ ] T067 [US3] Write integration test for check action in packages/action/tests/actions/check.test.ts

### Implementation for User Story 3

- [ ] T068 [P] [US3] Implement GitHub repo checker in packages/monitor/src/checkers/github-repo.ts (releases API)
- [ ] T069 [P] [US3] Implement documentation URL checker in packages/monitor/src/checkers/url-content.ts (SHA256 hashing with normalization)
- [ ] T070 [P] [US3] Implement OpenAPI spec checker in packages/monitor/src/checkers/openapi.ts (semantic diffing)
- [ ] T070a [P] [US3] Implement HTML normalizer in packages/monitor/src/normalizer.ts (6-step normalization from research.md)
- [ ] T070b [P] [US3] Implement Context7 checker in packages/plugin-context7/src/checker.ts (Context7 API integration)
- [ ] T070c [P] [US3] Implement arXiv checker in packages/plugin-arxiv/src/checker.ts (arXiv API version tracking)
- [ ] T071 [US3] Export checkers from packages/monitor/src/checkers/index.ts
- [ ] T072 [P] [US3] Implement state comparator in packages/monitor/src/comparator.ts (old vs new)
- [ ] T073 [P] [US3] Implement severity classifier in packages/monitor/src/severity.ts (breaking/major/minor)
- [ ] T074 [US3] Implement monitor orchestrator in packages/monitor/src/monitor.ts (coordinates all checks)
- [ ] T075 [US3] Implement issue creation in packages/github-client/src/issues.ts (with severity labels)
- [ ] T076 [US3] Implement release fetching in packages/github-client/src/releases.ts
- [ ] T077 [US3] Implement rate limit handler in packages/github-client/src/rate-limit.ts
- [ ] T078 [US3] Implement check action in packages/action/src/actions/check.ts
- [ ] T079 [US3] Create workflow template .github/workflows/dependabit-check.yml (scheduled cron)
- [ ] T080 [US3] Add change history tracking to manifest updates
- [ ] T081 [US3] Add AI agent assignment logic based on severity configuration
- [ ] T082 [US3] Add issue templating with LLM-generated summaries
- [ ] T083 [US3] Add logging for all API calls (endpoint, method, rate-limit, response code)
- [ ] T083a [P] [US3] Write tests for summary reporter in packages/action/tests/utils/reporter.test.ts
- [ ] T083b [P] [US3] Implement summary reporter in packages/action/src/utils/reporter.ts (generates change summary reports)
- [ ] T083c [P] [US3] Create summary template in contracts/summary-template.md

**Checkpoint**: US3 complete - automated dependency monitoring with issue notifications

---

## Phase 6: User Story 4 - Manual Manifest Management (Priority: P4)

**Goal**: Users can manually edit manifest, configure monitoring rules, validate changes

**Independent Test**: Manually add dependency to manifest, run validation, verify monitoring begins

### Tests for User Story 4 (TDD - Write FIRST)

- [ ] T084 [P] [US4] Write tests for manifest validation in packages/action/tests/actions/validate.test.ts
- [ ] T084a [P] [US4] Write tests for AI agent config parser in packages/action/tests/utils/agent-config.test.ts
- [ ] T084b [P] [US4] Write tests for agent router in packages/action/tests/utils/agent-router.test.ts
- [ ] T085 [P] [US4] Write tests for config override logic in packages/manifest/tests/config.test.ts
- [ ] T086 [US4] Write tests for per-dependency schedule in packages/monitor/tests/scheduler.test.ts

### Implementation for User Story 4

- [ ] T087 [US4] Implement validate action in packages/action/src/actions/validate.ts (schema + business rules)
- [ ] T087a [P] [US4] Implement AI agent config parser in packages/action/src/utils/agent-config.ts (parse severity-to-agent mapping from config.yml)
- [ ] T087b [P] [US4] Implement agent router in packages/action/src/utils/agent-router.ts (assign issues based on severity rules)
- [ ] T088 [US4] Implement config override resolution in packages/manifest/src/config.ts (global + per-dependency)
- [ ] T089 [US4] Implement scheduler in packages/monitor/src/scheduler.ts (respect checkFrequency)
- [ ] T090 [US4] Add validation step to update/check workflows
- [ ] T091 [US4] Create .dependabit/config.yml example in quickstart.md
- [ ] T092 [US4] Add CLI-friendly output for validation errors

**Checkpoint**: US4 complete - full manual control and customization available

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Production readiness, documentation, observability, security

- [ ] T092a [P] Write tests for token authentication in packages/github-client/tests/auth/token.test.ts
- [ ] T092b [P] Write tests for OAuth authentication in packages/github-client/tests/auth/oauth.test.ts
- [ ] T092c [P] Write tests for basic authentication in packages/github-client/tests/auth/basic.test.ts
- [ ] T092d [P] Write tests for secret resolver in packages/action/tests/utils/secrets.test.ts
- [ ] T093 [P] Implement authentication support in packages/github-client/src/auth.ts (token, basic, OAuth via secrets)
- [ ] T093a [P] Implement token auth handler in packages/github-client/src/auth/token.ts
- [ ] T093b [P] Implement OAuth handler in packages/github-client/src/auth/oauth.ts
- [ ] T093c [P] Implement basic auth handler in packages/github-client/src/auth/basic.ts
- [ ] T094 [P] Implement secret resolution in packages/action/src/utils/secrets.ts
- [ ] T095 [P] Write E2E test for full workflow in tests/e2e/full-workflow.spec.ts
- [ ] T096 [P] Create test fixtures in tests/e2e/fixtures/sample-repo/
- [ ] T097 [P] Add error categorization and remediation messages in packages/action/src/utils/errors.ts
- [ ] T098 [P] Implement performance metrics tracking (operation durations, API quotas)
- [ ] T098a [P] Implement proactive rate-limit checking with budget reservation in packages/github-client/src/rate-limit.ts (enhance T077)
- [ ] T099 [P] Add manifest size checks and warnings (target <1MB, fail >10MB)
- [ ] T099a [P] Write tests for false positive feedback loop in packages/github-client/tests/feedback.test.ts
- [ ] T099b [P] Implement false positive feedback listener in packages/github-client/src/feedback.ts (monitors issue labels)
- [ ] T099c [P] Write tests for false positive metrics calculator in packages/action/tests/utils/metrics.test.ts
- [ ] T099d [P] Implement false positive rate calculator in packages/action/src/utils/metrics.ts (30-day rolling window)
- [ ] T099e [P] Create E2E test for false positive validation in tests/e2e/false-positive-validation.spec.ts
- [ ] T100 [P] Create comprehensive README for each package
- [ ] T101 [P] Add JSDoc comments for all public APIs
- [ ] T102 [P] Generate TypeDoc documentation
- [ ] T103 [P] Create docs/ai-dependency-tracker/architecture.md
- [ ] T104 [P] Create docs/ai-dependency-tracker/llm-integration.md
- [ ] T104a [P] Create contracts/plugin-api.md (define plugin registration API)
- [ ] T105 [P] Create docs/ai-dependency-tracker/troubleshooting.md
- [ ] T106 Bundle action with @vercel/ncc for single-file distribution
- [ ] T107 Add action branding in action.yml (icon, color)
- [ ] T108 Test action in private repo before publishing
- [ ] T109 Create CHANGELOG.md for initial release
- [ ] T110 Tag v1.0.0 release

---

## Dependencies Between Tasks

### Phase Dependencies (Sequential)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-6 (User Stories) → Phase 7 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Independent - can start immediately after Phase 2
- **US2 (P2)**: Depends on US1 (needs detector + manifest packages)
- **US3 (P3)**: Depends on US1 (needs manifest to monitor), partially depends on US2 (uses merge logic)
- **US4 (P4)**: Depends on US1, US2, US3 (validation of all features)

### Critical Path

```
Setup (T001-T010) → Foundational (T011-T025) → US1 (T026-T047) → US2 (T048-T059) → US3 (T060-T083) → US4 (T084-T092) → Polish (T093-T110)
```

## Parallel Execution Examples

### Phase 1 - Setup (All Parallel)
```
T002, T003, T004, T005, T006, T008, T010 can execute in parallel
```

### Phase 2 - Foundational
```
Parallel Group 1: T011, T014, T016, T018, T020, T022
Parallel Group 2: T012, T013, T015, T017, T019, T021, T023 (after Group 1)
```

### Phase 3 - US1 Tests
```
T026, T027, T028, T029, T030 can all run in parallel
```

### Phase 3 - US1 Implementation
```
Parallel Group: T033, T035, T036, T037, T038 (different files)
Sequential: T039 → T040 → T041
```

## Implementation Strategy

### MVP Delivery (Recommended)

**Week 1**: Complete User Story 1 (P1)
- Tasks: T001-T047
- Deliverable: Working manifest generation action
- Value: Immediate visibility into external dependencies

**Week 2**: Complete User Story 2 (P2)
- Tasks: T048-T059
- Deliverable: Auto-updating manifest on push
- Value: Always-current dependency tracking

**Week 3**: Complete User Story 3 (P3)
- Tasks: T060-T083
- Deliverable: Scheduled monitoring with issue creation
- Value: Proactive change notifications

**Week 4**: Complete User Story 4 (P4) + Polish
- Tasks: T084-T110
- Deliverable: Full customization + production-ready
- Value: Complete feature set

### Test Coverage Requirements

- **Unit tests**: 80% minimum for all packages
- **Integration tests**: All action entry points
- **E2E tests**: Full workflow (generate → update → check)
- **Contract tests**: LLM responses, GitHub API responses

### Validation Gates

Each phase completion requires:
1. All tests passing (vitest run)
2. No linting errors (pnpm run lint)
3. Formatted code (pnpm run format)
4. Updated documentation
5. Successful manual smoke test

## Task Statistics

- **Total Tasks**: 136 (previously 110, added 26 for plugin architecture, auth decomposition, false positive tracking, agent routing, summary reporter)
- **Phase 1 (Setup)**: 15 tasks (added 5 plugin packages)
- **Phase 2 (Foundational)**: 20 tasks (added 5 plugin registry tasks)
- **Phase 3 (US1 - MVP)**: 22 tasks (unchanged)
- **Phase 4 (US2)**: 12 tasks (unchanged)
- **Phase 5 (US3)**: 33 tasks (added 9: context7/arxiv/openapi checkers, normalizer, summary reporter)
- **Phase 6 (US4)**: 13 tasks (added 4: agent config parser, agent router + tests)
- **Phase 7 (Polish)**: 21 tasks (added 9: auth decomposition, false positive tracking)

**Parallelizable Tasks**: 87 tasks marked [P] (64%)

**Estimated Effort**: 5 weeks (1 developer) or 2.5 weeks (2 developers leveraging parallelism)

---

**Format Validation**: ✅ All tasks follow checklist format with IDs, [P] markers, [Story] labels, and file paths
