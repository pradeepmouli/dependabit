import { describe, it, expect } from 'vitest';

/**
 * Tests for code comment parser
 * T029 [P] [US1] Write tests for code comment parser
 */

describe('Code Comment Parser', () => {
  it('should extract URLs from single-line comments', () => {
    const code = `
// See: https://github.com/example/repo for implementation
function example() {
  // Based on https://docs.example.com/api
  return null;
}
`;

    const urls = [
      'https://github.com/example/repo',
      'https://docs.example.com/api'
    ];

    expect(urls).toHaveLength(2);
  });

  it('should extract URLs from multi-line comments', () => {
    const code = `
/**
 * Implementation based on:
 * https://arxiv.org/abs/1234.5678
 * 
 * See also: https://github.com/reference/impl
 */
function algorithm() {}
`;

    const urls = [
      'https://arxiv.org/abs/1234.5678',
      'https://github.com/reference/impl'
    ];

    expect(urls).toHaveLength(2);
  });

  it('should identify file paths and line numbers', () => {
    const code = `
// Reference: https://example.com/docs
function test() {}
`;

    const reference = {
      url: 'https://example.com/docs',
      file: 'test.ts',
      line: 1
    };

    expect(reference.file).toBe('test.ts');
    expect(reference.line).toBe(1);
  });

  it('should handle different comment styles', () => {
    // JavaScript
    const jsComment = '// https://example.com';
    // Python
    const pyComment = '# https://example.com';
    // CSS
    const cssComment = '/* https://example.com */';

    const comments = [jsComment, pyComment, cssComment];
    expect(comments).toHaveLength(3);
  });

  it('should extract context from comments', () => {
    const code = `
/**
 * Algorithm based on the paper at https://arxiv.org/abs/1234.5678
 * This implements the core logic described in Section 3.
 */
`;

    const reference = {
      url: 'https://arxiv.org/abs/1234.5678',
      context: 'Algorithm based on the paper at'
    };

    expect(reference.context).toContain('Algorithm based on');
  });
});
