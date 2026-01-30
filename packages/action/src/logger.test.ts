import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as core from '@actions/core';
import { Logger, LogLevel, createLogger, withTiming } from '../src/logger.js';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  startGroup: vi.fn(),
  endGroup: vi.fn()
}));

describe('Logger Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logger', () => {
    it('should create logger with auto-generated correlation ID', () => {
      const logger = new Logger();
      expect(logger.getCorrelationId()).toBeDefined();
      expect(logger.getCorrelationId()).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should create logger with custom correlation ID', () => {
      const logger = new Logger({ correlationId: 'test-123' });
      expect(logger.getCorrelationId()).toBe('test-123');
    });

    it('should log info messages with JSON formatting', () => {
      const logger = new Logger({ correlationId: 'test-123' });
      logger.info('Test message', { key: 'value' });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test message"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"correlationId":"test-123"')
      );
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('"key":"value"'));
    });

    it('should log warning messages', () => {
      const logger = new Logger();
      logger.warning('Warning message');

      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warning"')
      );
      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Warning message"')
      );
    });

    it('should log error messages', () => {
      const logger = new Logger();
      logger.error('Error message');

      expect(core.error).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));
      expect(core.error).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Error message"')
      );
    });

    it('should only log debug when enabled', () => {
      const logger1 = new Logger({ enableDebug: false });
      logger1.debug('Debug message');
      expect(core.debug).not.toHaveBeenCalled();

      const logger2 = new Logger({ enableDebug: true });
      logger2.debug('Debug message');
      expect(core.debug).toHaveBeenCalledWith(
        expect.stringContaining('"level":"debug"')
      );
    });

    it('should start and end log groups', () => {
      const logger = new Logger();
      logger.startGroup('Test Group');
      expect(core.startGroup).toHaveBeenCalledWith('Test Group');

      logger.endGroup();
      expect(core.endGroup).toHaveBeenCalled();
    });

    it('should create child logger with same correlation ID', () => {
      const parent = new Logger({ correlationId: 'parent-123' });
      const child = parent.child();

      expect(child.getCorrelationId()).toBe('parent-123');
    });

    it('should log LLM interactions', () => {
      const logger = new Logger();
      logger.logLLMInteraction({
        provider: 'github-copilot',
        model: 'gpt-4',
        prompt: 'Test prompt',
        response: 'Test response',
        tokens: 100,
        latencyMs: 500
      });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"type":"llm_interaction"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"provider":"github-copilot"')
      );
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('"tokens":100'));
    });

    it('should log API calls', () => {
      const logger = new Logger();
      logger.logAPICall({
        endpoint: '/repos/owner/repo',
        method: 'GET',
        statusCode: 200,
        latencyMs: 300,
        rateLimit: {
          remaining: 4999,
          limit: 5000,
          reset: 1609459200
        }
      });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"type":"api_call"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"/repos/owner/repo"')
      );
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('"statusCode":200'));
    });

    it('should log operation duration', () => {
      const logger = new Logger();
      logger.logDuration('test-operation', 1234, { result: 'success' });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"type":"operation_duration"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"test-operation"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"durationMs":1234')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"result":"success"')
      );
    });
  });

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getCorrelationId()).toBeDefined();
    });

    it('should accept configuration', () => {
      const logger = createLogger({ correlationId: 'custom-id' });
      expect(logger.getCorrelationId()).toBe('custom-id');
    });
  });

  describe('withTiming', () => {
    it('should measure and log successful operation', async () => {
      const logger = new Logger();
      const fn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'result';
      });

      const result = await withTiming(logger, 'test-operation', fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"test-operation"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"durationMs":')
      );
    });

    it('should measure and log failed operation', async () => {
      const logger = new Logger();
      const error = new Error('Test error');
      const fn = vi.fn(async () => {
        throw error;
      });

      await expect(withTiming(logger, 'test-operation', fn)).rejects.toThrow(
        'Test error'
      );

      expect(fn).toHaveBeenCalled();
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"test-operation"')
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Test error"')
      );
    });
  });
});
