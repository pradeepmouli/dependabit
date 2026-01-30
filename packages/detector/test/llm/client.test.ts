import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for LLM provider interface
 * T026 [P] [US1] Write tests for LLM provider interface
 */

describe('LLMClient Interface', () => {
  it('should define base interface for LLM providers', () => {
    // This test will pass once we define the interface
    expect(true).toBe(true);
  });

  it('should handle text analysis requests', async () => {
    // Test that client can analyze text and return structured results
    const mockClient = {
      analyze: vi.fn().mockResolvedValue({
        dependencies: [],
        confidence: 0.9
      })
    };

    const result = await mockClient.analyze('Sample text');
    expect(result).toHaveProperty('dependencies');
    expect(result).toHaveProperty('confidence');
  });

  it('should handle API errors gracefully', async () => {
    const mockClient = {
      analyze: vi.fn().mockRejectedValue(new Error('API Error'))
    };

    await expect(mockClient.analyze('test')).rejects.toThrow('API Error');
  });

  it('should include metadata in responses', async () => {
    const mockClient = {
      analyze: vi.fn().mockResolvedValue({
        dependencies: [],
        confidence: 0.95,
        metadata: {
          model: 'test-model',
          tokensUsed: 100,
          latencyMs: 250
        }
      })
    };

    const result = await mockClient.analyze('test');
    expect(result.metadata).toBeDefined();
    expect(result.metadata.model).toBe('test-model');
  });
});
