# dependabit

> AI-powered dependency tracking for external resources, projects, and knowledge

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pradeepmouli/dependabit/ci.yml)](https://github.com/pradeepmouli/dependabit/actions)

## About

Dependabit extends dependency tracking beyond traditional package managers. While tools like Dependabot monitor your npm packages, Dependabit uses AI to discover and track external resources your project depends on—GitHub repositories, documentation sites, API references, and more—that live outside your package.json.

When upstream changes occur (new releases, breaking changes, deprecations, documentation updates), Dependabit automatically creates GitHub issues and can assign them to AI agents for review and action.

## Features

### Core Infrastructure ✓
- **📋 Manifest Schema & Validation** - Structured manifest format at `.dependabit/manifest.json` with comprehensive validation
- **🔄 Change Detection System** - Monitors tracked resources using GitHub Releases API, content hashing, and semantic versioning
- **📬 Smart Notifications** - Creates GitHub issues when changes are detected, with configurable severity levels (breaking/major/minor)
- **🤖 AI Agent Assignment** - Routes issues to AI agents (Copilot, Claude, etc.) based on configurable severity rules
- **🔌 Plugin Architecture** - Extensible plugin system for different resource types
- **🔐 Authentication Support** - Multiple auth methods (GitHub token, OAuth, basic auth) via secrets
- **⚙️ Flexible Configuration** - Dependabot-style configuration for check frequency, monitoring rules, and custom schedules

### In Development 🚧
- **AI-Powered Discovery** - LLM-based analysis to discover external dependencies in code, docs, and comments
- **Automatic Manifest Updates** - Auto-update manifest on push to detect added/removed dependencies
- **Complete Plugin Suite** - Full implementations for ArXiv, OpenAPI, Context7, and HTTP endpoints

## Installation

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### For Development

```bash
# Clone the repository
git clone https://github.com/pradeepmouli/dependabit.git
cd dependabit

# Install dependencies
pnpm install

# Build all packages
pnpm run build
```

### As a GitHub Action

*(Coming soon - workflow templates in development)*

## Current Status

Dependabit is under active development. The core monitoring and notification infrastructure is complete, including:
- Manifest schema and validation
- Change detection for GitHub releases and web content
- Issue creation with severity classification
- AI agent assignment routing
- Configurable monitoring schedules

**What's working now:** If you manually create a manifest at `.dependabit/manifest.json`, the monitoring system can detect changes and create issues.

**In development:** Automatic manifest generation using LLM analysis of your codebase.

See [specs/001-ai-dependency-tracker/](specs/001-ai-dependency-tracker/) for the full feature specification and [tasks.md](specs/001-ai-dependency-tracker/tasks.md) for implementation progress.

## Project Structure

Dependabit is organized as a TypeScript monorepo using pnpm workspaces:

```
dependabit/
├── packages/
│   ├── core/              # Core dependency tracking logic
│   ├── manifest/          # Manifest schema and validation
│   ├── github-client/     # GitHub API client
│   ├── plugins/           # Resource-specific plugins
│   │   ├── plugin-github/     # GitHub releases and files
│   │   ├── plugin-arxiv/      # ArXiv papers
│   │   ├── plugin-openapi/    # OpenAPI specifications
│   │   ├── plugin-http/       # Generic HTTP resources
│   │   └── plugin-context7/   # Context7 integration
│   └── utils/             # Shared utilities
├── docs/                  # Documentation
├── specs/                 # Feature specifications
└── .github/workflows/     # GitHub Actions workflows
```

## Documentation

- **[Setup Guide](scripts/SETUP.md)** - Development environment setup
- **[Workspace Guide](docs/WORKSPACE.md)** - Managing monorepo packages
- **[Development Workflow](docs/DEVELOPMENT.md)** - Development process and best practices
- **[Testing Guide](docs/TESTING.md)** - Testing infrastructure and guidelines
- **[Examples](docs/EXAMPLES.md)** - Usage examples and patterns
- **[Auto Update](docs/AUTO_UPDATE.md)** - Automatic update workflow

## Development

```bash
# Start all packages in development mode
pnpm run dev

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Lint and format code
pnpm run lint
pnpm run format

# Type check all packages
pnpm run type-check
```

## Plugin Development

Dependabit's plugin architecture allows you to add support for new resource types. Each plugin implements a common interface for detecting and monitoring specific kinds of dependencies.

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for plugin development guidelines.

## Roadmap

### Completed ✓
- [x] Manifest schema and validation system
- [x] Change detection infrastructure (GitHub, URL content monitoring)
- [x] Issue creation and severity classification
- [x] AI agent assignment and routing
- [x] Authentication support (token, OAuth, basic)
- [x] Plugin architecture foundation
- [x] Monitoring scheduler with configurable frequency
- [x] False positive tracking and metrics
- [x] HTML content normalization for change detection

### In Progress 🚧
- [ ] Initial manifest generation (LLM-powered dependency discovery)
- [ ] Automatic manifest updates on push
- [ ] Complete plugin implementations (ArXiv, OpenAPI, Context7)
- [ ] GitHub Action workflow templates

### Planned 📋
- [ ] Web UI for manifest visualization and management
- [ ] Additional plugins (npm, PyPI, Docker, etc.)
- [ ] Enhanced LLM integration for dependency analysis
- [ ] Comprehensive E2E testing suite

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code style and conventions
- Development setup
- Testing requirements
- Pull request process

## Acknowledgments

- Inspired by [Dependabot](https://github.com/dependabot/dependabot-core) for package dependency automation
- Built with [pnpm workspaces](https://pnpm.io/workspaces) for efficient monorepo management
- Uses [Zod](https://github.com/colinhacks/zod) for schema validation
- Powered by LLMs for intelligent dependency discovery

## Security

For security issues, please see [SECURITY.md](SECURITY.md) for our responsible disclosure policy.

## License

Dependabit is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.

---

**Author**: Pradeep Mouli  
**Repository**: [github.com/pradeepmouli/dependabit](https://github.com/pradeepmouli/dependabit)  
**Created**: January 29, 2026
