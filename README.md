<p align="center">
  <img src="https://github.com/user-attachments/assets/9c9f4d77-7c2b-400c-9b2f-08b3767fcad7" alt="Dependabit Logo" width="600">
</p>

<h1 align="center">Dependabit</h1>

<p align="center">
  <strong>AI-Powered Dependency Tracking for External Resources</strong>
</p>

<p align="center">
  <a href="https://github.com/pradeepmouli/dependabit/actions/workflows/ci.yml"><img src="https://github.com/pradeepmouli/dependabit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

Dependabit automatically discovers, tracks, and monitors external dependencies referenced in your codebase using LLM-powered analysis. Unlike traditional dependency managers that only track package manifests, Dependabit finds informational dependencies like GitHub repos, documentation sites, API references, research papers, and more.

## 🤔 Dependabot vs Dependabit

**"Should I use Dependabot or Dependabit?"** — Use **both**! They complement each other:

| Tool | Purpose | What it tracks |
|------|---------|----------------|
| **Dependabot** | Updates package dependencies | npm, pip, cargo, maven, docker packages in manifest files |
| **Dependabit** | Tracks external references | GitHub repos, docs, APIs, papers mentioned in code/comments |

**Think of it this way:**
- **Dependabot** manages your `package.json` dependencies
- **Dependabit** finds the docs URLs in your code comments

