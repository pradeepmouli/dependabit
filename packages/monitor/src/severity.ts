/**
 * Severity Classifier
 * Classifies dependency changes into breaking, major, or minor severity levels
 */

import type { ChangeDetection } from './types.js';

export type Severity = 'breaking' | 'major' | 'minor';

export class SeverityClassifier {
  /**
   * Classifies the severity of a change based on version changes and change types
   */
  classify(changes: ChangeDetection): Severity {
    if (!changes.hasChanged) {
      return 'minor';
    }

    // Check for version-based classification
    if (changes.oldVersion && changes.newVersion) {
      const severity = this.classifyVersionChange(changes.oldVersion, changes.newVersion);
      if (severity) {
        return severity;
      }
    }

    // Check for OpenAPI/schema changes
    if (changes.diff && typeof changes.diff === 'object') {
      const diff = changes.diff as {
        removedEndpoints?: string[];
        schemaChanges?: string[];
        addedEndpoints?: string[];
      };

      // Breaking: Removed endpoints or incompatible schema changes
      if (diff.removedEndpoints && diff.removedEndpoints.length > 0) {
        return 'breaking';
      }

      if (diff.schemaChanges && diff.schemaChanges.length > 0) {
        return 'breaking';
      }

      // Major: New endpoints or features
      if (diff.addedEndpoints && diff.addedEndpoints.length > 0) {
        return 'major';
      }
    }

    // Default to minor for content changes
    return 'minor';
  }

  /**
   * Classifies severity based on semantic versioning
   * @returns Severity level or undefined if version format not recognized
   */
  private classifyVersionChange(oldVersion: string, newVersion: string): Severity | undefined {
    // Parse semver-like versions
    const oldParts = this.parseVersion(oldVersion);
    const newParts = this.parseVersion(newVersion);

    if (!oldParts || !newParts) {
      return undefined;
    }

    const [oldMajor, oldMinor, oldPatch] = oldParts;
    const [newMajor, newMinor, newPatch] = newParts;

    // Breaking: Major version increase
    if (newMajor > oldMajor) {
      return 'breaking';
    }

    // Major: Minor version increase
    if (newMajor === oldMajor && newMinor > oldMinor) {
      return 'major';
    }

    // Minor: Patch version increase or same version
    if (newMajor === oldMajor && newMinor === oldMinor && newPatch >= oldPatch) {
      return 'minor';
    }

    // Default for other cases
    return 'major';
  }

  /**
   * Parses a version string into [major, minor, patch]
   */
  private parseVersion(version: string): [number, number, number] | null {
    if (!version) {
      return null;
    }
    
    // Remove 'v' prefix if present
    const cleaned = version.replace(/^v/, '');

    // Match semver pattern
    const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) {
      return null;
    }

    return [
      parseInt(match[1] || '0', 10),
      parseInt(match[2] || '0', 10),
      parseInt(match[3] || '0', 10)
    ];
  }
}
