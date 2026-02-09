/**
 * Performance metrics tracking for operations
 * Tracks operation durations, API quotas, and resource usage
 */

export interface OperationMetrics {
  operationId?: string | undefined;
  name: string;
  startTime: number;
  endTime?: number | undefined;
  duration?: number | undefined;
  status: 'running' | 'completed' | 'failed';
  metadata?: Record<string, unknown> | undefined;
}

export interface APIQuotaMetrics {
  limit: number;
  remaining: number;
  used: number;
  resetAt: Date;
  percentUsed: number;
}

export interface PerformanceReport {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  averageDuration: number;
  totalDuration: number;
  apiQuota?: APIQuotaMetrics | undefined;
  operations: OperationMetrics[];
}

/**
 * Performance metrics tracker
 */
export class PerformanceTracker {
  private operations: Map<string, OperationMetrics>;
  private completedOperations: OperationMetrics[];
  private apiQuota?: APIQuotaMetrics | undefined;

  constructor() {
    this.operations = new Map();
    this.completedOperations = [];
    this.apiQuota = undefined;
  }

  /**
   * Start tracking an operation
   */
  startOperation(name: string, metadata?: Record<string, unknown>): string {
    const operationId = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const metrics: OperationMetrics = {
      operationId,
      name,
      startTime: Date.now(),
      status: 'running',
      metadata
    };

    this.operations.set(operationId, metrics);
    return operationId;
  }

  /**
   * End tracking an operation
   */
  endOperation(operationId: string, status: 'completed' | 'failed' = 'completed'): void {
    const metrics = this.operations.get(operationId);
    if (!metrics) {
      return;
    }

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.status = status;

    this.completedOperations.push(metrics);
    this.operations.delete(operationId);
  }

  /**
   * Update API quota metrics
   */
  updateAPIQuota(quota: { limit: number; remaining: number; used: number; reset: number }): void {
    this.apiQuota = {
      limit: quota.limit,
      remaining: quota.remaining,
      used: quota.used,
      resetAt: new Date(quota.reset * 1000),
      percentUsed: (quota.used / quota.limit) * 100
    };
  }

  /**
   * Get current API quota status
   */
  getAPIQuota(): APIQuotaMetrics | undefined {
    return this.apiQuota;
  }

  /**
   * Get metrics for a specific operation
   */
  getOperation(operationId: string): OperationMetrics | undefined {
    return (
      this.operations.get(operationId) ||
      this.completedOperations.find((op) => op.operationId === operationId)
    );
  }

  /**
   * Get all running operations
   */
  getRunningOperations(): OperationMetrics[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get all completed operations
   */
  getCompletedOperations(): OperationMetrics[] {
    return this.completedOperations;
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const allOperations = this.completedOperations;
    const completed = allOperations.filter((op) => op.status === 'completed');
    const failed = allOperations.filter((op) => op.status === 'failed');

    const durations = completed.filter((op) => op.duration !== undefined).map((op) => op.duration!);

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;

    return {
      totalOperations: allOperations.length,
      completedOperations: completed.length,
      failedOperations: failed.length,
      averageDuration,
      totalDuration,
      apiQuota: this.apiQuota,
      operations: allOperations
    };
  }

  /**
   * Get operations by name
   */
  getOperationsByName(name: string): OperationMetrics[] {
    return this.completedOperations.filter((op) => op.name === name);
  }

  /**
   * Calculate percentile duration for an operation
   */
  getOperationPercentile(name: string, percentile: number): number {
    const operations = this.getOperationsByName(name);
    const durations = operations
      .filter((op) => op.duration !== undefined)
      .map((op) => op.duration!)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return 0;
    }

    const index = Math.ceil((percentile / 100) * durations.length) - 1;
    const value = durations[Math.max(0, index)];
    return value !== undefined ? value : 0;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.operations.clear();
    this.completedOperations = [];
    this.apiQuota = undefined;
  }

  /**
   * Format metrics as human-readable string
   */
  formatReport(report?: PerformanceReport): string {
    const r = report || this.generateReport();
    const lines = [
      'Performance Report',
      '==================',
      `Total Operations: ${r.totalOperations}`,
      `Completed: ${r.completedOperations} | Failed: ${r.failedOperations}`,
      `Average Duration: ${r.averageDuration.toFixed(2)}ms`,
      `Total Duration: ${r.totalDuration.toFixed(2)}ms`
    ];

    if (r.apiQuota) {
      lines.push('');
      lines.push('API Quota:');
      lines.push(
        `  Used: ${r.apiQuota.used}/${r.apiQuota.limit} (${r.apiQuota.percentUsed.toFixed(1)}%)`
      );
      lines.push(`  Remaining: ${r.apiQuota.remaining}`);
      lines.push(`  Resets at: ${r.apiQuota.resetAt.toISOString()}`);
    }

    return lines.join('\n');
  }
}

/**
 * Global performance tracker instance
 */
let globalTracker: PerformanceTracker | undefined;

/**
 * Get or create global performance tracker
 */
export function getPerformanceTracker(): PerformanceTracker {
  if (!globalTracker) {
    globalTracker = new PerformanceTracker();
  }
  return globalTracker;
}

/**
 * Track an async operation
 */
export async function trackOperation<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const tracker = getPerformanceTracker();
  const operationId = tracker.startOperation(name, metadata);

  try {
    const result = await fn();
    tracker.endOperation(operationId, 'completed');
    return result;
  } catch (error) {
    tracker.endOperation(operationId, 'failed');
    throw error;
  }
}
