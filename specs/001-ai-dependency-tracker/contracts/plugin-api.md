# Plugin API Contract

## Overview

The Dependabit plugin system allows extending the core functionality with new access methods for monitoring different types of dependencies. This document defines the API contract that plugins must implement.

## Plugin Interface

```typescript
/**
 * Core plugin interface that all access method plugins must implement
 */
interface Plugin {
  /**
   * Plugin metadata describing the plugin's capabilities
   */
  metadata: PluginMetadata;

  /**
   * Check a dependency URL and return its current state
   * @param url - The dependency URL to check
   * @returns Current state snapshot of the dependency
   */
  check(url: string): Promise<PluginCheckResult>;

  /**
   * Optional: Initialize the plugin (e.g., establish connections)
   * Called once when the plugin is loaded
   */
  initialize?(): Promise<void>;

  /**
   * Optional: Clean up resources when plugin is unloaded
   * Called when the plugin is unregistered
   */
  destroy?(): Promise<void>;
}
```

## Plugin Metadata

```typescript
/**
 * Metadata describing a plugin's identity and capabilities
 */
interface PluginMetadata {
  /**
   * Unique plugin name (kebab-case)
   * @example "context7", "arxiv", "openapi"
   */
  name: string;

  /**
   * Semantic version of the plugin
   * @example "1.0.0"
   */
  version: string;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * The access method this plugin provides
   * Must match one of the supported access methods in the manifest schema
   * @example "context7", "arxiv", "openapi", "github-api", "http"
   */
  accessMethod: string;

  /**
   * Optional: Dependency types this plugin specializes in
   * @example ["documentation", "research-paper"]
   */
  supportedTypes?: string[];
}
```

## Check Result

```typescript
/**
 * Result of checking a dependency's current state
 */
interface PluginCheckResult {
  /**
   * Semantic version if available
   * @example "v1.0.0", "3.2.1"
   */
  version?: string;

  /**
   * SHA256 hash of the current state
   * Used for change detection
   */
  hash: string;

  /**
   * Whether the resource is currently accessible
   */
  available: boolean;

  /**
   * Optional: Additional metadata about the check
   */
  metadata?: Record<string, unknown>;
}
```

## Plugin Registration

### Registering a Plugin

```typescript
import { registerPlugin, type Plugin } from '@dependabit/plugins/registry';

const myPlugin: Plugin = {
  metadata: {
    name: 'my-custom-plugin',
    version: '1.0.0',
    description: 'Custom access method for My Service',
    accessMethod: 'my-service'
  },

  async check(url: string): Promise<PluginCheckResult> {
    // Implementation
    const response = await fetch(url);
    const content = await response.text();
    const hash = createHash('sha256').update(content).digest('hex');

    return {
      hash,
      available: response.ok,
      metadata: {
        contentType: response.headers.get('content-type'),
        lastModified: response.headers.get('last-modified')
      }
    };
  }
};

// Register the plugin
registerPlugin(myPlugin);
```

### Plugin Loader

```typescript
import { PluginLoader, createPluginLoader } from '@dependabit/plugins/registry';

const loader = createPluginLoader({
  validateMetadata: true,   // Validate against schema
  autoInitialize: true      // Call initialize() on load
});

// Load from class
const plugin = await loader.instantiate(MyPluginClass, { apiKey: 'xxx' });

// Load from object
const plugin = await loader.load(pluginObject);

// Load multiple
const plugins = await loader.loadMany([plugin1, plugin2, plugin3]);
```

## Built-in Access Methods

### github-api

Monitors GitHub repositories for releases and commits.

**URL Pattern**: `https://github.com/{owner}/{repo}`

**Check Behavior**:
1. Fetch latest release via GitHub API
2. Fall back to latest commit if no releases
3. Return version (tag) and state hash

**Example Result**:
```json
{
  "version": "v5.0.0",
  "hash": "sha256:abc123...",
  "available": true,
  "metadata": {
    "releaseName": "Version 5.0.0",
    "publishedAt": "2024-01-15T00:00:00Z",
    "releaseNotes": "..."
  }
}
```

### http

Generic HTTP content monitoring with normalization.

**URL Pattern**: Any HTTP/HTTPS URL

**Check Behavior**:
1. Fetch URL content
2. Normalize HTML (remove dynamic elements)
3. Hash normalized content

**Example Result**:
```json
{
  "hash": "sha256:def456...",
  "available": true,
  "metadata": {
    "contentType": "text/html",
    "contentLength": 45678,
    "normalizedLength": 32100
  }
}
```

### openapi

OpenAPI specification monitoring with semantic diffing.

**URL Pattern**: URL to OpenAPI JSON/YAML spec

**Check Behavior**:
1. Fetch and parse OpenAPI spec
2. Extract endpoints and schemas
3. Create semantic hash

**Example Result**:
```json
{
  "version": "1.0.0",
  "hash": "sha256:789abc...",
  "available": true,
  "metadata": {
    "title": "My API",
    "specVersion": "3.1.0",
    "endpointCount": 15,
    "schemaCount": 8
  }
}
```

### arxiv

arXiv paper version tracking.

**URL Pattern**: `https://arxiv.org/abs/{id}`

**Check Behavior**:
1. Query arXiv API for paper metadata
2. Extract version number and update date
3. Hash version + abstract

