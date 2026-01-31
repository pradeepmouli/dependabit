# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-01

### Added

#### Core Features - Phase 7: Polish & Production Readiness
- **Multiple Authentication Methods**: Token (GitHub PAT, fine-grained), OAuth 2.0, and Basic authentication support
- **Secret Management**: Secure resolution of secrets from GitHub Actions environment
- **Per-Dependency Authentication**: Configure different credentials for different dependency sources
- **False Positive Feedback System**: Monitors issue labels for user feedback on detections
- **Metrics Tracking**: 30-day rolling window false positive rate calculation with trend analysis
- **Error Categorization**: Actionable error messages with remediation steps for common failures
- **Performance Tracking**: Operation duration metrics and API quota monitoring
- **Enhanced Rate Limiting**: Proactive rate limit checking with budget reservation
- **Manifest Size Checks**: Automatic warnings for manifests approaching size limits (>1MB warn, >10MB error)

#### Previous Phases (1-6)
- **AI-Powered Dependency Detection**: LLM-based detection of external dependencies in codebases
- **Manifest Generation**: Automatic creation of `.dependabit/manifest.json` with dependency metadata
- **Dependency Monitoring**: Periodic checks for dependency updates and changes
- **Automated Issue Creation**: Creates GitHub issues for dependency updates with severity classification
- **Plugin System**: Extensible architecture for custom dependency sources (Context7, arXiv, OpenAPI, HTTP, GitHub)

### Infrastructure Setup
- Initial project setup with TypeScript 5.9+
- pnpm workspace monorepo structure
- Changesets for version management
- GitHub Actions CI/CD workflows
- Pre-commit hooks with simple-git-hooks
- Dependabot configuration
- Code quality tools (oxlint, oxfmt)
- Testing setup with Vitest (80%+ coverage target)
- AI agent instructions (AGENTS.md)
- MCP server configuration

### Documentation
- Comprehensive package READMEs with usage examples
- JSDoc comments for all public APIs
- Configuration guide for `.dependabit/config.yml`
- Authentication setup instructions
- Architecture documentation
- Troubleshooting guide
- CHANGELOG for v1.0.0 release

### Technical Specifications

#### Performance Targets
- Manifest generation: <5 minutes
- Manifest updates: <2 minutes
- Monitoring 100 dependencies: <10 minutes
- False positive rate: <10%
- Detection accuracy: >90%

#### Key Components
- `@dependabit/action`: GitHub Action entry points (generate, update, check, validate)
- `@dependabit/detector`: LLM-based dependency detection
- `@dependabit/manifest`: Manifest schema, validation, and CRUD operations with size checking
- `@dependabit/monitor`: Change detection and comparison logic
- `@dependabit/github-client`: GitHub API wrapper with rate limiting, auth, and feedback collection
- `@dependabit/plugins/*`: Plugin system and built-in plugins
- `@dependabit/core`: Shared utilities and types
- `@dependabit/utils`: Common utility functions
- `@dependabit/test-utils`: Testing helpers

#### Supported Features
- Multiple dependency types (GitHub repos, NPM packages, research papers, APIs, documentation)
- Scheduled monitoring with configurable intervals
- Severity classification (breaking, major, minor)
- Breaking change detection
- Release comparison
- Commit history tracking

### Changed
- Enhanced rate limit handler with proactive budget reservation
- Improved error messages with categorization and remediation steps
- Updated manifest package with size validation utilities

### Security
- Secure secret resolution from GitHub Actions
- Token validation and rotation support
- Per-dependency authentication configuration
- No secrets logged or exposed in error messages

### Known Limitations
- GitHub Copilot CLI required for LLM detection
- GitHub Actions environment required for secrets resolution  
- Rate limits apply based on GitHub token type
- Large codebases (>1000 files) may require increased timeout

### Future Enhancements
- Additional LLM providers (OpenAI, Anthropic, local models)
- Enhanced breaking change detection algorithms
- Dependency vulnerability scanning integration
- Custom notification channels (Slack, email)
- Batch operation support
- Caching for repeated operations

## [0.1.0] - 2025-12-19

### Added
- Initial release
- TypeScript project template
- Basic project structure

[Unreleased]: https://github.com/pradeepmouli/dependabit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/pradeepmouli/dependabit/releases/tag/v1.0.0
[0.1.0]: https://github.com/pradeepmouli/dependabit/releases/tag/v0.1.0
