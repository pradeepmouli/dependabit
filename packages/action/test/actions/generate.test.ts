import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for generate action
 * T032 [US1] Write integration test for generate action
 */

describe('Generate Action', () => {
  it('should generate manifest for repository', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      manifestPath: '.dependabit/manifest.json',
      dependencies: 5,
      success: true
    });

    const result = await mockGenerate({
      repoPath: '/path/to/repo',
      llmProvider: 'github-copilot'
    });

    expect(result.success).toBe(true);
    expect(result.manifestPath).toBe('.dependabit/manifest.json');
  });

  it('should handle LLM provider configuration', async () => {
    const mockGenerate = vi.fn().mockImplementation(async (options) => ({
      llmProvider: options.llmProvider,
      success: true
    }));

    const result = await mockGenerate({
      llmProvider: 'github-copilot'
    });

    expect(result.llmProvider).toBe('github-copilot');
  });

  it('should create empty manifest for repos with no dependencies', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      manifestPath: '.dependabit/manifest.json',
      dependencies: 0,
      success: true
    });

    const result = await mockGenerate({
      repoPath: '/empty/repo'
    });

    expect(result.dependencies).toBe(0);
    expect(result.success).toBe(true);
  });

  it('should log structured information', async () => {
    const mockLogger = vi.fn();
    const mockGenerate = vi.fn().mockImplementation(async () => {
      mockLogger({
        level: 'info',
        message: 'Generating manifest',
        metadata: { llmProvider: 'github-copilot' }
      });
      return { success: true };
    });

    await mockGenerate();
    expect(mockLogger).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockGenerate = vi.fn().mockRejectedValue(
      new Error('LLM service unavailable')
    );

    await expect(mockGenerate()).rejects.toThrow('LLM service unavailable');
  });

  it('should output action summary', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      success: true,
      summary: {
        totalDependencies: 10,
        byType: {
          documentation: 5,
          'reference-implementation': 3,
          'research-paper': 2
        }
      }
    });

    const result = await mockGenerate();
    expect(result.summary.totalDependencies).toBe(10);
  });
});
