/**
 * State Comparator
 * Generic comparison logic for dependency state snapshots
 */

import { DependencySnapshot, ChangeDetection } from './types.js';

export class StateComparator {
  /**
   * Compares two dependency snapshots to detect changes
   */
  compare(oldState: DependencySnapshot, newState: DependencySnapshot): ChangeDetection {
    const changes: string[] = [];

    // Check state hash
    if (oldState.stateHash !== newState.stateHash) {
      changes.push('stateHash');
    }

    // Check version
    if (oldState.version !== newState.version) {
      changes.push('version');
    }

    // Check metadata changes (shallow comparison)
    if (this.hasMetadataChanges(oldState.metadata, newState.metadata)) {
      changes.push('metadata');
    }

    return {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: oldState.version,
      newVersion: newState.version
    };
  }

  /**
   * Checks if metadata has changed (shallow comparison)
   */
  private hasMetadataChanges(
    oldMeta?: Record<string, unknown>,
    newMeta?: Record<string, unknown>
  ): boolean {
    if (!oldMeta && !newMeta) {
      return false;
    }

    if (!oldMeta || !newMeta) {
      return true;
    }

    const oldKeys = Object.keys(oldMeta);
    const newKeys = Object.keys(newMeta);

    if (oldKeys.length !== newKeys.length) {
      return true;
    }

    for (const key of oldKeys) {
      if (oldMeta[key] !== newMeta[key]) {
        return true;
      }
    }

    return false;
  }
}
