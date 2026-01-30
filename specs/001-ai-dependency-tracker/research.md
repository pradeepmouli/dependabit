# Research: AI-Powered Dependency Tracking System

**Feature**: 001-ai-dependency-tracker
**Phase**: 0 - Technology Research & Decision Documentation
**Date**: 2026-01-29

## Overview

This document consolidates research findings for building the AI-powered dependency tracking GitHub Action. All technical decisions are documented with rationale and alternatives considered.

## Technology Decisions

### 1. GitHub Actions Implementation Approach

**Decision**: TypeScript Actions using @actions/core and @actions/github

**Rationale**:
- First-class TypeScript support with official GitHub packages
- Strongly typed inputs/outputs reduce runtime errors
- Direct Node.js execution (faster than Docker actions)
- Excellent debugging with source maps
- Aligns with existing repo tooling (TypeScript, pnpm, Vitest)

**Alternatives Considered**:
- **Docker-based actions**: Rejected - slower startup, larger artifact size, unnecessary containerization overhead
- **Composite actions only**: Rejected - limited logic capabilities, harder to test, no TypeScript benefits
- **JavaScript actions**: Rejected - TypeScript provides superior type safety for complex LLM/API interactions

### 2. LLM Integration Strategy

**Decision**: Provider abstraction layer with GitHub Copilot as default

**Rationale**:
- GitHub Copilot integrated with GitHub Actions environment
- No additional API key management for GitHub-hosted runners
- Provider interface allows swapping to Claude/OpenAI/etc. via configuration
- Abstraction enables testing with mock providers

**Alternatives Considered**:
- **Hard-coded Copilot only**: Rejected - inflexible, vendor lock-in
- **Multi-provider parallel execution**: Rejected - expensive, complex consensus logic
- **Local LLM (Ollama)**: Rejected - inconsistent results, slow on GitHub runners

**Implementation Pattern**:
```typescript
interface LLMProvider {
  analyze(content: string, prompt: string): Promise<LLMResponse>;
  getSupportedModels(): string[];
  getRateLimit(): RateLimitInfo;
}
```

### 3. Plugin Architecture for Dependency Types

**Decision**: Extensible plugin system with separate access methods and dependency types

**Rationale**:
- Decouples HOW to retrieve a dependency from WHAT it represents
- Enables community contributions for new dependency types
- Avoids feature bloat in core package
- Plugins can be versioned and maintained independently
- Supports mixed access methods (e.g., documentation accessed via Context7 or direct URL)

**Architecture Pattern**:
```typescript
// Access Method: HOW to retrieve/check the dependency
interface AccessMethod {
  name: string; // 'context7' | 'arxiv' | 'http' | 'github-api' | 'openapi'
  fetch(config: AccessConfig): Promise<DependencySnapshot>;
  compare(prev: DependencySnapshot, curr: DependencySnapshot): ChangeDetection;
}

// Dependency Type: WHAT the dependency represents
interface DependencyType {
  name: string; // 'reference-implementation' | 'schema' | 'documentation' | 'research-paper'
  accessMethod: string; // References AccessMethod by name
  metadata: Record<string, unknown>; // Type-specific fields
  severityRules?: SeverityRule[]; // Custom rules for change classification
}

// Plugin registration
interface DependencyPlugin {
  type: DependencyType;
  accessMethod: AccessMethod;
  validator: (config: unknown) => ValidationResult;
}
```

**Example Access Methods** (extensible via plugins):
- `context7`: Fetch documentation via Context7 API
- `http`: Generic HTTP fetch with content hashing
- `arxiv`: arXiv API for research papers
- `github-api`: GitHub API for releases/tags and file content
- `openapi`: OpenAPI spec fetching and semantic diffing

**Example Dependency Types** (extensible via plugins):
- `reference-implementation`: Example code demonstrating API usage
- `schema`: OpenAPI, JSON Schema, GraphQL schema, Protocol Buffers
- `documentation`: API docs, tutorials, guides (excluding changelog)
- `research-paper`: Academic papers, arXiv preprints
- `api-example`: Code snippets from documentation sites

**Explicitly OUT OF SCOPE** (Handled by existing tools):
- ❌ NPM packages → Use dependabot (package.json dependencies)
- ❌ PyPI packages → Use dependabot (requirements.txt dependencies)
- ❌ Cargo crates → Use dependabot (Cargo.toml dependencies)
- ❌ Docker images → Use dependabot (Dockerfile FROM statements)
- ❌ Maven/Gradle deps → Use dependabot (pom.xml/build.gradle dependencies)

**IN SCOPE** (Not covered by dependabot):
- ✅ GitHub releases/tags (when not a declared dependency)
- ✅ Documentation sites and API references
- ✅ OpenAPI/GraphQL schemas
- ✅ Research papers and arXiv preprints
- ✅ Reference implementations and code examples

