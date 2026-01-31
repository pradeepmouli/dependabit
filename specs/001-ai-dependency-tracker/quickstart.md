# Quickstart Guide: AI-Powered Dependency Tracking

**Feature**: 001-ai-dependency-tracker
**Audience**: Repository maintainers setting up dependabit
**Time to Setup**: ~5 minutes

## Overview

Dependabit automatically tracks external dependencies (GitHub repos, docs, APIs) mentioned in your codebase and notifies you when they change. It uses AI to discover dependencies and monitors them on a schedule you control.

## Prerequisites

- GitHub repository with Actions enabled
- GitHub Copilot access (or alternative LLM provider configured)
- Permissions to create workflows and issues

## Quick Setup (3 Steps)

### 1. Add Dependabit Workflows

Create three workflow files in `.github/workflows/`:

**.github/workflows/dependabit-generate.yml** (Initial setup, run once)
```yaml
name: Generate Dependency Manifest

on:
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate manifest
        uses: pradeepmouli/dependabit@v1
        with:
          action: generate
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-provider: github-copilot

      - name: Commit manifest
        run: |
          git config user.name "dependabit[bot]"
          git config user.email "dependabit[bot]@users.noreply.github.com"
          git add .dependabit/
          git commit -m "chore: initialize dependabit manifest"
          git push
```

**.github/workflows/dependabit-update.yml** (Auto-update on push)
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

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update manifest
        uses: pradeepmouli/dependabit@v1
        with:
          action: update
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit changes
        run: |
          git config user.name "dependabit[bot]"
          git config user.email "dependabit[bot]@users.noreply.github.com"
          git add .dependabit/manifest.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore(dependabit): update manifest"
          git push
```

**.github/workflows/dependabit-check.yml** (Scheduled monitoring)
```yaml
name: Check Dependencies

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for changes
        uses: pradeepmouli/dependabit@v1
        with:
          action: check
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Configure Dependabit (Optional)

Create `.dependabit/config.yml` to customize behavior:

```yaml
version: "1"

schedule:
  interval: daily
  time: "02:00"
  timezone: UTC

issues:
  labels:
    - dependabit
    - dependencies
  aiAgentAssignment:
    enabled: true
    breaking: copilot
    major: copilot

monitoring:
  enabled: true
  autoUpdate: true

dependencies:
  # Override specific dependencies
  - url: "https://github.com/microsoft/TypeScript"
    schedule:
      interval: hourly  # Check more frequently
```

### 3. Run Initial Generation

1. Go to **Actions** tab in your repository
2. Select "Generate Dependency Manifest" workflow
3. Click **Run workflow**
4. Wait ~2-5 minutes for completion
5. Check `.dependabit/manifest.json` in your repo

**Done!** Dependabit will now automatically:
- ✅ Update manifest when you push changes
- ✅ Check for dependency changes daily
- ✅ Create issues when changes detected

## What Gets Tracked?

Dependabit discovers dependencies from:

- **README files**: Links to docs, repos, tools
- **Documentation**: References in `/docs` folder
- **Code comments**: URLs in `//` or `#` comments
- **Package files**: `package.json`, `requirements.txt`, etc.
- **Configuration**: GitHub Actions workflows, CI configs

### Supported Dependency Types

| Type | Example | Detection Method |
|------|---------|------------------|
| GitHub Repos | `https://github.com/microsoft/TypeScript` | Package files + LLM |
| NPM Packages | `https://npmjs.com/package/vitest` | package.json |
| Documentation | `https://vitest.dev/guide/` | LLM analysis |
| APIs | `https://api.github.com/` | Code + LLM |
| Blog Posts | Tutorial links in comments | LLM analysis |

## Configuration Options

### Schedule

```yaml
schedule:
  interval: daily | weekly | monthly | hourly
  day: monday  # For weekly
  time: "02:00"  # HH:MM, 24-hour format
  timezone: America/Los_Angeles
```

### LLM Provider

```yaml
llm:
  provider: github-copilot | claude | openai
  model: gpt-4  # Optional
  maxTokens: 4000
  temperature: 0.3  # Lower = more deterministic
```

### Issue Configuration

```yaml
issues:
  labels:
    - dependabit
    - your-custom-label
  assignees:
    - username
  aiAgentAssignment:
    enabled: true
    breaking: copilot  # Assign breaking changes to Copilot
    major: claude       # Assign major changes to Claude
    minor: copilot
```

