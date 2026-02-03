import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackListener } from '../src/feedback.js';
import type { IssueManagerInterface } from '../src/feedback.js';

describe('FeedbackListener', () => {
  let mockIssueManager: IssueManagerInterface;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock IssueManager
    mockIssueManager = {
      listIssues: vi.fn(),
      getIssue: vi.fn()
    } as IssueManagerInterface;
  });

  describe('constructor', () => {
    it('should create listener with issue manager', () => {
      const listener = new FeedbackListener(mockIssueManager);
      expect(listener).toBeInstanceOf(FeedbackListener);
    });

    it('should accept custom labels', () => {
      const config = {
        truePositiveLabel: 'confirmed',
        falsePositiveLabel: 'not-a-bug'
      };
      const listener = new FeedbackListener(mockIssueManager, config);
      expect(listener).toBeInstanceOf(FeedbackListener);
    });
  });

  describe('collectFeedback', () => {
    it('should collect issues with feedback labels', async () => {
      const mockIssues = [
        { number: 1, labels: ['false-positive'], title: 'Test 1', created_at: '2026-01-01' },
        { number: 2, labels: ['true-positive'], title: 'Test 2', created_at: '2026-01-02' },
        { number: 3, labels: ['false-positive'], title: 'Test 3', created_at: '2026-01-03' }
      ];

      vi.mocked(mockIssueManager.listIssues).mockResolvedValue(mockIssues as any);

      const listener = new FeedbackListener(mockIssueManager);
      const feedback = await listener.collectFeedback();

      expect(feedback.truePositives).toHaveLength(1);
      expect(feedback.falsePositives).toHaveLength(2);
      expect(feedback.total).toBe(3);
    });

    it('should filter by date range', async () => {
      const mockIssues = [
        { 
          number: 1, 
          labels: ['false-positive'], 
          title: 'Old issue', 
          created_at: '2025-12-01T00:00:00Z' 
        },
        { 
          number: 2, 
          labels: ['false-positive'], 
          title: 'Recent issue', 
          created_at: '2026-01-25T00:00:00Z' 
        }
      ];

      vi.mocked(mockIssueManager.listIssues).mockResolvedValue(mockIssues as any);

      const listener = new FeedbackListener(mockIssueManager);
      const startDate = new Date('2026-01-01');
      const feedback = await listener.collectFeedback({ startDate });

      expect(feedback.falsePositives).toHaveLength(1);
      expect(feedback.falsePositives[0].number).toBe(2);
    });

    it('should handle empty results', async () => {
      vi.mocked(mockIssueManager.listIssues).mockResolvedValue([]);

      const listener = new FeedbackListener(mockIssueManager);
      const feedback = await listener.collectFeedback();

      expect(feedback.truePositives).toHaveLength(0);
      expect(feedback.falsePositives).toHaveLength(0);
      expect(feedback.total).toBe(0);
    });

    it('should filter by repository', async () => {
      const mockIssues = [
        { number: 1, labels: ['false-positive'], title: 'Test', repository: 'owner/repo1' },
        { number: 2, labels: ['false-positive'], title: 'Test', repository: 'owner/repo2' }
      ];

      vi.mocked(mockIssueManager.listIssues).mockResolvedValue(mockIssues as any);

      const listener = new FeedbackListener(mockIssueManager);
      const feedback = await listener.collectFeedback({ repository: 'owner/repo1' });

      expect(feedback.falsePositives).toHaveLength(1);
    });
  });

  describe('getFeedbackRate', () => {
    it('should calculate false positive rate', async () => {
      const mockIssues = [
        { number: 1, labels: ['false-positive'], title: 'FP1' },
        { number: 2, labels: ['true-positive'], title: 'TP1' },
        { number: 3, labels: ['true-positive'], title: 'TP2' },
        { number: 4, labels: ['false-positive'], title: 'FP2' }
      ];

      vi.mocked(mockIssueManager.listIssues).mockResolvedValue(mockIssues as any);

      const listener = new FeedbackListener(mockIssueManager);
      const rate = await listener.getFeedbackRate();

      expect(rate.falsePositiveRate).toBe(0.5); // 2 FP out of 4 total
      expect(rate.truePositiveRate).toBe(0.5); // 2 TP out of 4 total
      expect(rate.totalFeedback).toBe(4);
    });

    it('should return 0 for empty feedback', async () => {
      vi.mocked(mockIssueManager.listIssues).mockResolvedValue([]);

      const listener = new FeedbackListener(mockIssueManager);
      const rate = await listener.getFeedbackRate();

      expect(rate.falsePositiveRate).toBe(0);
      expect(rate.truePositiveRate).toBe(0);
      expect(rate.totalFeedback).toBe(0);
    });
  });

  describe('getRecentFeedback', () => {
    it('should get feedback from last 30 days', async () => {
      const now = new Date('2026-01-31');
      const mockIssues = [
        { 
          number: 1, 
          labels: ['false-positive'], 
          title: 'Recent', 
          created_at: '2026-01-20T00:00:00Z' 
        },
        { 
          number: 2, 
          labels: ['false-positive'], 
          title: 'Old', 
          created_at: '2025-12-15T00:00:00Z' 
        }
      ];

      vi.mocked(mockIssueManager.listIssues).mockResolvedValue(mockIssues as any);

      const listener = new FeedbackListener(mockIssueManager);
      const feedback = await listener.getRecentFeedback(30, now);

      expect(feedback.falsePositives).toHaveLength(1);
      expect(feedback.falsePositives[0].number).toBe(1);
    });

    it('should default to current date', async () => {
      vi.mocked(mockIssueManager.listIssues).mockResolvedValue([]);

      const listener = new FeedbackListener(mockIssueManager);
      const feedback = await listener.getRecentFeedback(30);

      expect(feedback).toBeDefined();
    });
  });

  describe('monitorIssue', () => {
    it('should check if issue has feedback label', async () => {
      const issue = {
        number: 1,
        labels: ['false-positive'],
        title: 'Test'
      };

      vi.mocked(mockIssueManager.getIssue).mockResolvedValue(issue as any);

      const listener = new FeedbackListener(mockIssueManager);
      const hasFeedback = await listener.monitorIssue(1);

      expect(hasFeedback).toBe(true);
    });

    it('should return false for issues without feedback labels', async () => {
      const issue = {
        number: 1,
        labels: ['bug', 'enhancement'],
        title: 'Test'
      };

      vi.mocked(mockIssueManager.getIssue).mockResolvedValue(issue as any);

      const listener = new FeedbackListener(mockIssueManager);
      const hasFeedback = await listener.monitorIssue(1);

      expect(hasFeedback).toBe(false);
    });
  });
});