**Focus**: Track dependencies that existing tools CAN'T handle - dependabot only tracks declared dependencies in package manifests, not informational references

**Alternatives Considered**:
- **Monolithic dependency system**: Rejected - inflexible, hard to extend
- **Track all dependency types**: Rejected - duplicates dependabot, unnecessary complexity
- **Access method embedded in type**: Rejected - prevents reuse, tight coupling

### 4. Manifest Storage Format

**Decision**: JSON with Zod schema validation

**Rationale**:
- JSON is widely supported, human-readable, git-friendly
- Zod provides compile-time + runtime type safety
- Schema evolution support (versioning field)
- Better performance than YAML for programmatic access
- Native JavaScript object mapping

**Alternatives Considered**:
- **YAML**: Rejected - slower parsing, less strict, harder validation
- **SQLite file**: Rejected - binary format not git-friendly, overkill for structured data
- **Markdown with frontmatter**: Rejected - parsing complexity, limited structure

### 5. Configuration File Format

**Decision**: YAML (dependabot-style) with Zod schema validation

**Rationale**:
- Matches user requirement for "dependabot-style configuration"
- YAML is more human-friendly for configuration (comments, multi-line)
- Developers already familiar with dependabot.yml pattern
- Zod converts YAML → validated TypeScript objects

**Alternatives Considered**:
- **JSON config**: Rejected - less readable, no comments, not dependabot-style
- **TOML**: Rejected - less common in GitHub ecosystem, inconsistent with dependabot

### 6. Change Detection Methods

**Decision**: Plugin-based detection matching access methods

**Rationale**:
- Detection logic coupled to access method, not dependency type
- Each access method plugin provides its own change detection
- Enables semantic diffing when possible (OpenAPI, schemas)
- Content hashing fallback for unstructured content

**Access Method Detection Matrix**:
| Access Method | Detection Strategy | Snapshot Format |
|---------------|-------------------|----------------|
| `context7` | Library version + content hash | `{ version, contentHash, metadata }` |
| `arxiv` | arXiv version number | `{ arxivId, version, publishedDate }` |
| `openapi` | Semantic diff of spec | `{ version, endpoints[], schemas[] }` |
| `github-api` | Release tags OR file SHA + commit | `{ release: { tag, publishedAt }, sha, commit }` |
| `http` | Normalized content hash | `{ url, contentHash, etag, lastModified }` |

**Change Detection Details**:
- **Context7**: Uses library version from Context7 API + content hash of docs
- **arXiv**: Compares arXiv version field (e.g., v1 → v2 indicates revision)
- **OpenAPI**: Semantic diff detects breaking changes (removed endpoints, changed schemas)
- **GitHub API**:
  - **For releases**: Compares latest release tag (e.g., v1.0.0 → v1.1.0)
  - **For files**: Compares file SHAs and commit history
  - Use case: Track repos that aren't in your package.json but you reference (e.g., specs, examples)
- **HTTP**: SHA256 hash after HTML normalization (strip `<script>`, timestamps, ads)

**Content Normalization** (for HTTP access method):
1. Remove `<script>` and `<style>` tags
2. Strip HTML comments
3. Normalize whitespace (collapse multiple spaces)
4. Remove common timestamp patterns (`Updated: ...`, `Last modified: ...`)
5. Remove analytics/tracking parameters
6. Hash remaining content with SHA256

**Alternatives Considered**:
- **Content hashing only**: Rejected - misses semantic version info, high false positive rate
- **Manual version specification**: Rejected - defeats automation purpose
- **Track package registries**: Rejected - dependabot already handles this efficiently

### 7. Issue Creation Strategy

**Decision**: One issue per dependency change with severity labels

**Rationale**:
- Granular tracking enables per-dependency discussion/resolution
- Severity labels (breaking/major/minor) support prioritization
- Avoids overwhelming single "digest" issue
- Supports assignment to different AI agents per dependency

**Alternatives Considered**:
- **Digest issue (all changes)**: Rejected - hard to track resolution, poor signal-to-noise
- **Pull requests instead of issues**: Rejected - premature action, user should review first
- **Slack/email notifications**: Rejected - out of scope, users can integrate via issue webhooks

### 8. Authentication Handling

**Decision**: Secure credential mapping via GitHub Secrets

**Rationale**:
- Manifest stores secret name references, not values
- GitHub Actions provides secure secret injection
- Per-dependency auth configuration enables mixed public/private dependencies
- Support for multiple auth types (token, basic, OAuth)

