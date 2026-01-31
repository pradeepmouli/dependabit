/**
 * Metrics calculator for false positive rate tracking
 * Implements 30-day rolling window analysis and trend detection
 */

export interface MetricsConfig {
  windowDays?: number;
  threshold?: number;
}

export interface FeedbackSummary {
  truePositives: number;
  falsePositives: number;
  total: number;
}

export interface DataPoint {
  date: string;
  falsePositiveRate: number;
}

export interface Trend {
  direction: 'improving' | 'worsening' | 'stable' | 'no-data';
  slope: number;
}

export interface ThresholdCheck {
  passed: boolean;
  rate: number;
  threshold: number;
}

export interface MetricsReport {
  currentRate: number;
  rollingAverage: number;
  trend: Trend;
  thresholdCheck: ThresholdCheck;
  totalFeedback: number;
}

/**
 * Calculator for false positive metrics with rolling window analysis
 */
export class MetricsCalculator {
  private windowDays: number;
  private threshold: number;

  constructor(config: MetricsConfig = {}) {
    this.windowDays = config.windowDays || 30;
    this.threshold = config.threshold || 0.1; // 10% default threshold
  }

  /**
   * Calculate false positive rate from feedback data
   */
  calculateFalsePositiveRate(feedback: FeedbackSummary): number {
    if (feedback.total === 0) {
      return 0;
    }
    return feedback.falsePositives / feedback.total;
  }

  /**
   * Calculate rolling average over the time window
   */
  calculateRollingAverage(
    dataPoints: DataPoint[],
    windowDays?: number,
    referenceDate?: Date
  ): number {
    const days = windowDays || this.windowDays;
    const endDate = referenceDate || new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    // Filter data points within the window
    const windowData = dataPoints.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= startDate && pointDate <= endDate;
    });

    if (windowData.length === 0) {
      return 0;
    }

    const sum = windowData.reduce((acc, point) => acc + point.falsePositiveRate, 0);
    return sum / windowData.length;
  }

  /**
   * Detect trend direction using linear regression
   */
  getTrend(dataPoints: DataPoint[]): Trend {
    if (dataPoints.length < 2) {
      return { direction: 'no-data', slope: 0 };
    }

    // Simple linear regression
    const n = dataPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    dataPoints.forEach((point, index) => {
      const x = index;
      const y = point.falsePositiveRate;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Determine direction based on slope
    let direction: Trend['direction'];
    if (Math.abs(slope) < 0.001) {
      direction = 'stable';
    } else if (slope < 0) {
      direction = 'improving';
    } else {
      direction = 'worsening';
    }

    return { direction, slope };
  }

  /**
   * Check if rate is within acceptable threshold
   */
  checkThreshold(rate: number, threshold?: number): ThresholdCheck {
    const targetThreshold = threshold !== undefined ? threshold : this.threshold;
    return {
      passed: rate <= targetThreshold,
      rate,
      threshold: targetThreshold
    };
  }

  /**
   * Generate comprehensive metrics report
   */
  generateReport(
    currentFeedback: FeedbackSummary,
    history: DataPoint[]
  ): MetricsReport {
    const currentRate = this.calculateFalsePositiveRate(currentFeedback);
    const rollingAverage = this.calculateRollingAverage(history);
    const trend = this.getTrend(history);
    const thresholdCheck = this.checkThreshold(rollingAverage);

    return {
      currentRate,
      rollingAverage,
      trend,
      thresholdCheck,
      totalFeedback: currentFeedback.total
    };
  }

  /**
   * Format rate as percentage string
   */
  formatRate(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
  }
}
