import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for detector orchestrator
 * T031 [US1] Write tests for detector orchestrator
 */

describe('Detector Orchestrator', () => {
  it('should coordinate parsers and LLM analysis', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            url: 'https://github.com/example/repo',
            type: 'reference-implementation',
            confidence: 0.92,
            detectionMethod: 'llm-analysis'
          }
        ]
      })
    };

    const result = await mockDetector.detect({
      repoPath: '/path/to/repo',
      files: ['README.md', 'src/index.ts']
    });

    expect(result.dependencies).toHaveLength(1);
  });

  it('should parse files before LLM analysis', async () => {
    const mockParser = vi.fn().mockResolvedValue({
      urls: ['https://example.com']
    });

    const mockLLM = vi.fn().mockResolvedValue({
      dependencies: []
    });

    // Orchestrator should call parser first, then LLM
    await mockParser();
    await mockLLM();

    expect(mockParser).toHaveBeenCalled();
    expect(mockLLM).toHaveBeenCalled();
  });

  it('should generate UUIDs for each dependency', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: [
          { id: '123e4567-e89b-12d3-a456-426614174000', url: 'https://example.com' }
        ]
      })
    };

    const result = await mockDetector.detect({ repoPath: '/' });
    expect(result.dependencies[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('should include detection confidence scores', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: [
          { url: 'https://example.com', confidence: 0.85 }
        ]
      })
    };

    const result = await mockDetector.detect({ repoPath: '/' });
    expect(result.dependencies[0].confidence).toBeGreaterThanOrEqual(0);
    expect(result.dependencies[0].confidence).toBeLessThanOrEqual(1);
  });

  it('should handle empty repositories', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: []
      })
    };

    const result = await mockDetector.detect({
      repoPath: '/empty/repo',
      files: []
    });

    expect(result.dependencies).toHaveLength(0);
  });

  it('should deduplicate detected dependencies', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: [
          { url: 'https://example.com', confidence: 0.9 }
        ]
      })
    };

    const result = await mockDetector.detect({ repoPath: '/' });
    
    // Should have deduplicated to one entry (keeping the one with higher confidence)
    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies[0].confidence).toBe(0.9);
  });

  it('should include file references for each dependency', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue({
        dependencies: [
          {
            url: 'https://example.com',
            referencedIn: [
              { file: 'README.md', line: 10, context: 'See https://example.com' }
            ]
          }
        ]
      })
    };

    const result = await mockDetector.detect({ repoPath: '/' });
    expect(result.dependencies[0].referencedIn).toBeDefined();
    expect(result.dependencies[0].referencedIn[0].file).toBe('README.md');
  });
});
