import { describe, it, expect, beforeEach } from 'vitest';
import { SeverityClassifier } from '../../src/severity.js';

describe('SeverityClassifier', () => {
  let classifier: SeverityClassifier;

  beforeEach(() => {
    classifier = new SeverityClassifier();
  });

  describe('classify', () => {
    it('should classify as breaking for major version changes', () => {
      const changes = {
        hasChanged: true,
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v2.0.0'
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('breaking');
    });

    it('should classify as major for minor version changes', () => {
      const changes = {
        hasChanged: true,
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v1.1.0'
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('major');
    });

    it('should classify as minor for patch version changes', () => {
      const changes = {
        hasChanged: true,
        changes: ['version'],
        oldVersion: 'v1.0.0',
        newVersion: 'v1.0.1'
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('minor');
    });

    it('should classify OpenAPI endpoint removal as breaking', () => {
      const changes = {
        hasChanged: true,
        changes: ['openapi'],
        diff: {
          removedEndpoints: ['/api/users'],
          addedEndpoints: [],
          modifiedEndpoints: []
        }
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('breaking');
    });

    it('should classify schema incompatibilities as breaking', () => {
      const changes = {
        hasChanged: true,
        changes: ['openapi'],
        diff: {
          removedEndpoints: [],
          addedEndpoints: [],
          modifiedEndpoints: [],
          schemaChanges: ['required field removed']
        }
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('breaking');
    });

    it('should classify new features as major', () => {
      const changes = {
        hasChanged: true,
        changes: ['openapi'],
        diff: {
          removedEndpoints: [],
          addedEndpoints: ['/api/v2/posts'],
          modifiedEndpoints: []
        }
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('major');
    });

    it('should classify content changes as minor', () => {
      const changes = {
        hasChanged: true,
        changes: ['content']
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('minor');
    });

    it('should handle no changes', () => {
      const changes = {
        hasChanged: false,
        changes: []
      };

      const severity = classifier.classify(changes);

      expect(severity).toBe('minor');
    });
  });
});
