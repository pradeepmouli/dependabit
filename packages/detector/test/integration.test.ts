/**
 * Integration Test for Detector
 * Tests the full detection pipeline
 */

import { describe, it, expect } from 'vitest';
import { Detector } from '../src/detector.js';
import type { LLMClient, LLMAnalysisResult } from '../src/llm/client.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Mock LLM client for testing
 */
class MockLLMClient implements LLMClient {
  async analyze(content: string): Promise<LLMAnalysisResult> {
    // Simple URL extraction for testing
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
    const matches = content.matchAll(urlRegex);
    const dependencies = [];

    for (const match of matches) {
      const url = match[0];
      dependencies.push({
        url,
        type: this.classifyUrl(url),
        name: this.extractName(url),
        confidence: 0.85
      });
    }

    return {
      dependencies,
      confidence: 0.85,
      metadata: {
        model: 'mock',
        tokensUsed: 100,
        latencyMs: 10,
        provider: 'mock'
      }
    };
  }

  getProvider(): string {
    return 'mock';
  }

  private classifyUrl(url: string): string {
    if (url.includes('arxiv.org')) return 'research-paper';
    if (url.includes('github.com')) return 'reference-implementation';
    if (url.includes('/docs') || url.includes('/api')) return 'documentation';
    return 'other';
  }

  private extractName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }
}

describe('Detector Integration Tests', () => {
  it('should detect dependencies from a sample project', async () => {
    // Create a temporary test project
    const testDir = join(tmpdir(), `test-repo-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Create a README with external references
    const readmeContent = `
# Test Project

This project uses several external resources:

- Documentation: https://docs.example.com/api
- Research paper: https://arxiv.org/abs/1234.5678
- Reference implementation: https://github.com/example/reference-impl

## Installation

See the [API Guide](https://api.example.com/guide) for details.
`;

    await writeFile(join(testDir, 'README.md'), readmeContent);

    // Create a source file with code comments
    const sourceContent = `
/**
 * Implementation based on:
 * https://arxiv.org/abs/1234.5678
 */

// See: https://github.com/example/reference-impl
function algorithm() {
  // Implementation details
  return 42;
}
`;

    await writeFile(join(testDir, 'src.ts'), sourceContent);

    // Run detection with mock LLM client
    const detector = new Detector({
      repoPath: testDir,
      maxDepth: 2,
      llmClient: new MockLLMClient()
    });

    const result = await detector.detect();

    // Validate results
    expect(result.dependencies.length).toBeGreaterThan(0);
    expect(result.statistics.totalFiles).toBeGreaterThan(0);
    expect(result.statistics.parsedFiles).toBeGreaterThan(0);

    // Check that we found the expected URLs
    const urls = result.dependencies.map((d) => d.url);
    expect(urls.some((url) => url.includes('docs.example.com'))).toBe(true);
    expect(urls.some((url) => url.includes('arxiv.org'))).toBe(true);
    expect(urls.some((url) => url.includes('github.com/example'))).toBe(true);

    // Check confidence scores
    for (const dep of result.dependencies) {
      expect(dep.detectionConfidence).toBeGreaterThanOrEqual(0);
      expect(dep.detectionConfidence).toBeLessThanOrEqual(1);
    }

    // Check that dependencies have required fields
    for (const dep of result.dependencies) {
      expect(dep.id).toBeDefined();
      expect(dep.url).toBeDefined();
      expect(dep.type).toBeDefined();
      expect(dep.accessMethod).toBeDefined();
      expect(dep.name).toBeDefined();
      expect(dep.referencedIn).toBeDefined();
      expect(dep.referencedIn.length).toBeGreaterThan(0);
    }
  }, 30000); // 30 second timeout for integration test
});
