# Architecture: AI-Powered Dependency Tracking System

## Overview

Dependabit is a GitHub Action that uses LLM-powered analysis to discover, track, and monitor external dependencies referenced in repositories. It complements traditional dependency managers (like dependabot) by tracking **informational dependencies** that aren't declared in package manifests.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Workflow                       │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Generate   │  │    Update    │  │          Check           │  │
│  │   Workflow   │  │   Workflow   │  │        Workflow          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
│         └─────────────────┼────────────────────────┘                │
│                           │                                         │
│                           ▼                                         │
│                  ┌────────────────┐                                 │
│                  │ @dependabit/   │                                 │
│                  │    action      │                                 │
│                  └───────┬────────┘                                 │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ @dependabit/  │  │ @dependabit/  │  │ @dependabit/  │
│   detector    │  │    monitor    │  │ github-client │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ @dependabit/  │  │  Plugin       │  │   GitHub      │
│   manifest    │  │  Registry     │  │     API       │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Package Architecture

### Core Packages

#### `@dependabit/action`
**Purpose**: GitHub Action entry point and orchestration

- **Location**: `packages/action/`
- **Responsibilities**:
  - Action input/output handling
  - Workflow coordination
  - Error handling and logging
  - GitHub Actions integration

**Key Files**:
- `actions/generate.ts` - Initial manifest generation
- `actions/update.ts` - Manifest updates on push
- `actions/check.ts` - Dependency change monitoring
- `actions/validate.ts` - Manifest validation

#### `@dependabit/detector`
**Purpose**: LLM-powered dependency detection

- **Location**: `packages/detector/`
- **Responsibilities**:
  - Code parsing (README, comments, package files)
  - LLM integration for analysis
  - Dependency type categorization
  - Access method determination

**Detection Pipeline**:
```
Source Files → Programmatic Parsing → LLM Analysis → Type Classification → Access Method → Manifest Entry
```

#### `@dependabit/manifest`
**Purpose**: Schema and storage management

- **Location**: `packages/manifest/`
- **Responsibilities**:
  - Zod schema definitions
  - Manifest CRUD operations
  - Config parsing (YAML)
  - Validation logic

**Key Schemas**:
- `DependencyManifestSchema` - Main manifest structure
- `DependabitConfigSchema` - User configuration
- `DependencyEntrySchema` - Individual dependency

#### `@dependabit/monitor`
**Purpose**: Change detection and monitoring

- **Location**: `packages/monitor/`
- **Responsibilities**:
  - Scheduled dependency checks
  - State comparison
  - Severity classification
  - Change detection

**Checkers**:
- `GitHubRepoChecker` - GitHub releases/commits
- `URLContentChecker` - Generic HTTP content
- `OpenAPIChecker` - OpenAPI spec semantic diffing

#### `@dependabit/github-client`
**Purpose**: GitHub API integration

- **Location**: `packages/github-client/`
- **Responsibilities**:
  - Octokit wrapper
  - Rate limit handling
  - Issue management
  - Authentication

### Plugin System

#### `@dependabit/plugins/registry`
**Purpose**: Plugin discovery and registration

- **Location**: `packages/plugins/registry/`
- **API**:
  ```typescript
  interface Plugin {
    metadata: PluginMetadata;
    check(url: string): Promise<PluginCheckResult>;
    initialize?(): Promise<void>;
    destroy?(): Promise<void>;
  }
  ```

#### Access Method Plugins
- `@dependabit/plugin-context7` - Context7 documentation API
- `@dependabit/plugin-arxiv` - arXiv paper tracking
- `@dependabit/plugin-openapi` - OpenAPI spec checking
- `@dependabit/plugin-http` - Generic HTTP monitoring
- `@dependabit/plugin-github` - GitHub API integration

## Data Flow

### Generate Flow
```
1. Checkout repository
2. Scan source files (README, code, configs)
3. Programmatic extraction (links, URLs)
4. LLM analysis (categorization, context)
5. Type classification (documentation, schema, etc.)
6. Access method determination (http, github-api, etc.)
7. Generate manifest
8. Commit to repository
```

### Update Flow
```
1. Triggered by push to main/master
2. Detect changed files
3. Re-analyze only changed files
4. Merge new dependencies
5. Preserve manual entries
6. Update manifest
7. Commit changes
```

### Check Flow
```
1. Scheduled (cron) or manual trigger
2. Load manifest
3. For each dependency:
   - Select appropriate checker
   - Fetch current state
   - Compare with stored state
   - Classify severity
4. Create issues for changes
5. Update manifest with new states
```

## Storage

### Manifest (`manifest.json`)
```json
{
  "version": "1.0.0",
  "dependencies": [...],
  "statistics": {...}
}
```

### Config (`config.yml`)
```yaml
version: "1"
schedule:
  interval: daily
issues:
  aiAgentAssignment:
    enabled: true
```

## Key Design Decisions

### 1. Hybrid Detection (Programmatic + LLM)
**Rationale**: Minimize LLM costs while maintaining accuracy
- Programmatic parsing for ~80% of detections
- LLM fallback for ambiguous cases
- Confidence scoring (0.9 programmatic, 0.5 LLM)

### 2. Plugin Architecture
**Rationale**: Extensibility without core changes
- Access methods are pluggable
- Community can add new types
- Clean separation of concerns

### 3. Monorepo Structure
**Rationale**: Independent versioning with shared tooling
- Each package can version separately
- Shared TypeScript config
- pnpm workspace management

### 4. GitHub Copilot CLI
**Rationale**: Native GitHub integration
- No API key management
- Pre-installed on Actions runners
- GitHub authentication built-in

## Performance Considerations

### Rate Limiting
- Proactive rate limit checking
- Budget reservation before operations
- Exponential backoff on failures

### Manifest Size
- Target: <1MB
- Warning: >5MB
- Hard limit: 10MB

### Processing Time
- Generate: <5 minutes
- Update: <2 minutes
- Check (100 deps): <10 minutes

## Security

### Authentication
- GitHub token from Actions
- Per-dependency auth via secrets
- Support for token, basic, OAuth

### Data Protection
- Secrets never logged
- Credential references, not values
- Least-privilege token scopes

## Extensibility

### Adding New Access Methods
1. Create plugin package
2. Implement `Plugin` interface
3. Register with plugin registry
4. Add to manifest schema

### Adding New Dependency Types
1. Add to `DependencyTypeSchema`
2. Update detection prompts
3. Configure access method mapping
4. Add severity rules
