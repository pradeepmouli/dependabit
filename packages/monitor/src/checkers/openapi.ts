/**
 * OpenAPI Spec Checker
 * Monitors OpenAPI/Swagger specifications for changes with semantic diffing
 */

import type { Checker, DependencySnapshot, ChangeDetection, AccessConfig } from '../types.js';
import crypto from 'node:crypto';
import { parse as parseYAML } from 'yaml';

/**
 * OpenAPI document structure (partial, for what we need)
 */
interface OpenAPIDocument {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  trace?: Operation;
  parameters?: unknown[];
}

interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  deprecated?: boolean;
}

/**
 * Semantic diff result for OpenAPI specs
 */
interface OpenAPIDiff {
  addedEndpoints: string[];
  removedEndpoints: string[];
  modifiedEndpoints: string[];
  addedSchemas: string[];
  removedSchemas: string[];
  modifiedSchemas: string[];
  versionChanged: boolean;
  oldVersion?: string;
  newVersion?: string;
}

export class OpenAPIChecker implements Checker {
  /**
   * Fetches and parses OpenAPI specification
   */
  async fetch(config: AccessConfig): Promise<DependencySnapshot> {
    const { url } = config;

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json, application/yaml, text/yaml, */*',
        'User-Agent': 'dependabit-monitor/1.0'
      };

      if (config.auth?.secret) {
        if (config.auth.type === 'token' || config.auth.type === 'oauth') {
          headers['Authorization'] = `Bearer ${config.auth.secret}`;
        } else if (config.auth.type === 'basic') {
          headers['Authorization'] = `Basic ${config.auth.secret}`;
        }
      }

      const response = await fetch(url, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();

      // Parse the OpenAPI spec
      let spec: OpenAPIDocument;
      if (contentType.includes('yaml') || url.endsWith('.yaml') || url.endsWith('.yml')) {
        // Parse YAML using standard yaml library
        spec = parseYAML(content) as OpenAPIDocument;
      } else {
        spec = JSON.parse(content) as OpenAPIDocument;
      }

      // Extract key information for semantic comparison
      const endpoints = this.extractEndpoints(spec);
      const schemas = this.extractSchemas(spec);
      const version = spec.info?.version;

      // Create a deterministic hash from the semantic content
      const semanticContent = JSON.stringify({
        version,
        endpoints: Object.keys(endpoints).sort(),
        schemas: Object.keys(schemas).sort(),
        endpointDetails: endpoints,
        schemaDetails: schemas
      });
      const stateHash = crypto.createHash('sha256').update(semanticContent).digest('hex');

      return {
        version,
        stateHash,
        fetchedAt: new Date(),
        metadata: {
          title: spec.info?.title,
          description: spec.info?.description,
          specVersion: spec.openapi || spec.swagger,
          endpointCount: Object.keys(endpoints).length,
          schemaCount: Object.keys(schemas).length,
          endpoints,
          schemas
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch OpenAPI spec: ${(error as Error).message}`);
    }
  }

  /**
   * Extract endpoints from OpenAPI spec
   */
  private extractEndpoints(spec: OpenAPIDocument): Record<string, string[]> {
    const endpoints: Record<string, string[]> = {};

    if (!spec.paths) return endpoints;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const methods: string[] = [];
      const httpMethods = [
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'options',
        'head',
        'trace'
      ] as const;

      for (const method of httpMethods) {
        if (pathItem[method]) {
          methods.push(method.toUpperCase());
        }
      }

      if (methods.length > 0) {
        endpoints[path] = methods;
      }
    }

    return endpoints;
  }

  /**
   * Extract schemas from OpenAPI spec
   */
  private extractSchemas(spec: OpenAPIDocument): Record<string, unknown> {
    return spec.components?.schemas || {};
  }

  /**
   * Compares two OpenAPI snapshots with semantic diffing
   */
  async compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection> {
    const changes: string[] = [];
    let severity: 'breaking' | 'major' | 'minor' = 'minor';

    // Extract endpoints and schemas from metadata
    let prevEndpoints = (prev.metadata?.['endpoints'] as Record<string, string[]>) || {};
    let currEndpoints = (curr.metadata?.['endpoints'] as Record<string, string[]>) || {};
    let prevSchemas = (prev.metadata?.['schemas'] as Record<string, unknown>) || {};
    let currSchemas = (curr.metadata?.['schemas'] as Record<string, unknown>) || {};

    // If the state hashes match but previous metadata is missing, avoid spurious diffs
    if (
      prev.stateHash !== undefined &&
      curr.stateHash !== undefined &&
      prev.stateHash === curr.stateHash
    ) {
      prevEndpoints = currEndpoints;
      prevSchemas = currSchemas;
    }
    const diff: OpenAPIDiff = {
      addedEndpoints: [],
      removedEndpoints: [],
      modifiedEndpoints: [],
      addedSchemas: [],
      removedSchemas: [],
      modifiedSchemas: [],
      versionChanged: prev.version !== curr.version
    };

    if (prev.version !== undefined) {
      diff.oldVersion = prev.version;
    }

    if (curr.version !== undefined) {
      diff.newVersion = curr.version;
    }

    // Compare endpoints
    const prevEndpointKeys = Object.keys(prevEndpoints);
    const currEndpointKeys = Object.keys(currEndpoints);

    for (const path of currEndpointKeys) {
      if (!prevEndpointKeys.includes(path)) {
        diff.addedEndpoints.push(path);
      } else if (JSON.stringify(prevEndpoints[path]) !== JSON.stringify(currEndpoints[path])) {
        diff.modifiedEndpoints.push(path);
      }
    }

    for (const path of prevEndpointKeys) {
      if (!currEndpointKeys.includes(path)) {
        diff.removedEndpoints.push(path);
      }
    }

    // Compare schemas
    const prevSchemaKeys = Object.keys(prevSchemas);
    const currSchemaKeys = Object.keys(currSchemas);

    for (const schema of currSchemaKeys) {
      if (!prevSchemaKeys.includes(schema)) {
        diff.addedSchemas.push(schema);
      } else if (JSON.stringify(prevSchemas[schema]) !== JSON.stringify(currSchemas[schema])) {
        diff.modifiedSchemas.push(schema);
      }
    }

    for (const schema of prevSchemaKeys) {
      if (!currSchemaKeys.includes(schema)) {
        diff.removedSchemas.push(schema);
      }
    }

    // Determine changes and severity
    if (diff.removedEndpoints.length > 0) {
      changes.push('endpoints_removed');
      severity = 'breaking';
    }

    if (diff.removedSchemas.length > 0) {
      changes.push('schemas_removed');
      severity = 'breaking';
    }

    if (diff.modifiedEndpoints.length > 0) {
      changes.push('endpoints_modified');
      if (severity !== 'breaking') severity = 'major';
    }

    if (diff.modifiedSchemas.length > 0) {
      changes.push('schemas_modified');
      if (severity !== 'breaking') severity = 'major';
    }

    if (diff.addedEndpoints.length > 0) {
      changes.push('endpoints_added');
    }

    if (diff.addedSchemas.length > 0) {
      changes.push('schemas_added');
    }

    if (diff.versionChanged) {
      changes.push('version');
    }

    // Check overall hash change
    if (prev.stateHash !== curr.stateHash && changes.length === 0) {
      changes.push('content');
    }

    const result: ChangeDetection = {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: prev.version,
      newVersion: curr.version,
      diff
    };

    if (changes.length > 0) {
      result.severity = severity;
    }

    return result;
  }
}
