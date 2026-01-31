import {
  type DependencyEntry,
  type DependabitConfig,
  getEffectiveMonitoringRules
} from '@dependabit/manifest';

export interface SchedulerOptions {
  currentTime?: Date;
}

/**
 * Scheduler for per-dependency monitoring
 *
 * Determines which dependencies should be checked based on:
 * - Check frequency (hourly, daily, weekly, monthly)
 * - Last checked timestamp
 * - Enabled/disabled status
 * - IgnoreChanges flag
 * - Config overrides
 */
export class Scheduler {
  /**
   * Check if a dependency should be checked now
   *
   * @param dependency Dependency entry
   * @param config Configuration
   * @param currentTime Current time (defaults to now)
   * @returns true if dependency should be checked
   */
  shouldCheckDependency(
    dependency: DependencyEntry,
    config: DependabitConfig,
    currentTime: Date = new Date()
  ): boolean {
    // Check dependency's own monitoring rules first
    if (dependency.monitoring) {
      if (!dependency.monitoring.enabled) {
        return false;
      }

      if (dependency.monitoring.ignoreChanges) {
        return false;
      }
    }

    // Get effective monitoring rules (applies config overrides)
    const rules = getEffectiveMonitoringRules(config, dependency.url);

    // Check if monitoring is enabled at config level
    if (!rules.enabled) {
      return false;
    }

    // Check if changes should be ignored at config level
    if (rules.ignoreChanges) {
      return false;
    }

    // Get last checked time
    const lastChecked = new Date(dependency.lastChecked);
    const timeSinceCheck = currentTime.getTime() - lastChecked.getTime();

    // Determine frequency to use (dependency's own monitoring rules take precedence)
    const checkFrequency = dependency.monitoring?.checkFrequency || rules.checkFrequency;

    // Determine if enough time has passed based on frequency
    const intervalMs = this.getIntervalMs(checkFrequency);

    return timeSinceCheck >= intervalMs;
  }

  /**
   * Filter dependencies that should be checked
   *
   * @param dependencies Array of dependencies
   * @param config Configuration
   * @param currentTime Current time (defaults to now)
   * @returns Filtered array of dependencies to check
   */
  filterDependenciesToCheck(
    dependencies: DependencyEntry[],
    config: DependabitConfig,
    currentTime: Date = new Date()
  ): DependencyEntry[] {
    return dependencies.filter((dep) => this.shouldCheckDependency(dep, config, currentTime));
  }

  /**
   * Get interval in milliseconds for a check frequency
   *
   * @param frequency Check frequency
   * @returns Interval in milliseconds
   */
  private getIntervalMs(frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'): number {
    switch (frequency) {
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days (approximate)
      default:
        return 24 * 60 * 60 * 1000; // Default to daily
    }
  }

  /**
   * Get next check time for a dependency
   *
   * @param dependency Dependency entry
   * @param config Configuration
   * @returns Next check time
   */
  getNextCheckTime(dependency: DependencyEntry, config: DependabitConfig): Date {
    const rules = getEffectiveMonitoringRules(config, dependency.url);
    const lastChecked = new Date(dependency.lastChecked);
    
    // Determine frequency to use (dependency's own monitoring rules take precedence)
    const checkFrequency = dependency.monitoring?.checkFrequency || rules.checkFrequency;
    const intervalMs = this.getIntervalMs(checkFrequency);

    return new Date(lastChecked.getTime() + intervalMs);
  }

  /**
   * Get schedule summary for all dependencies
   *
   * @param dependencies Array of dependencies
   * @param config Configuration
   * @returns Schedule summary grouped by frequency
   */
  getScheduleSummary(
    dependencies: DependencyEntry[],
    config: DependabitConfig
  ): {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    disabled: number;
  } {
    const summary = {
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      disabled: 0
    };

    for (const dep of dependencies) {
      // Check dependency's own monitoring rules first
      if (dep.monitoring) {
        if (!dep.monitoring.enabled || dep.monitoring.ignoreChanges) {
          summary.disabled++;
          continue;
        }
      }

      const rules = getEffectiveMonitoringRules(config, dep.url);

      if (!rules.enabled || rules.ignoreChanges) {
        summary.disabled++;
      } else {
        // Use dependency-level frequency if available, otherwise use rules
        const checkFrequency = dep.monitoring?.checkFrequency || rules.checkFrequency;
        summary[checkFrequency]++;
      }
    }

    return summary;
  }
}
