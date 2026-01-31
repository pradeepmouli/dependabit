import { describe, it, expect } from 'vitest';
import { normalizeHTML } from '../../src/normalizer.js';

describe('HTML Normalizer', () => {
  describe('normalizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<div>Content<script>alert("test")</script></div>';
      const result = normalizeHTML(html);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove style tags', () => {
      const html = '<div>Content<style>.class { color: red; }</style></div>';
      const result = normalizeHTML(html);
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('color: red');
    });

    it('should strip HTML comments', () => {
      const html = '<div>Content<!-- This is a comment --></div>';
      const result = normalizeHTML(html);
      expect(result).not.toContain('<!--');
      expect(result).not.toContain('-->');
    });

    it('should normalize whitespace', () => {
      const html = '<div>Content     with    multiple   spaces</div>';
      const result = normalizeHTML(html);
      expect(result).toContain('Content with multiple spaces');
    });

    it('should remove timestamp patterns', () => {
      const html = '<div>Updated: 2024-01-01 12:00:00</div><div>Last modified: Jan 1, 2024</div>';
      const result = normalizeHTML(html);
      expect(result).not.toContain('Updated:');
      expect(result).not.toContain('Last modified:');
    });

    it('should remove analytics tracking parameters', () => {
      const html = '<a href="https://example.com?utm_source=test&utm_campaign=ad">Link</a>';
      const result = normalizeHTML(html);
      expect(result).not.toContain('utm_source');
      expect(result).not.toContain('utm_campaign');
    });

    it('should preserve meaningful content', () => {
      const html = '<h1>API Documentation</h1><p>This is the main content.</p>';
      const result = normalizeHTML(html);
      expect(result).toContain('API Documentation');
      expect(result).toContain('This is the main content');
    });

    it('should handle empty input', () => {
      const result = normalizeHTML('');
      expect(result).toBe('');
    });

    it('should produce consistent output', () => {
      const html = '<div>Test<script>x()</script>  </div>';
      const result1 = normalizeHTML(html);
      const result2 = normalizeHTML(html);
      expect(result1).toBe(result2);
    });
  });
});
