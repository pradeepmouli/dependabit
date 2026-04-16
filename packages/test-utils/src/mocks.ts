/**
 * Mock utilities for testing
 * @packageDocumentation
 */

import { vi } from 'vitest';

/**
 * Creates a Vitest mock function.
 * @returns A `vi.fn()` spy ready to be configured.
 * @category Test Utilities
 * @example
 * ```ts
 * const mockFn = createMockFn()
 *   .mockResolvedValue('test');
 * ```
 */
export function createMockFn(): ReturnType<typeof vi.fn> {
  return vi.fn();
}

/**
 * Creates a Vitest spy on an object method.
 * @param obj - Object to spy on.
 * @param method - Method name to spy on.
 * @category Test Utilities
 * @example
 * ```ts
 * const consoleSpy = spyOn(console, 'log');
 * console.log('test');
 * expect(consoleSpy).toHaveBeenCalledWith('test');
 * ```
 */
export function spyOn<T extends object, K extends keyof T>(
  obj: T,
  method: K
): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(obj, method as any);
}

/**
 * Activates Vitest fake timers and returns a helper object.
 * @remarks Call `restore()` in an `afterEach` hook to reset real timers.
 * @category Test Utilities
 * @example
 * ```ts
 * const timer = createMockTimer();
 * timer.runAll();
 * ```
 */
export function createMockTimer() {
  vi.useFakeTimers();
  return {
    runAll: () => vi.runAllTimers(),
    runOnlyPendingTimers: () => vi.runOnlyPendingTimers(),
    advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
    restore: () => vi.useRealTimers()
  };
}

/**
 * Replaces the global `fetch` with a Vitest mock that returns `response`
 * as JSON when `url` is requested.
 * @param url - The URL string to match.
 * @param response - JSON-serialisable response body.
 * @remarks This mutates `global.fetch`; reset it in `afterEach` with
 * `vi.restoreAllMocks()`.
 * @category Test Utilities
 * @example
 * ```ts
 * mockFetch('/api/users', { success: true });
 * const res = await fetch('/api/users');
 * expect(res.json()).resolves.toEqual({ success: true });
 * ```
 */
export function mockFetch(url: string, response: any) {
  global.fetch = vi.fn((fetchUrl) => {
    if (fetchUrl === url) {
      return Promise.resolve(
        new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    return Promise.reject(new Error('Not mocked'));
  });
}
