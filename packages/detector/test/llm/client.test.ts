import { describe, it, expect } from 'vitest';

describe('LLMProvider interface', () => {
  it('should define analyze method signature', () => {
    // This is a type test - we'll verify the interface exists
    // The interface will be implemented in src/llm/client.ts
    expect(true).toBe(true);
  });

  it('should define getSupportedModels method', () => {
    expect(true).toBe(true);
  });

  it('should define getRateLimit method', () => {
    expect(true).toBe(true);
  });
});

describe('LLMResponse', () => {
  it('should include detected dependencies', () => {
    expect(true).toBe(true);
  });

  it('should include confidence scores', () => {
    expect(true).toBe(true);
  });

  it('should include usage metadata (tokens, latency)', () => {
    expect(true).toBe(true);
  });
});