### Per-Dependency Overrides

```yaml
dependencies:
  - url: "https://github.com/critical/repo"
    schedule:
      interval: hourly  # Check more often
    monitoring:
      ignoreChanges: false
    issues:
      labels:
        - critical
      assignees:
        - oncall-engineer
```

### Ignoring Dependencies

```yaml
ignore:
  urls:
    - "https://deprecated-site.com"
  types:
    - blog-post  # Don't track blog posts
  patterns:
    - ".*\\.example\\.com.*"  # Regex patterns
```

## Authentication for Private Resources

If you need to access private GitHub repos or APIs:

### 1. Create GitHub Secret

Go to **Settings → Secrets → Actions**, create secret:
- Name: `PRIVATE_REPO_TOKEN`
- Value: Your personal access token or API key

### 2. Configure in `.dependabit/config.yml`

```yaml
dependencies:
  - url: "https://github.com/private-org/private-repo"
    auth:
      type: token
      secret: PRIVATE_REPO_TOKEN  # References the GitHub Secret
```

### 3. Pass Secret to Action

Update workflow:

```yaml
- name: Check for changes
  uses: pradeepmouli/dependabit@v1
  with:
    action: check
    github-token: ${{ secrets.GITHUB_TOKEN }}
  env:
    PRIVATE_REPO_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
```

## Manual Manifest Management

Dependabit supports manual editing of the manifest file for cases where automatic detection fails or you need custom monitoring rules.

### Adding Dependencies Manually

Edit `.dependabit/manifest.json` to add entries:

```json
{
  "dependencies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://example.com/custom-api",
      "type": "documentation",
      "accessMethod": "http",
      "name": "Custom API Documentation",
      "description": "Internal API reference",
      "currentStateHash": "",
      "detectionMethod": "manual",
      "detectionConfidence": 1.0,
      "detectedAt": "2026-01-31T00:00:00Z",
      "lastChecked": "2026-01-31T00:00:00Z",
      "referencedIn": [
        {
          "file": "README.md",
          "line": 42,
          "context": "See API docs"
        }
      ],
      "changeHistory": [],
      "monitoring": {
        "enabled": true,
        "checkFrequency": "weekly",
        "ignoreChanges": false
      }
    }
  ]
}
```

### Validating the Manifest

After manual edits, validate your manifest to catch errors:

#### Option 1: Add Validation Workflow

Create `.github/workflows/dependabit-validate.yml`:

```yaml
name: Validate Dependabit Manifest

on:
  pull_request:
    paths:
      - '.dependabit/**'
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate manifest
        uses: pradeepmouli/dependabit@v1
        with:
          action: validate
          manifest-path: .dependabit/manifest.json
          config-path: .dependabit/config.yml
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### Option 2: Add to Existing Workflows

Add validation step to update/check workflows:

```yaml
- name: Validate before processing
  uses: pradeepmouli/dependabit@v1
  with:
    action: validate
    manifest-path: .dependabit/manifest.json
    config-path: .dependabit/config.yml
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Validation Checks

The validation action performs comprehensive checks:

**Schema Validation**
- ✅ Manifest version compatibility
- ✅ Required fields present
- ✅ Valid data types
- ✅ Zod schema compliance

**Business Rules**
- ✅ No duplicate dependency IDs
- ✅ Valid URL formats
- ✅ Timestamp ordering (detectedAt ≤ lastChecked ≤ lastChanged)
- ✅ Statistics consistency
- ✅ Manifest size limits (<10MB)

**Config Compatibility**
- ✅ Dependency overrides match manifest entries
- ✅ Valid agent assignments
- ✅ Proper secret references

### Per-Dependency Scheduling

Control monitoring frequency for individual dependencies:

```yaml
# In .dependabit/config.yml
dependencies:
  - url: "https://github.com/critical/repo"
    monitoring:
      enabled: true
      checkFrequency: hourly  # Check every hour
      ignoreChanges: false

  - url: "https://stable-docs.example.com"
    monitoring:
      enabled: true
      checkFrequency: monthly  # Check once a month
      ignoreChanges: false

  - url: "https://frozen-api.example.com"
    monitoring:
      enabled: true
      checkFrequency: daily
      ignoreChanges: true  # Monitor but don't create issues
```

