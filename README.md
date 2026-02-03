# dependabit

> AI-powered dependency tracking for external resources, projects, and knowledge

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pradeepmouli/dependabit/ci.yml)](https://github.com/pradeepmouli/dependabit/actions)

## About

Dependabit extends dependency tracking beyond traditional package managers. While tools like Dependabot monitor your npm packages, Dependabit uses AI to discover and track external resources your project depends on—GitHub repositories, documentation sites, API references, and more—that live outside your package.json.

When upstream changes occur (new releases, breaking changes, deprecations, documentation updates), Dependabit automatically creates GitHub issues and can assign them to AI agents for review and action.

## Features

- **🤖 AI-Powered Discovery** - Uses LLMs (GitHub Copilot, Claude, etc.) to analyze your codebase and discover external dependencies referenced in READMEs, docs, code comments, and configuration files
- **📋 Automatic Manifest Generation** - Creates and maintains a structured manifest of all external dependencies at `.dependabit/manifest.json`
- **🔄 Continuous Monitoring** - Periodically checks tracked resources for changes using multiple detection strategies (GitHub Releases API, content hashing, semantic versioning)
- **📬 Smart Notifications** - Opens GitHub issues when changes are detected, with configurable severity levels (breaking/major/minor) and optional AI agent assignment
- **🔌 Plugin Architecture** - Extensible plugin system for different resource types (GitHub, ArXiv, OpenAPI, HTTP endpoints, Context7)
- **⚙️ Flexible Configuration** - Dependabot-style configuration for check frequency, monitoring rules, and authentication

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

## Quick Start

1. **Generate a manifest** - Run the discovery action on your repository:
   ```bash
   pnpm run generate-manifest
   ```

2. **Review the manifest** - Check `.dependabit/manifest.json` for discovered dependencies

3. **Configure monitoring** - Set up check frequency and rules in `.dependabit/config.yml`

4. **Enable change detection** - The GitHub Action will periodically check for updates and create issues

See [docs/EXAMPLES.md](docs/EXAMPLES.md) for detailed usage examples.

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

- [x] Core dependency tracking infrastructure
- [x] Plugin system architecture
- [x] GitHub, ArXiv, OpenAPI, and HTTP plugins
- [ ] GitHub Action workflow templates
- [ ] Automatic manifest generation on push
- [ ] Scheduled change detection and issue creation
- [ ] AI agent assignment integration
- [ ] Web UI for manifest visualization and management
- [ ] Additional plugins (npm, PyPI, Docker, etc.)

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
