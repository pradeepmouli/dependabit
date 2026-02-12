# @dependabit/action

GitHub Action entry points for AI-powered dependency tracking.

## Overview

This package provides the main entry points for the dependabit GitHub Actions, orchestrating all other packages to provide a complete dependency tracking solution using LLM-powered detection.

## Features

- **Generate action**: Create initial manifest from codebase analysis
- **Update action**: Automatically update manifest on push
- **Check action**: Monitor dependencies for changes and create issues
- **Validate action**: Validate manifest files and configuration
- **Authentication**: Multiple auth methods (token, OAuth, basic)
- **Secret Management**: Secure resolution from GitHub Secrets
- **Performance Tracking**: Operation duration metrics and API quota monitoring
- **Error Handling**: Categorized errors with remediation steps
- **Manifest Size Checks**: Automatic warnings for large manifests

## Installation

This package is distributed as part of the dependabit GitHub Action. See the main repository README for usage instructions.

## Actions

### Generate

Analyzes repository using LLM and generates `.dependabit/manifest.json` with detected dependencies.

**Inputs:**
- `github-token`: GitHub token for API access (required)
- `llm-provider`: LLM provider (default: copilot)
- `config-path`: Path to config file (default: .dependabit/config.yml)

**Outputs:**
- `manifest-path`: Path to generated manifest
- `dependencies-count`: Number of dependencies detected

**Example:**
```yaml
- uses: ./.github/actions/dependabit
  with:
    action: generate
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Update

Automatically updates manifest when code changes are pushed.

**Triggers:**
- Push to main/master branch
- Pull request changes
- Manual workflow dispatch

**Example:**
```yaml
on:
  push:
    branches: [main]

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/dependabit
        with:
          action: update
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Check

Periodically checks dependencies for changes and creates issues for updates.

**Schedule:** Configurable in `.dependabit/config.yml` (default: daily)

**Features:**
- Release monitoring
- Breaking change detection
- Automatic issue creation
- False positive tracking

**Example:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  check-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/dependabit
        with:
          action: check
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Validate

Validates manifest file structure and content.

**Checks:**
- Schema validation
- Size limits
- Required fields
- Configuration syntax

**Example:**
```yaml
- uses: ./.github/actions/dependabit
  with:
    action: validate
    manifest-path: .dependabit/manifest.json
```

## Authentication

Supports multiple authentication methods:

### Token Authentication (Recommended)
```yaml
- uses: ./.github/actions/dependabit
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Per-Dependency Authentication
Configure in `.dependabit/config.yml`:
```yaml
auth:
  api.example.com:
    secret: API_KEY
  registry.example.com:
    secret: REGISTRY_TOKEN
```

For npm publishing, use npm Trusted Publishers (OIDC) in GitHub Actions; no npm token is required.

## Configuration

Create `.dependabit/config.yml`:

```yaml
version: "1.0"
schedule: "0 0 * * *"  # Daily checks
llm:
  provider: copilot
  model: gpt-4
monitor:
  check_interval: 24h
  severity_threshold: minor
issues:
  labels:
    - dependency-update
    - bot
  assignees:
    - maintainer-username
```

## Performance Metrics

The action tracks performance metrics:

- Operation durations
- API quota usage
- Rate limit status
- Error rates

View metrics in action logs or enable detailed reporting:

```yaml
- uses: ./.github/actions/dependabit
  with:
    action: check
    enable-metrics: true
```

## Error Handling

Errors are categorized with remediation steps:

- **Authentication**: Token validation, permissions
- **Rate Limit**: API quota management
- **Network**: Connectivity issues
- **Validation**: Data format errors
- **Configuration**: Setup problems

## Manifest Size Management

Automatic warnings for large manifests:

- **Warning**: >1MB
- **Error**: >10MB

Recommendations provided for size reduction.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check
```

## Related Packages

- `@dependabit/detector`: LLM-based dependency detection
- `@dependabit/manifest`: Manifest schema and operations
- `@dependabit/monitor`: Change detection and monitoring
- `@dependabit/github-client`: GitHub API interactions

## License

MIT