### AI Agent Assignment

Route issues to specific AI agents based on severity:

```yaml
# In .dependabit/config.yml
issues:
  labels:
    - dependabit
    - dependency-update
  aiAgentAssignment:
    enabled: true
    breaking: copilot  # Breaking changes → GitHub Copilot
    major: claude      # Major changes → Claude
    minor: copilot     # Minor changes → GitHub Copilot
```

When changes are detected, issues will be labeled with:
- `severity:breaking`, `severity:major`, or `severity:minor`
- `assigned:copilot` or `assigned:claude`

This allows GitHub Actions workflows to route issues to appropriate agents for automated handling.

## Troubleshooting

### Manifest Not Generated

**Issue**: Workflow completes but no `.dependabit/` folder created

**Solutions**:
- Check LLM provider is accessible (GitHub Copilot enabled)
- Verify repository has discoverable dependencies
- Review workflow logs for API errors
- Try running with `debug: true` input

### No Issues Created

**Issue**: Changes detected but no issues appear

**Solutions**:
- Verify `GITHUB_TOKEN` has `issues: write` permission
- Check repository settings allow issue creation
- Review `.dependabit/config.yml` for `monitoring.enabled: false`
- Look for rate limit warnings in logs

### High False Positive Rate

**Issue**: Too many non-meaningful change issues

**Solutions**:
- Adjust `monitoring.falsePositiveThreshold` (default: 0.1)
- Use `ignoreChanges: true` for noisy dependencies
- Configure `patterns` in `ignore` section
- Review severity classification in issues

### Rate Limit Exceeded

**Issue**: GitHub API rate limit reached

**Solutions**:
- Reduce check frequency (`daily` → `weekly`)
- Limit number of tracked dependencies
- Use authenticated requests (default with GITHUB_TOKEN)
- Check logs for excessive API calls

## Understanding Issues

When dependabit detects a change, it creates an issue:

**Issue Title**: `[dependabit] TypeScript: major version 5.10.0 released`

**Issue Labels**:
- `dependabit` (always)
- `dependency-update` (default)
- `breaking` / `major` / `minor` (severity)

**Issue Body** includes:
- **What changed**: Version bump, content change, release
- **Severity**: breaking / major / minor classification
- **Details**: Release notes, changelog links, LLM summary
- **References**: Files/lines where dependency appears
- **Action items**: Suggested next steps

**AI Agent Assignment**: If configured, issues auto-assigned to Copilot/Claude for review

## Maintenance

### Updating Dependabit Action

```yaml
uses: pradeepmouli/dependabit@v1  # Stays on v1.x
uses: pradeepmouli/dependabit@v1.2.0  # Pin to specific version
```

### Viewing Manifest

```bash
# Pretty-print manifest
cat .dependabit/manifest.json | jq '.'

# Count dependencies by type
cat .dependabit/manifest.json | jq '.statistics.byType'

# List all GitHub repos
cat .dependabit/manifest.json | jq '.dependencies[] | select(.type=="github-repo") | .url'
```

### Manual Manifest Edits

You can manually add dependencies:

```json
{
  "id": "new-uuid-here",
  "url": "https://important-resource.com",
  "type": "other",
  "name": "Important Resource",
  "detectionMethod": "manual",
  "detectionConfidence": 1.0,
  "monitoring": {
    "enabled": true,
    "checkFrequency": "daily"
  }
}
```

Run validation:

```yaml
- uses: pradeepmouli/dependabit@v1
  with:
    action: validate
```

## Next Steps

- **Customize labels**: Align with your team's workflow
- **Set up notifications**: Use GitHub webhooks for Slack/Discord
- **Create automation**: Use issue webhooks to trigger other workflows
- **Review weekly**: Check dependabit issues during sprint planning
- **Refine configuration**: Adjust schedules and rules over time

## Support & Documentation

- **Full Documentation**: `docs/ai-dependency-tracker/`
- **Architecture**: `specs/001-ai-dependency-tracker/plan.md`
- **Data Model**: `specs/001-ai-dependency-tracker/data-model.md`
- **Issues**: https://github.com/pradeepmouli/dependabit/issues

---

**Version**: 1.0.0 | **Last Updated**: 2026-01-29