**Pattern**:
```yaml
# .dependabit/config.yml
dependencies:
  - name: "OpenAI API Schema"
    type: "schema"  # Dependency type
    accessMethod: "openapi"  # How to fetch it
    config:
      url: "https://api.openai.com/v1/openapi.yaml"
    auth:
      type: "token"
      secret: "OPENAI_API_KEY"  # References GitHub Secret

  - name: "React Server Components RFC"
    type: "documentation"
    accessMethod: "github-api"  # Fetch specific file via API
    config:
      repo: "reactjs/rfcs"
      path: "text/0000-server-components.md"
    # No auth needed for public repos

  - name: "Kubernetes Release"
    type: "reference-implementation"
    accessMethod: "github-api"  # Track releases/tags
    config:
      repo: "kubernetes/kubernetes"
      trackReleases: true  # Monitor for new releases (not a declared dependency)
    # Dependabot won't track this unless it's in your go.mod

  - name: "Attention Is All You Need"
    type: "research-paper"
    accessMethod: "arxiv"
    config:
      arxivId: "1706.03762"
```

**Alternatives Considered**:
- **Environment variables only**: Rejected - hard to map per-dependency, security risk of exposing all vars
- **Encrypted manifest fields**: Rejected - complex key management, rotation issues
- **No private resource support**: Rejected - user requirement explicitly includes private repos

### 9. Testing Strategy

**Decision**: Multi-layer testing with Vitest + GitHub Actions mocking

**Rationale**:
- Unit tests: Fast, isolated component testing (parsers, validators, comparators)
- Integration tests: Cross-package workflows with mocked external services
- E2E tests: Real action execution against fixture repositories
- Contract tests: LLM/API response validation

**Testing Layers**:
```
E2E (Playwright + local act)
    ↓
Integration (Vitest + MSW for API mocking)
    ↓
Unit (Vitest + pure functions)
```

**Alternatives Considered**:
- **Jest**: Rejected - slower, more configuration, switching cost
- **Manual testing only**: Rejected - violates TDD constitution principle
- **Real API calls in tests**: Rejected - slow, flaky, rate-limit issues, cost

### 10. Logging & Observability

**Decision**: Structured JSON logging with @actions/core integration

**Rationale**:
- JSON logs are machine-parseable for analysis/alerting
- GitHub Actions UI displays formatted logs
- Correlation IDs link related operations
- Separate log levels (debug/info/warn/error) for filtering

**Log Structure**:
```typescript
{
  timestamp: "2026-01-29T10:30:00Z",
  level: "info",
  operation: "detect-dependencies",
  correlationId: "gen-20260129-103000",
  llm: { provider: "copilot", model: "gpt-4", tokens: 1234, latency: 2300 },
  result: { dependencies: 12, confidence: 0.92 }
}
```

**Alternatives Considered**:
- **Plain text logs**: Rejected - hard to parse, query, analyze
- **External logging service**: Rejected - adds dependency, cost, complexity
- **No structured logging**: Rejected - violates constitution observability principle

### 11. Rate Limit Management

**Decision**: Proactive rate-limit checking with exponential backoff

**Rationale**:
- GitHub/NPM APIs have documented rate limits
- Octokit provides rate-limit headers in responses
- Exponential backoff prevents thundering herd
- Graceful degradation (skip check, log, retry later)