**Example Result**:
```json
{
  "version": "v7",
  "hash": "sha256:xyz789...",
  "available": true,
  "metadata": {
    "arxivId": "1706.03762",
    "title": "Attention Is All You Need",
    "authors": ["Vaswani, A.", "..."],
    "updatedDate": "2023-08-02T00:00:00Z"
  }
}
```

### context7

Context7 documentation API monitoring.

**URL Pattern**: `https://context7.io/{library}`

**Check Behavior**:
1. Query Context7 API for library metadata
2. Extract version and content hash
3. Fall back to URL fetch if API unavailable

**Example Result**:
```json
{
  "version": "18.2.0",
  "hash": "sha256:abc123...",
  "available": true,
  "metadata": {
    "libraryId": "react",
    "libraryName": "React",
    "lastUpdated": "2024-01-15T00:00:00Z"
  }
}
```

## Creating a Custom Plugin

### Step 1: Create Package

```
packages/plugins/plugin-my-service/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   └── checker.ts
└── test/
    └── checker.test.ts
```

### Step 2: Implement Checker

```typescript
// src/checker.ts
import crypto from 'node:crypto';

export interface MyServiceConfig {
  url: string;
  apiKey?: string;
}

export interface MyServiceSnapshot {
  version: string;
  stateHash: string;
  fetchedAt: Date;
  metadata: Record<string, unknown>;
}

export class MyServiceChecker {
  private apiUrl = 'https://api.my-service.com';

  async fetch(config: MyServiceConfig): Promise<MyServiceSnapshot> {
    const { url, apiKey } = config;

    const response = await fetch(`${this.apiUrl}/check?url=${encodeURIComponent(url)}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const stateHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    return {
      version: data.version,
      stateHash,
      fetchedAt: new Date(),
      metadata: data
    };
  }

  async compare(prev: MyServiceSnapshot, curr: MyServiceSnapshot) {
    return {
      hasChanged: prev.stateHash !== curr.stateHash,
      changes: prev.version !== curr.version ? ['version'] : ['content'],
      oldVersion: prev.version,
      newVersion: curr.version
    };
  }
}
```

### Step 3: Export as Plugin

```typescript
// src/index.ts
import { MyServiceChecker } from './checker.js';
import type { Plugin, PluginCheckResult } from '@dependabit/plugins/registry';

export class MyServicePlugin implements Plugin {
  metadata = {
    name: 'my-service',
    version: '1.0.0',
    description: 'My Service integration',
    accessMethod: 'my-service',
    supportedTypes: ['documentation', 'api-example']
  };

  private checker = new MyServiceChecker();
  private apiKey?: string;

  constructor(config?: { apiKey?: string }) {
    this.apiKey = config?.apiKey;
  }

  async check(url: string): Promise<PluginCheckResult> {
    const snapshot = await this.checker.fetch({ url, apiKey: this.apiKey });

    return {
      version: snapshot.version,
      hash: snapshot.stateHash,
      available: true,
      metadata: snapshot.metadata
    };
  }

  async initialize(): Promise<void> {
    // Validate API key, establish connection, etc.
  }

  async destroy(): Promise<void> {
    // Clean up resources
  }
}

export { MyServiceChecker } from './checker.js';
```

### Step 4: Register Plugin

```typescript
// In your action or test
import { registerPlugin } from '@dependabit/plugins/registry';
import { MyServicePlugin } from '@dependabit/plugin-my-service';

const plugin = new MyServicePlugin({ apiKey: process.env.MY_SERVICE_API_KEY });
registerPlugin(plugin);
```

## Error Handling

Plugins should handle errors gracefully:

```typescript
async check(url: string): Promise<PluginCheckResult> {
  try {
    const data = await this.fetchData(url);
    return {
      hash: this.computeHash(data),
      available: true,
      metadata: data
    };
  } catch (error) {
    if (isNetworkError(error)) {
      return {
        hash: '',
        available: false,
        metadata: { error: 'Network unavailable' }
      };
    }

    if (isRateLimitError(error)) {
      // Let caller handle retry
      throw new RateLimitError(error.retryAfter);
    }

    throw error;
  }
}
```

## Testing Plugins

```typescript
import { describe, it, expect, vi } from 'vitest';
import { MyServicePlugin } from '../src/index.js';

describe('MyServicePlugin', () => {
  it('should check URL and return result', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0', data: 'test' })
    } as Response);

    const plugin = new MyServicePlugin();
    const result = await plugin.check('https://example.com');

    expect(result.available).toBe(true);
    expect(result.version).toBe('1.0.0');
    expect(result.hash).toBeDefined();
  });

  it('should handle unavailable resources', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404
    } as Response);

    const plugin = new MyServicePlugin();
    const result = await plugin.check('https://example.com/missing');

    expect(result.available).toBe(false);
  });
});
```

## Version Compatibility

| Plugin API Version | Manifest Schema Version | Notes |
|-------------------|------------------------|-------|
| 1.0.0 | 1.0.0 | Initial release |

Plugins must declare compatible versions:

```typescript
metadata: {
  name: 'my-plugin',
  version: '1.0.0',
  // Plugin API version requirement (optional)
  apiVersion: '^1.0.0'
}
```
