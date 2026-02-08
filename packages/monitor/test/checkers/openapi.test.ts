import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAPIChecker } from '../../src/checkers/openapi.js';
import type { AccessConfig, DependencySnapshot } from '../../src/types.js';

describe('OpenAPIChecker', () => {
  let checker: OpenAPIChecker;

  beforeEach(() => {
    checker = new OpenAPIChecker();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetch', () => {
    it('should fetch and parse JSON OpenAPI spec', async () => {
      const mockSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
          description: 'A test API'
        },
        paths: {
          '/users': {
            get: { operationId: 'getUsers' },
            post: { operationId: 'createUser' }
          },
          '/users/{id}': {
            get: { operationId: 'getUser' },
            delete: { operationId: 'deleteUser' }
          }
        },
        components: {
          schemas: {
            User: { type: 'object' },
            Error: { type: 'object' }
          }
        }
      };

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockSpec)
      } as Response);

      const config: AccessConfig = {
        url: 'https://api.example.com/openapi.json',
        accessMethod: 'openapi'
      };

      const snapshot = await checker.fetch(config);

      expect(snapshot.version).toBe('1.0.0');
      expect(snapshot.stateHash).toBeDefined();
      expect(snapshot.fetchedAt).toBeInstanceOf(Date);
      expect(snapshot.metadata?.title).toBe('Test API');
      expect(snapshot.metadata?.endpointCount).toBe(2);
      expect(snapshot.metadata?.schemaCount).toBe(2);
    });

    it('should fetch and parse YAML OpenAPI spec', async () => {
      const yamlSpec = `
openapi: '3.0.0'
info:
  title: Test API
  version: '2.0.0'
paths:
  /items:
    get:
      summary: List items
    post:
      summary: Create item
components:
  schemas:
    Item:
      type: object
`;

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/yaml' }),
        text: async () => yamlSpec
      } as Response);

      const config: AccessConfig = {
        url: 'https://api.example.com/openapi.yaml',
        accessMethod: 'openapi'
      };

      const snapshot = await checker.fetch(config);

      expect(snapshot.version).toBe('2.0.0');
      expect(snapshot.metadata?.title).toBe('Test API');
    });

    it('should handle authentication token', async () => {
      const mockSpec = { openapi: '3.0.0', info: { version: '1.0.0' } };
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockSpec)
      } as Response);

      const config: AccessConfig = {
        url: 'https://api.example.com/openapi.json',
        accessMethod: 'openapi',
        auth: {
          type: 'token',
          secret: 'test-token'
        }
      };

      await checker.fetch(config);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/openapi.json',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });

    it('should throw error on HTTP failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      const config: AccessConfig = {
        url: 'https://api.example.com/openapi.json',
        accessMethod: 'openapi'
      };

      await expect(checker.fetch(config)).rejects.toThrow('HTTP error: 404 Not Found');
    });

    it('should throw error on invalid JSON', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => 'invalid json'
      } as Response);

      const config: AccessConfig = {
        url: 'https://api.example.com/openapi.json',
        accessMethod: 'openapi'
      };

      await expect(checker.fetch(config)).rejects.toThrow('Failed to fetch OpenAPI spec');
    });
  });

  describe('compare', () => {
    it('should detect no changes when specs are identical', async () => {
      const snapshot: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET', 'POST'] },
          schemas: { User: {} }
        }
      };

      const result = await checker.compare(snapshot, { ...snapshot });

      expect(result.hasChanged).toBe(false);
      expect(result.changes).toHaveLength(0);
    });

    it('should detect added endpoints', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'] },
          schemas: {}
        }
      };

      const curr: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'def456',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'], '/items': ['GET', 'POST'] },
          schemas: {}
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('endpoints_added');
      expect(result.severity).toBe('minor');
    });

    it('should detect removed endpoints as breaking change', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'], '/items': ['GET'] },
          schemas: {}
        }
      };

      const curr: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'def456',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'] },
          schemas: {}
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('endpoints_removed');
      expect(result.severity).toBe('breaking');
    });

    it('should detect modified endpoints as major change', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET', 'POST'] },
          schemas: {}
        }
      };

      const curr: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'def456',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET', 'POST', 'PUT'] },
          schemas: {}
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('endpoints_modified');
      expect(result.severity).toBe('major');
    });

    it('should detect removed schemas as breaking change', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: {},
          schemas: { User: {}, Item: {} }
        }
      };

      const curr: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'def456',
        fetchedAt: new Date(),
        metadata: {
          endpoints: {},
          schemas: { User: {} }
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('schemas_removed');
      expect(result.severity).toBe('breaking');
    });

    it('should detect version changes', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: {},
          schemas: {}
        }
      };

      const curr: DependencySnapshot = {
        version: '2.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: {},
          schemas: {}
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.hasChanged).toBe(true);
      expect(result.changes).toContain('version');
      expect(result.oldVersion).toBe('1.0.0');
      expect(result.newVersion).toBe('2.0.0');
    });

    it('should include diff details', async () => {
      const prev: DependencySnapshot = {
        version: '1.0.0',
        stateHash: 'abc123',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'] },
          schemas: { User: {} }
        }
      };

      const curr: DependencySnapshot = {
        version: '2.0.0',
        stateHash: 'def456',
        fetchedAt: new Date(),
        metadata: {
          endpoints: { '/users': ['GET'], '/items': ['POST'] },
          schemas: { User: {}, Item: {} }
        }
      };

      const result = await checker.compare(prev, curr);

      expect(result.diff).toBeDefined();
      const diff = result.diff as {
        addedEndpoints: string[];
        addedSchemas: string[];
        versionChanged: boolean;
      };
      expect(diff.addedEndpoints).toContain('/items');
      expect(diff.addedSchemas).toContain('Item');
      expect(diff.versionChanged).toBe(true);
    });
  });
});