**Implementation**:
- Check rate limit before expensive operations
- Reserve budget for issue creation (higher priority)
- Log remaining quota in every API interaction
- Fail-fast if quota exhausted (don't waste workflow minutes)

**Alternatives Considered**:
- **Ignore rate limits**: Rejected - causes failures, poor UX
- **Fixed retry intervals**: Rejected - inefficient, may exceed workflow timeout
- **Queue-based processing**: Rejected - adds complexity, harder to reason about in GitHub Actions

### 12. False Positive Validation (SC-005)

**Decision**: Multi-stage validation strategy to achieve <10% false positive rate

**Validation Approach**:
1. **Pre-deployment**: Test against fixture repositories with known change history (T032a)
2. **Post-deployment**: Track issue labels with `false-positive` tag for human feedback loop
3. **Continuous monitoring**: Calculate false positive rate = (issues labeled false-positive) / (total issues created) over 30-day windows
4. **Improvement cycle**: Review false positives monthly, refine detection logic (e.g., normalize timestamps, filter dynamic content)

**Measurement Methodology**:
- E2E test suite includes repositories with known dependencies and simulated changes
- Test cases validate that only genuine changes (version bumps, breaking API changes) trigger issues
- Non-meaningful changes (whitespace, formatting, ads, analytics scripts) should NOT trigger issues
- Success metric: ≥90% of test cases correctly classify changes

**Implementation Notes**:
- Content normalization reduces false positives: strip timestamps, remove ads/tracking scripts, normalize whitespace
- Semantic versioning comparison preferred over content hashing when available
- For documentation URLs: compare content hashes after HTML normalization (remove `<script>`, `<style>`, timestamps)

**Post-Launch Tracking**:
- Add `false-positive` and `true-positive` labels to issue templates
- Include feedback prompt in issue body: "Is this a meaningful change? Add label: false-positive or true-positive"
- Generate monthly reports from GitHub issue search: `label:false-positive` vs total issues
- Refine detection algorithms based on feedback patterns

## Dependencies & Packages

### Required NPM Packages

**Core Action Dependencies**:
- `@actions/core` ^1.11.1 - Input/output handling, logging
- `@actions/github` ^6.0.0 - GitHub API client, context
- `@octokit/rest` ^21.0.2 - Enhanced GitHub API features

**LLM & AI**:
- `@azure/openai` ^2.0.0 - GitHub Copilot / Azure OpenAI SDK
- Research needed: Anthropic Claude SDK, other providers

**Data Validation & Schema**:
- `zod` ^3.24.1 - Runtime type validation
- `yaml` ^2.6.1 - YAML parsing for config files

**HTTP & API**:
- `node-fetch` ^3.3.2 - HTTP client for generic URLs (ESM)
- `undici` ^7.0.0 - Fast HTTP/1.1 client alternative

**Hashing & Comparison**:
- `crypto` (Node.js built-in) - Content hashing
- `fast-deep-equal` ^3.1.3 - Object comparison

**Testing**:
- `vitest` ^4.0.16 - Test runner (already in repo)
- `@vitest/coverage-v8` ^4.0.16 - Coverage (already in repo)
- `msw` ^2.8.0 - API mocking for tests
- `nock` ^14.0.0-beta.15 - HTTP mocking alternative

### Package Dependency Graph

```
@dependabit/action
├── @dependabit/detector
│   ├── @azure/openai
│   ├── zod
│   └── @dependabit/manifest
├── @dependabit/plugins
│   ├── @dependabit/plugin-context7  # Context7 API access
│   ├── @dependabit/plugin-arxiv     # arXiv API access
│   ├── @dependabit/plugin-openapi   # OpenAPI spec fetching
│   ├── @dependabit/plugin-http      # Generic HTTP with hashing
│   └── @dependabit/plugin-github    # GitHub API file access
├── @dependabit/monitor
│   ├── @dependabit/github-client
│   ├── @dependabit/plugins  # Plugin registry
│   └── @dependabit/manifest
├── @dependabit/github-client
│   ├── @actions/github
│   └── @octokit/rest
└── @dependabit/manifest
    ├── zod
    └── yaml
```

## Open Research Questions

### 1. LLM Provider Specifics

**Question**: What is the exact API for GitHub Copilot in Actions context?

**Research Needed**:
- GitHub Copilot API documentation for Actions
- Authentication flow (automatic vs manual token)
- Rate limits and quota management
- Model selection options

**Fallback Plan**: If Copilot integration unclear, use Azure OpenAI with documented endpoints

### 2. Dependabot Config Compatibility

**Question**: How closely should we match dependabot.yml schema?

**Research Needed**:
- Review dependabot.yml full schema specification
- Identify reusable fields (schedule, directories, labels)
- Determine custom extensions needed

**Decision Needed**: Balance familiarity vs specific needs (e.g., auth config, severity rules)

### 3. Content Hashing for Large Documents

**Question**: What hashing strategy for multi-MB documentation sites?

**Research Needed**:
- Performance of full content hash vs selective (headers, sections)
- Handling dynamic content (timestamps, ads, analytics)
- Normalization strategies (whitespace, formatting)

**Fallback Plan**: Use HTTP ETag/Last-Modified headers if available

## Best Practices Identified

### GitHub Actions Patterns

- Use `@actions/core.group()` for log organization
- Set action outputs for workflow chaining
- Use `@actions/core.setFailed()` for error states
- Include action branding in action.yml

### TypeScript Action Development

- Compile to single bundled file with ncc
- Include source maps for debugging
- Use strict TypeScript config
- Export types for downstream consumers

### Monorepo Management

- Each package has independent versioning
- Shared tsconfig.base.json for consistency
- Workspace protocol for inter-package deps
- Build order managed by pnpm workspace

### Security Best Practices

- Never log secret values
- Validate all external inputs
- Use least-privilege GitHub token scopes
- Pin action versions in workflows

## Next Steps (Phase 1)

1. **Data Model Design** (`data-model.md`)
   - Define manifest schema with Zod
   - Design config.yml structure
   - Specify change detection record format

2. **API Contracts** (`contracts/`)
   - Document manifest JSON schema
   - Define config YAML schema
   - Specify GitHub issue templates

3. **Quickstart Guide** (`quickstart.md`)
   - Installation instructions
   - Basic usage examples
   - Configuration reference

4. **Update Agent Context**
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
   - Add TypeScript Actions, LLM integration patterns
   - Document package architecture

**Completion Criteria**: All technology decisions documented, no "NEEDS CLARIFICATION" remaining, dependencies identified with versions, best practices captured.
