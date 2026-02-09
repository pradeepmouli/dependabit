import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCalculator } from '../../src/utils/metrics.js';

describe('MetricsCalculator', () => {
  let calculator: MetricsCalculator;

  beforeEach(() => {
    calculator = new MetricsCalculator();
  });

  describe('constructor', () => {
    it('should create calculator instance', () => {
      expect(calculator).toBeInstanceOf(MetricsCalculator);
    });

    it('should accept custom window size', () => {
      const calc = new MetricsCalculator({ windowDays: 60 });
      expect(calc).toBeInstanceOf(MetricsCalculator);
    });
  });

  describe('calculateFalsePositiveRate', () => {
    it('should calculate rate from feedback data', () => {
      const feedback = {
        truePositives: 90,
        falsePositives: 10,
        total: 100
      };

      const rate = calculator.calculateFalsePositiveRate(feedback);

      expect(rate).toBe(0.1); // 10%
    });

    it('should return 0 for no feedback', () => {
      const feedback = {
        truePositives: 0,
        falsePositives: 0,
        total: 0
      };

      const rate = calculator.calculateFalsePositiveRate(feedback);

      expect(rate).toBe(0);
    });

    it('should handle 100% false positives', () => {
      const feedback = {
        truePositives: 0,
        falsePositives: 50,
        total: 50
      };

      const rate = calculator.calculateFalsePositiveRate(feedback);

      expect(rate).toBe(1.0);
    });
  });

  describe('calculateRollingAverage', () => {
    it('should calculate 30-day rolling average', () => {
      const referenceDate = new Date('2026-01-25');
      const dataPoints = [
        { date: '2026-01-01', falsePositiveRate: 0.1 },
        { date: '2026-01-10', falsePositiveRate: 0.15 },
        { date: '2026-01-20', falsePositiveRate: 0.05 }
      ];

      const average = calculator.calculateRollingAverage(dataPoints, 30, referenceDate);

      expect(average).toBeCloseTo(0.1, 2); // (0.1 + 0.15 + 0.05) / 3
    });

    it('should return 0 for empty data', () => {
      const average = calculator.calculateRollingAverage([]);
      expect(average).toBe(0);
    });

    it('should filter data outside window', () => {
      const now = new Date('2026-01-31');
      const dataPoints = [
        { date: '2025-12-15', falsePositiveRate: 0.5 }, // Outside 30-day window
        { date: '2026-01-20', falsePositiveRate: 0.1 }  // Inside window
      ];

      const average = calculator.calculateRollingAverage(dataPoints, 30, now);

      expect(average).toBe(0.1); // Only includes recent data
    });
  });

  describe('getTrend', () => {
    it('should detect improving trend', () => {
      const dataPoints = [
        { date: '2026-01-01', falsePositiveRate: 0.2 },
        { date: '2026-01-10', falsePositiveRate: 0.15 },
        { date: '2026-01-20', falsePositiveRate: 0.1 },
        { date: '2026-01-30', falsePositiveRate: 0.05 }
      ];

      const trend = calculator.getTrend(dataPoints);

      expect(trend.direction).toBe('improving');
      expect(trend.slope).toBeLessThan(0);
    });

    it('should detect worsening trend', () => {
      const dataPoints = [
        { date: '2026-01-01', falsePositiveRate: 0.05 },
        { date: '2026-01-10', falsePositiveRate: 0.1 },
        { date: '2026-01-20', falsePositiveRate: 0.15 },
        { date: '2026-01-30', falsePositiveRate: 0.2 }
      ];

      const trend = calculator.getTrend(dataPoints);

      expect(trend.direction).toBe('worsening');
      expect(trend.slope).toBeGreaterThan(0);
    });

    it('should detect stable trend', () => {
      const dataPoints = [
        { date: '2026-01-01', falsePositiveRate: 0.1 },
        { date: '2026-01-10', falsePositiveRate: 0.1 },
        { date: '2026-01-20', falsePositiveRate: 0.1 },
        { date: '2026-01-30', falsePositiveRate: 0.1 }
      ];

      const trend = calculator.getTrend(dataPoints);

      expect(trend.direction).toBe('stable');
      expect(Math.abs(trend.slope)).toBeLessThan(0.01);
    });

    it('should return no-data for insufficient data', () => {
      const dataPoints = [
        { date: '2026-01-01', falsePositiveRate: 0.1 }
      ];

      const trend = calculator.getTrend(dataPoints);

      expect(trend.direction).toBe('no-data');
    });
  });

  describe('checkThreshold', () => {
    it('should pass when rate is below threshold', () => {
      const result = calculator.checkThreshold(0.05, 0.1);

      expect(result.passed).toBe(true);
      expect(result.rate).toBe(0.05);
      expect(result.threshold).toBe(0.1);
    });

    it('should fail when rate exceeds threshold', () => {
      const result = calculator.checkThreshold(0.15, 0.1);

      expect(result.passed).toBe(false);
      expect(result.rate).toBe(0.15);
      expect(result.threshold).toBe(0.1);
    });

    it('should use default threshold of 0.1', () => {
      const result = calculator.checkThreshold(0.05);

      expect(result.threshold).toBe(0.1);
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive metrics report', () => {
      const feedback = {
        truePositives: 90,
        falsePositives: 10,
        total: 100
      };

      const history = [
        { date: '2026-01-01', falsePositiveRate: 0.15 },
        { date: '2026-01-15', falsePositiveRate: 0.12 },
        { date: '2026-01-30', falsePositiveRate: 0.1 }
      ];

      const report = calculator.generateReport(feedback, history);

      expect(report.currentRate).toBe(0.1);
      expect(report.rollingAverage).toBeCloseTo(0.123, 1); // Less precise check
      expect(report.trend.direction).toBe('improving');
      expect(report.thresholdCheck.passed).toBe(false); // Average > 0.1 threshold
      expect(report.totalFeedback).toBe(100);
    });

    it('should handle empty history', () => {
      const feedback = {
        truePositives: 95,
        falsePositives: 5,
        total: 100
      };

      const report = calculator.generateReport(feedback, []);

      expect(report.currentRate).toBe(0.05);
      expect(report.rollingAverage).toBe(0);
      expect(report.trend.direction).toBe('no-data');
    });
  });

  describe('formatRate', () => {
    it('should format rate as percentage', () => {
      expect(calculator.formatRate(0.1)).toBe('10.0%');
      expect(calculator.formatRate(0.05)).toBe('5.0%');
      expect(calculator.formatRate(0.123)).toBe('12.3%');
    });

    it('should handle zero', () => {
      expect(calculator.formatRate(0)).toBe('0.0%');
    });

    it('should handle 100%', () => {
      expect(calculator.formatRate(1.0)).toBe('100.0%');
    });
  });
});
