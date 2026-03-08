import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidEmail, createSuccessResponse, createErrorResponse, delay } from './index';

describe('Core Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('API Response Helpers', () => {
    it('should create success response', () => {
      const data = { id: 1, name: 'John' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    it('should create error response', () => {
      const response = createErrorResponse('Not found');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Not found');
      expect(response.data).toBeUndefined();
    });
  });

  describe('delay', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay execution', async () => {
      vi.useFakeTimers();

      let resolved = false;
      const promise = delay(100).then(() => {
        resolved = true;
      });

      // Flush microtasks - promise should still be pending before timers advance
      await Promise.resolve();
      expect(resolved).toBe(false);

      vi.advanceTimersByTime(100);
      await promise;

      expect(resolved).toBe(true);
    });
  });
});
