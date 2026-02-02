# dependabit

![Dependabit logo](docs/assets/dependabit-logo.svg)

Dependabit is a Dependabot-inspired toolkit for tracking external resources, related projects, and knowledge dependencies with AI-assisted detection and monitoring. It is built as a pnpm workspace with GitHub Actions entry points, core packages, and plugins for common sources.

## Table of Contents

- [What dependabit provides](#what-dependabit-provides)
- [Workspace packages](#workspace-packages)
- [Plugins](#plugins)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## What dependabit provides

- GitHub Actions to generate, update, check, and validate dependency manifests.
- LLM-assisted detection and structured manifests for external resources.
- Monitoring and change detection for releases, documentation, and APIs.
- Plugin integrations for GitHub, HTTP resources, OpenAPI specs, arXiv, and Context7.

## Workspace packages

- `@dependabit/action` - GitHub Action entry points for dependency tracking workflows.
- `@dependabit/detector` - LLM-based dependency detection.
- `@dependabit/manifest` - Manifest schema and validation.
- `@dependabit/monitor` - Change detection and monitoring logic.
- `@dependabit/github-client` - GitHub API wrapper with auth and rate limiting.
- `@company/core` - Shared core utilities.
- `@company/utils` - Shared string and array utilities.
- `@company/test-utils` - Shared Vitest helpers and fixtures.

## Plugins

- `@dependabit/plugin-github` - GitHub file, tag, and release tracking.
- `@dependabit/plugin-http` - HTTP resource tracking with content hashing.
- `@dependabit/plugin-openapi` - OpenAPI spec fetching and diffing.
- `@dependabit/plugin-arxiv` - arXiv paper tracking.
- `@dependabit/plugin-context7` - Context7 API tracking.

## Getting started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Install

```bash
git clone https://github.com/pradeepmouli/dependabit.git
cd dependabit
pnpm install
```

### Develop

```bash
pnpm run dev
```

## Scripts

```bash
pnpm run lint
pnpm run format
pnpm test
```

## Documentation

- [Workspace Guide](docs/WORKSPACE.md) - Managing packages
- [Development Workflow](docs/DEVELOPMENT.md) - Development process
- [Testing Guide](docs/TESTING.md) - Testing setup
- [Examples](docs/EXAMPLES.md) - Usage examples

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.
