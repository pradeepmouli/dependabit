import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promisify } from 'node:util';
import { GitHubCopilotProvider } from '../../src/llm/copilot.js';
import type { DetectedDependency } from '../../src/llm/client.js';

// Mock child_process with proper execFile behavior
vi.mock('node:child_process', () => {
  const mockCallback = vi.fn();
  
  // The custom promisify implementation that mimics Node.js behavior
  const customPromisify = vi.fn((...args) => {
    return new Promise((resolve, reject) => {
      // Call the mock with a callback that converts to { stdout, stderr }
      mockCallback(...args, (err: Error | null, stdout: string, stderr: string) => {
        if (err) {
          const error = err as any;
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  });
  
  mockCallback[promisify.custom] = customPromisify;
  
  return {
    execFile: mockCallback
  };
});

import { execFile } from 'node:child_process';
const mockExecFileCallback = vi.mocked(execFile);

describe('GitHubCopilotProvider', () => {
  let provider: GitHubCopilotProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GitHubCopilotProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CLI invocation', () => {
    it('should use execFile with correct command and flags', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          // Use correct callback signature: callback(error, stdout, stderr)
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      await provider.analyze('test content', 'test prompt');

      expect(mockExecFileCallback).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          'copilot',
          '-p',
          expect.any(String),
          '--silent',
          '--allow-all-tools'
        ]),
        expect.objectContaining({
          maxBuffer: 10 * 1024 * 1024,
          timeout: 60000
        }),
        expect.any(Function)
      );
    });

    it('should pass prompt directly without shell escaping', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const promptWithSpecialChars = 'test "quotes" $dollar `backtick`';
      await provider.analyze('content', promptWithSpecialChars);

      const callArgs = mockExecFileCallback.mock.calls[0];
      const args = callArgs?.[1] as string[];
      const fullPrompt = args?.[2];

      // Verify prompt contains special characters unescaped
      expect(fullPrompt).toContain('test "quotes" $dollar `backtick`');
    });

    it('should handle prompts with newlines', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const promptWithNewlines = 'line1\nline2\nline3';
      await provider.analyze('content', promptWithNewlines);

      const callArgs = mockExecFileCallback.mock.calls[0];
      const args = callArgs?.[1] as string[];
      const fullPrompt = args?.[2];

      expect(fullPrompt).toContain('line1\nline2\nline3');
    });

    it('should handle prompts ending with backslash', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const promptWithBackslash = 'path\\to\\file\\';
      await provider.analyze('content', promptWithBackslash);

      const callArgs = mockExecFileCallback.mock.calls[0];
      const args = callArgs?.[1] as string[];
      const fullPrompt = args?.[2];

      expect(fullPrompt).toContain('path\\to\\file\\');
    });
  });

  describe('response parsing', () => {
    it('should parse JSON response correctly', async () => {
      const mockDeps: DetectedDependency[] = [
        {
          name: 'test-package',
          version: '1.0.0',
          type: 'npm',
          confidence: 0.9,
          context: 'test context'
        }
      ];
      const mockResponse = JSON.stringify({ dependencies: mockDeps });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual(mockDeps);
    });

    it('should parse JSON wrapped in markdown code blocks', async () => {
      const mockDeps: DetectedDependency[] = [
        {
          name: 'test-package',
          version: '1.0.0',
          type: 'npm',
          confidence: 0.9,
          context: 'test context'
        }
      ];
      const mockResponse = '```json\n' + JSON.stringify({ dependencies: mockDeps }) + '\n```';
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual(mockDeps);
    });

    it('should handle malformed JSON gracefully', async () => {
      const mockResponse = 'not valid json';
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
    });

    it('should return empty dependencies on empty response', async () => {
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, '', '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle CLI execution errors', async () => {
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('CLI error'), '', 'Error message');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
      expect(result.rawResponse).toContain('CLI error');
    });

    it('should handle stderr without stdout as error', async () => {
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, '', 'Authentication failed');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
    });

    it('should handle timeout errors', async () => {
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          const error = new Error('Command timeout') as NodeJS.ErrnoException;
          error.code = 'ETIMEDOUT';
          callback(error, '', '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
    });

    it('should handle buffer overflow errors', async () => {
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          const error = new Error('maxBuffer exceeded') as NodeJS.ErrnoException;
          error.code = 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
          callback(error, '', '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.dependencies).toEqual([]);
    });
  });

  describe('usage metadata', () => {
    it('should include usage metadata in response', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const result = await provider.analyze('content', 'prompt');

      expect(result.usage).toBeDefined();
      expect(result.usage.promptTokens).toBeGreaterThan(0);
      expect(result.usage.completionTokens).toBeGreaterThan(0);
      expect(result.usage.totalTokens).toBeGreaterThan(0);
      expect(result.usage.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should use configured model in usage metadata', async () => {
      const mockResponse = JSON.stringify({ dependencies: [] });
      mockExecFileCallback.mockImplementation((file, args, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockResponse, '');
        }
        return {} as any;
      });

      const customProvider = new GitHubCopilotProvider({ model: 'gpt-4-turbo' });
      const result = await customProvider.analyze('content', 'prompt');

      expect(result.usage.model).toBe('gpt-4-turbo');
    });
  });

  describe('getSupportedModels', () => {
    it('should return list of supported models', () => {
      const models = provider.getSupportedModels();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('github-copilot');
    });
  });

  describe('getRateLimit', () => {
    it('should return rate limit info', async () => {
      const rateLimit = await provider.getRateLimit();

      expect(rateLimit).toBeDefined();
      expect(rateLimit.remaining).toBe(-1);
      expect(rateLimit.limit).toBe(-1);
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration', () => {
      const isValid = provider.validateConfig();

      expect(typeof isValid).toBe('boolean');
    });
  });
});
