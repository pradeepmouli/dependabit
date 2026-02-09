# Dependabit Bootstrap Template for TypeScript Projects

This template provides the necessary files to bootstrap Dependabit onto any TypeScript repository.

## What's Included

- **GitHub Actions Workflows**:
  - `dependabit-generate.yml` - Initial manifest generation workflow
  - `dependabit-update.yml` - Automatic manifest updates on push
  - `dependabit-check.yml` - Scheduled dependency monitoring
  
- **Configuration**:
  - `.dependabit/config.yml` - Example Dependabit configuration

## Quick Start

### 1. Copy Files to Your Repository

Copy the contents of this template to your TypeScript repository:

```bash
# Copy workflows
cp -r .github/workflows/* YOUR_REPO/.github/workflows/

# Copy configuration (optional, can be customized later)
mkdir -p YOUR_REPO/.dependabit
cp .dependabit/config.yml YOUR_REPO/.dependabit/
```

### 2. Commit and Push

```bash
cd YOUR_REPO
git add .github/workflows/dependabit-*.yml .dependabit/config.yml
git commit -m "chore: add dependabit workflows"
git push
```

### 3. Generate Initial Manifest

1. Go to your repository on GitHub
2. Navigate to **Actions** tab
3. Select **Dependabit - Generate Manifest** workflow
4. Click **Run workflow**
5. Wait for the workflow to complete

This will create `.dependabit/manifest.json` with all detected external dependencies.

### 4. Enable Auto-Updates

The `dependabit-update.yml` workflow will automatically:
- Run on every push to main/master branches
- Analyze changed files
- Update the manifest with new dependencies
- Commit changes back to the repository

### 5. Enable Monitoring (Optional)

The `dependabit-check.yml` workflow will:
- Run daily at 2 AM UTC (configurable via cron)
- Check all dependencies for changes
- Create GitHub issues for detected changes
- Classify changes by severity (breaking, major, minor)

## Customization

### Modify File Patterns

Edit `dependabit-update.yml` to customize which file changes trigger updates:

```yaml
on:
  push:
    branches:
      - main
      - master
    paths:
      - '**.md'
      - '**.ts'
      - '**.tsx'
      # Add more patterns as needed
```

### Configure Monitoring Schedule

Edit `.dependabit/config.yml` to customize monitoring behavior:

```yaml
version: "1"

schedule:
  interval: daily  # or hourly, weekly
  time: "02:00"    # UTC time

issues:
  aiAgentAssignment:
    breaking: "@copilot"
    major: "@claude"
    minor: "@copilot"

dependencies:
  # Per-dependency overrides
  - url: "https://github.com/important/repo"
    schedule:
      interval: hourly
    monitoring:
      ignoreChanges: false
```

### Change LLM Provider

By default, workflows use GitHub Copilot. To use a different provider:

1. Edit workflow files
2. Change `llm_provider` input to `claude` or `openai`
3. Update `llm_api_key` to use appropriate secret

## Prerequisites

- Node.js >= 20.0.0
- GitHub repository with Actions enabled
- GitHub Copilot access (or alternative LLM provider)
- Write permissions for GitHub Actions workflows

## How It Works

1. **Generate**: Scans your repository for external dependencies using LLM analysis
2. **Update**: Monitors code changes and updates the manifest automatically
3. **Check**: Periodically checks dependencies for changes and creates issues

## Manifest Location

The dependency manifest is stored at `.dependabit/manifest.json` in your repository.

## Troubleshooting

### Workflow Fails with "No manifest found"

Run the **Generate Manifest** workflow first to create the initial manifest.

### Dependencies Not Detected

Ensure your code contains clear references to external resources:
- GitHub repositories
- Documentation URLs
- API endpoints
- Research papers
- OpenAPI specs

### Rate Limit Errors

If you encounter rate limit errors:
- Reduce check frequency in config
- Use fine-grained GitHub tokens
- Enable rate limit budget reservation

## Learn More

- [Dependabit Repository](https://github.com/pradeepmouli/dependabit)
- [Documentation](https://github.com/pradeepmouli/dependabit/tree/main/docs)
- [Examples](https://github.com/pradeepmouli/dependabit/blob/main/docs/EXAMPLES.md)

## Support

For issues or questions:
- [GitHub Issues](https://github.com/pradeepmouli/dependabit/issues)
- [GitHub Discussions](https://github.com/pradeepmouli/dependabit/discussions)
