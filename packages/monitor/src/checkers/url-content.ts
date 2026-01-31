/**
 * URL Content Checker
 * Monitors documentation URLs for content changes using SHA256 hashing
 */

import { Checker, DependencySnapshot, ChangeDetection, AccessConfig } from '../types.js';
import { normalizeHTML } from '../normalizer.js';
import crypto from 'node:crypto';

export class URLContentChecker implements Checker {
  /**
   * Fetches and hashes URL content
   */
  async fetch(config: AccessConfig): Promise<DependencySnapshot> {
    const { url } = config;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'dependabit-monitor/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();

      let normalizedContent: string;

      // Apply HTML normalization if content is HTML
      if (contentType.includes('text/html') || content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
        normalizedContent = normalizeHTML(content);
      } else {
        // For non-HTML content (markdown, plain text, etc.), just normalize whitespace
        normalizedContent = content.replace(/\s+/g, ' ').trim();
      }

      // Generate SHA256 hash of normalized content
      const stateHash = crypto
        .createHash('sha256')
        .update(normalizedContent)
        .digest('hex');

      return {
        stateHash,
        fetchedAt: new Date(),
        metadata: {
          contentType,
          contentLength: content.length,
          normalizedLength: normalizedContent.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch URL content: ${(error as Error).message}`);
    }
  }

  /**
   * Compares two snapshots to detect content changes
   */
  async compare(prev: DependencySnapshot, curr: DependencySnapshot): Promise<ChangeDetection> {
    const changes: string[] = [];

    // Content changed if hashes differ
    if (prev.stateHash !== curr.stateHash) {
      changes.push('content');
    }

    return {
      hasChanged: changes.length > 0,
      changes
    };
  }
}
