# Frequently Asked Questions (FAQ)

## General Questions

### What is Dependabit?

Dependabit is an AI-powered tool that automatically discovers, tracks, and monitors **external dependencies** referenced in your codebase. These are resources mentioned in your code, comments, or documentation that aren't tracked by traditional package managers.

### How is Dependabit different from Dependabot?

**Dependabot** (GitHub's official tool) and **Dependabit** serve **different purposes** and are designed to work **together**:

| Feature | Dependabot | Dependabit |
|---------|-----------|------------|
| **Purpose** | Update declared package dependencies | Track external informational dependencies |
| **What it tracks** | npm, pip, cargo, maven, docker, etc. packages | GitHub repos, docs, APIs, research papers, schemas |
| **Where it looks** | package.json, requirements.txt, Cargo.toml, etc. | Code comments, README files, documentation |
| **How it discovers** | Parses manifest files | LLM-powered analysis of any text |
| **What it does** | Creates PRs to update package versions | Creates issues when external resources change |
| **Examples** | `npm install express@5.0.0` | "See https://docs.example.com for details" |

**Simple analogy:**
- **Dependabot** = Manages your grocery list (declared dependencies)
- **Dependabit** = Tracks the recipes you mention (informational references)

### Should I use Dependabot CLI or Dependabit?

**Use both!** They complement each other:

1. **Use Dependabot for:**
   - npm, pip, maven, cargo, docker dependencies
   - Automated package version updates
   - Security vulnerability alerts
   - Creating PRs for dependency upgrades

2. **Use Dependabit for:**
   - GitHub repos referenced in comments/docs
   - API documentation sites mentioned in code
   - OpenAPI/GraphQL schemas you depend on
   - Research papers cited in your work
   - Example code repositories you reference
   - Any external resource that isn't a package dependency

### Can Dependabit replace Dependabot?

**No, and it's not designed to.** Dependabit intentionally **excludes** package dependencies because Dependabot already handles them excellently. Dependabit focuses on the gap: **undeclared external dependencies** that Dependabot can't see.

Example scenario where you need both:

```typescript
// This dependency is tracked by Dependabot (in package.json)
import express from 'express';

// This reference is tracked by Dependabit (in comments)
// API documentation: https://api.example.com/docs
// Example implementation: https://github.com/example/reference-app
// Based on research paper: https://arxiv.org/abs/2301.12345
```

### When should I use Dependabit?

Use Dependabit when your codebase:

- ✅ References external documentation or API specs
- ✅ Mentions GitHub repositories as examples or references
- ✅ Cites research papers or academic work
- ✅ Links to schemas (OpenAPI, GraphQL, etc.)
- ✅ Points to code examples or tutorials
- ✅ Has important external resources in README/comments

### What dependencies does Dependabit NOT track?

Dependabit intentionally **excludes** dependencies that Dependabot already handles:

- ❌ npm packages (package.json)
- ❌ Python packages (requirements.txt, pyproject.toml)
- ❌ Rust crates (Cargo.toml)
- ❌ Docker images (Dockerfile)
- ❌ Maven/Gradle dependencies
- ❌ Go modules (go.mod)

If it's in a package manifest file, use Dependabot instead!

## Setup and Usage

### Do I need to choose between Dependabot and Dependabit?

No! Enable both:

1. **Dependabot** is built into GitHub - just add `.github/dependabot.yml`
2. **Dependabit** requires setup - use our [bootstrap template](../templates/typescript/)

They'll work side-by-side without conflicts.

### Can I use Dependabit without GitHub Copilot?

Yes! Dependabit supports multiple LLM providers:
- GitHub Copilot (default, free with GitHub)
- Claude (requires API key)
- OpenAI (requires API key)

Configure via the `llm_provider` input in your workflow.

### How much does Dependabit cost?

Dependabit itself is free and open source. Costs depend on your LLM provider:
- **GitHub Copilot**: Free with GitHub (default)
- **Claude/OpenAI**: Pay per API call (see their pricing)

## Technical Questions

### How does Dependabit discover dependencies?

1. **Scans** your repository for relevant files (README, code, docs)
2. **Analyzes** content using LLM to identify external references
3. **Classifies** each dependency by type (API, docs, paper, etc.)
4. **Validates** URLs and extracts metadata
5. **Stores** in `.dependabit/manifest.json`

### What happens when an external dependency changes?

1. Dependabit **checks** dependencies on a schedule (e.g., daily)
2. **Detects** changes using appropriate methods:
   - GitHub releases: API checks
   - Documentation: Content comparison
   - Schemas: Semantic diffing
3. **Classifies** severity (breaking, major, minor)
4. **Creates** GitHub issue with details
5. **Assigns** to configured AI agent or team member

### How accurate is the AI detection?

- Detection accuracy: >90% for clear references
- False positive rate: <10%
- Confidence scores provided for each detection
- Manual review and editing supported

### Can I manually edit the manifest?

Yes! The manifest is a JSON file you can edit directly:
- Add dependencies the LLM missed
- Remove false positives
- Update metadata
- Set custom monitoring schedules

Dependabit preserves your manual edits during updates.

## Comparison with Other Tools

### vs Dependabot

See "How is Dependabit different from Dependabot?" above.

### vs Renovate

**Renovate** is similar to Dependabot - it updates package dependencies. Like Dependabot, it doesn't track informational dependencies. Use Dependabit alongside Renovate.

### vs Snyk / WhiteSource

**Snyk** and **WhiteSource** focus on security vulnerabilities in package dependencies. They don't track external references. Use them alongside Dependabit for comprehensive dependency management.

### Is there overlap with GitHub dependency graph?

GitHub's dependency graph shows package dependencies (like Dependabot). It doesn't include external informational dependencies that Dependabit tracks.

## Troubleshooting

### Dependabit detected a package dependency. Is this a bug?

Possibly! Dependabit should **not** track dependencies already handled by Dependabot. If this happens:

1. Check if the dependency is truly in your package manifest
2. Report as a false positive by labeling the issue
3. Dependabit will learn from feedback over time

### Why use both tools instead of one comprehensive tool?

**Separation of concerns:**
- Package dependencies are well-solved by Dependabot/Renovate
- External references need LLM-powered discovery
- Different update cadences and workflows
- Avoids reinventing Dependabot's excellent package management

**Focus on unique value:**
- Dependabit solves a problem Dependabot doesn't address
- Better to do one thing excellently than many things poorly
- Easier to maintain and contribute to

## Contributing

### Can I add support for new dependency types?

Yes! Dependabit has a plugin system. See [CONTRIBUTING.md](../CONTRIBUTING.md) for details on creating plugins.

### How can I improve detection accuracy?

1. Provide clear, consistent references in your code
2. Report false positives to improve the system
3. Contribute to the LLM prompts
4. Share edge cases you discover

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/pradeepmouli/dependabit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pradeepmouli/dependabit/discussions)
- **Documentation**: [docs/](.)

---

**Still have questions?** Open a [discussion](https://github.com/pradeepmouli/dependabit/discussions) or [issue](https://github.com/pradeepmouli/dependabit/issues)!