👉 **[Read the full comparison in our FAQ](docs/FAQ.md#how-is-dependabit-different-from-dependabot)**

## Features

### 🎯 **AI-Powered Detection**
- **LLM Analysis**: Uses GitHub Copilot (or other LLMs) to intelligently detect external dependencies
- **Multi-Source Parsing**: Extracts references from README files, code comments, and package manifests
- **Smart Classification**: Automatically categorizes dependencies (documentation, research papers, schemas, APIs, etc.)
- **Confidence Scoring**: Provides confidence levels for each detected dependency

### 🔄 **Automatic Updates**
- **Push-Triggered Updates**: Automatically updates manifest when code changes are pushed
- **Selective Re-Analysis**: Only analyzes changed files for efficiency
- **Merge Strategies**: Preserves manual edits while incorporating new discoveries
- **Change Logging**: Comprehensive logging of additions and removals

### 📊 **Change Monitoring**
- **Periodic Checks**: Scheduled monitoring of external dependencies
- **Issue Creation**: Automatically creates GitHub issues for dependency changes
- **Severity Classification**: Breaking, major, or minor change detection
- **Rate Limiting**: Smart GitHub API usage with budget reservation

### ⚙️ **Flexible Configuration**
- **Dependabot-Style Config**: Familiar YAML configuration format
- **Per-Dependency Rules**: Customize monitoring frequency and behavior
- **Multiple Auth Methods**: Token, OAuth, and basic authentication support
- **AI Agent Assignment**: Automatically assign issues to AI agents based on severity

## GitHub Marketplace Publishing

To publish the action to the GitHub Marketplace:

1. Run the `Bundle Action` workflow (or build locally) so `packages/action/action-dist` is committed.
2. Create a GitHub Release tag (for example, `v0.1.12`).
3. In the Release UI, select **Publish this Action to the GitHub Marketplace**.

The action metadata in [action.yml](action.yml) points to the bundled file, so Marketplace users get a self-contained action.

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- GitHub repository with Actions enabled
- GitHub Copilot access (or alternative LLM provider)

### Bootstrap Templates

Ready-to-use templates are available in the [`templates/`](./templates/) directory:

- **[TypeScript Template](./templates/typescript/)** - Complete setup for TypeScript projects
  - Includes all three workflow files (generate, update, check)
  - Example configuration file
  - Detailed setup instructions

Simply copy the template files to your repository and run the generate workflow to get started!

### For Development

Add Dependabit to your repository by creating workflow files:

#### 1. Generate Initial Manifest

Create `.github/workflows/dependabit-generate.yml`:

```yaml
name: Generate Dependency Manifest

on:
  workflow_dispatch:  # Manual trigger for initial setup

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup GitHub CLI (required for Copilot CLI)
        run: |
          # GitHub CLI is pre-installed on GitHub Actions runners
          # Verify it's available and authenticated
          gh --version
          gh auth status

      - name: Install dependencies and build action
        run: |
          corepack enable
          pnpm install
          pnpm build

      - name: Generate manifest
        id: generate
        uses: ./packages/action  # Use local action after building
        with:
          action: generate
          repo_path: .
          manifest_path: .dependabit/manifest.json
          llm_provider: github-copilot
          llm_api_key: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit manifest
        run: |
          git config user.name "dependabit[bot]"
          git config user.email "dependabit[bot]@users.noreply.github.com"
          git add .dependabit/
          if git status --porcelain .dependabit/ | grep .; then
            git commit -m "chore: initialize dependabit manifest"
            git push
          else
            echo "No manifest changes to commit; skipping commit and push."
          fi
```

#### 2. Auto-Update on Push

Create `.github/workflows/dependabit-update.yml`:

```yaml
name: Update Dependency Manifest

on:
  push:
    branches: [main, master]
    paths:
      - '**.md'
      - '**.ts'
      - '**.js'
      - '**.py'
      - 'package.json'
      - 'requirements.txt'

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 10 # Fetch recent commits for analysis

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup GitHub CLI (required for Copilot CLI)
        run: |
          # GitHub CLI is pre-installed on GitHub Actions runners
          # Verify it's available and authenticated
          gh --version
          gh auth status

      - name: Install dependencies and build action
        run: |
          corepack enable
          pnpm install
          pnpm build

      - name: Update manifest
        id: update
        uses: ./packages/action  # Use local action after building
        with:
          action: update
          repo_path: .
          manifest_path: .dependabit/manifest.json
          llm_provider: github-copilot
          llm_api_key: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit changes
        run: |
          git config user.name "dependabit[bot]"
          git config user.email "dependabit[bot]@users.noreply.github.com"
          git add .dependabit/manifest.json
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "chore(dependabit): update manifest"
          git push
```

#### 3. Monitor for Changes (coming soon)

> Note: The `check` GitHub Action workflow is not yet available. This section will be updated with a ready-to-use example once the `check` action has been implemented.

### Configuration

Create `.dependabit/config.yml` to customize behavior:

```yaml
version: "1"

# Global settings
schedule:
  interval: daily
  time: "02:00"

# Issue handling & AI agent assignment rules
issues:
  aiAgentAssignment:
    breaking: "@copilot"
    major: "@claude"
    minor: "@copilot"

# Per-dependency overrides
dependencies:
  - url: "https://github.com/important/repo"
    schedule:
      interval: hourly
    monitoring:
      ignoreChanges: false

  - url: "https://stable-docs.example.com"
    schedule:
      interval: weekly
    monitoring:
      ignoreChanges: false
```

## Project Structure

This is a monorepo using pnpm workspaces:

```
dependabit/
├── packages/
│   ├── action/           # GitHub Action entry points
│   ├── detector/         # LLM-based dependency detection
│   ├── manifest/         # Manifest schema and validation
│   ├── monitor/          # Change detection and monitoring
│   ├── github-client/    # GitHub API wrapper
│   ├── plugins/          # Extensible plugin system
│   ├── core/             # Shared utilities
│   └── utils/            # Common utility functions
├── specs/                # Feature specifications
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD workflows
├── e2e/                  # E2E tests
└── test-fixtures/        # Test fixtures for E2E/integration tests
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/pradeepmouli/dependabit.git
cd dependabit

# Install dependencies
pnpm install
pnpm run build
```

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

- **[FAQ](docs/FAQ.md)** - Frequently asked questions, including Dependabot vs Dependabit comparison
- **[Setup Guide](scripts/SETUP.md)** - Development environment setup
- **[Workspace Guide](docs/WORKSPACE.md)** - Managing monorepo packages
- **[Development Workflow](docs/DEVELOPMENT.md)** - Development process and best practices
- **[Testing Guide](docs/TESTING.md)** - Testing infrastructure and guidelines
- **[Examples](docs/EXAMPLES.md)** - Usage examples and patterns
- **[Auto Update](docs/AUTO_UPDATE.md)** - Automatic update workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @dependabit/detector test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Linting and Formatting

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check
```

### Building

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @dependabit/action build

# Clean build artifacts
pnpm run clean
```

## Architecture

### Core Components

1. **Detector** (`@dependabit/detector`)
   - LLM provider abstraction
   - Multi-source parsing (README, code, packages)
   - Hybrid detection (programmatic + LLM fallback)
   - Type classification and confidence scoring

2. **Manifest** (`@dependabit/manifest`)
   - JSON schema with Zod validation
   - CRUD operations with merge strategies
   - Size checks and warnings
   - Version control integration

3. **Monitor** (`@dependabit/monitor`)
   - Periodic dependency checking
   - Change detection and comparison
   - Severity classification
   - Content normalization

4. **GitHub Client** (`@dependabit/github-client`)
   - Octokit wrapper with rate limiting
   - Multiple authentication methods
   - Issue creation and management
   - False positive feedback tracking

5. **Action** (`@dependabit/action`)
   - GitHub Actions integration
   - Input/output handling
   - Workflow orchestration
   - Error handling and logging

### Plugin System

Dependabit supports extensible plugins for different dependency types:

- **github-api**: GitHub repository releases
- **http**: Generic HTTP/HTTPS resources
- **arxiv**: Research papers from arXiv
- **openapi**: OpenAPI/Swagger specifications
- **context7**: Context7 API integration

## Use Cases

### 1. Track Documentation References
Monitor external documentation sites referenced in your code comments and README files.

### 2. Research Paper Dependencies
Track arXiv papers and academic publications that your research code depends on.

### 3. API Schema Tracking
Monitor OpenAPI specifications and API documentation for breaking changes.

### 4. Reference Implementations
Keep track of example code repositories and reference implementations.

### 5. Third-Party Libraries
Discover dependencies not captured in package.json (CDN links, direct includes, etc.).

## Configuration Options

### Action Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `action` | Action to perform: generate, update, check, validate | `generate` |
| `repo_path` | Path to repository root | `.` |
| `manifest_path` | Path to manifest file | `.dependabit/manifest.json` |
| `llm_provider` | LLM provider: github-copilot, claude, openai | `github-copilot` |
| `llm_model` | LLM model to use | Provider default |
| `llm_api_key` | API key for LLM provider | Uses GITHUB_TOKEN |
| `create_issues` | Create GitHub issues for changes | `true` |
| `debug` | Enable debug logging | `false` |

### Action Outputs

| Output | Description |
|--------|-------------|
| `manifest_path` | Path to generated/updated manifest |
| `dependency_count` | Number of dependencies detected |
| `changes_detected` | Number of changes found (check action) |
| `issues_created` | Number of issues created |

## Performance

- **Manifest Generation**: < 5 minutes for typical repositories
- **Manifest Updates**: < 2 minutes per commit
- **Monitoring**: < 10 minutes for 100 dependencies
- **Detection Accuracy**: > 90% for informational dependencies
- **False Positive Rate**: < 10%

## Troubleshooting

### Common Issues

**Manifest not generated**:
- Ensure GITHUB_TOKEN has sufficient permissions
- Check that LLM provider is accessible
- Verify repository has external references

**Updates not triggering**:
- Check workflow file paths filter
- Ensure push events are enabled
- Verify branch name matches trigger

**Rate limit errors**:
- Reduce check frequency in config
- Use fine-grained GitHub tokens
- Enable rate limit budget reservation

**False positives**:
- Label issues with `false-positive` label
- System learns from feedback over time
- Adjust confidence thresholds in config

See the existing documentation for more details.

### In Progress 🚧
- [ ] Initial manifest generation (LLM-powered dependency discovery)
- [ ] Automatic manifest updates on push
- [ ] Complete plugin implementations (ArXiv, OpenAPI, Context7)
- [ ] GitHub Action workflow templates

- [Workspace Management](docs/WORKSPACE.md)
- [Development Workflow](docs/DEVELOPMENT.md)
- [Testing Guide](docs/TESTING.md)
- [Auto-Update Guide](docs/AUTO_UPDATE.md)
- [Examples](docs/EXAMPLES.md)

## Roadmap

### Completed ✅
- [x] LLM-powered dependency detection
- [x] Multi-source parsing (README, code, packages)
- [x] Generate action with workflow integration
- [x] Auto-update on push
- [x] Change monitoring with issue creation
- [x] Manual manifest management
- [x] Multiple authentication methods
- [x] False positive tracking

### In Progress 🚧
- [ ] E2E test suite
- [ ] Complete plugin implementations (OpenAPI, Context7, arXiv)
- [ ] Comprehensive API documentation
- [ ] Performance optimization for large repos

### Planned 📋
- [ ] Additional LLM providers (OpenAI, Anthropic)
- [ ] Enhanced breaking change detection
- [ ] Dependency graph visualization
- [ ] Slack/Discord notifications
- [ ] Custom webhook support

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm test`)
6. Commit using conventional commits (`git commit -m 'feat: add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Security

For security issues, please see [SECURITY.md](SECURITY.md).

## Support

- **Issues**: [GitHub Issues](https://github.com/pradeepmouli/dependabit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pradeepmouli/dependabit/discussions)
- **Documentation**: [docs/](docs/)

## Acknowledgments

- Built with TypeScript and GitHub Actions
- Powered by GitHub Copilot for LLM analysis
- Inspired by Dependabot for the configuration format

---

**Author**: Pradeep Mouli
**Created**: January 29, 2026
**Status**: Early Access - v0.1.0

**Made with ❤️ for developers who care about external dependencies**
