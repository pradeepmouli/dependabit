/**
 * arXiv Checker
 * Monitors arXiv preprints for version updates
 *
 * arXiv is an open-access repository for research papers.
 * This checker tracks paper versions (v1, v2, etc.) using the arXiv API.
 */

import crypto from 'node:crypto';

/**
 * arXiv API configuration
 */
export interface ArxivConfig {
  url: string;
  arxivId?: string;
}

/**
 * arXiv paper metadata
 */
export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  version: number;
  publishedDate: string;
  updatedDate: string;
  pdfUrl: string;
}

/**
 * arXiv snapshot result
 */
export interface ArxivSnapshot {
  version: string;
  stateHash: string;
  fetchedAt: Date;
  metadata: {
    arxivId: string;
    title: string;
    authors: string[];
    abstract: string;
    publishedDate: string;
    updatedDate: string;
    pdfUrl: string;
    versionNumber: number;
  };
}

/**
 * arXiv change detection result
 */
export interface ArxivChangeDetection {
  hasChanged: boolean;
  changes: string[];
  oldVersion?: string;
  newVersion?: string;
  severity?: 'breaking' | 'major' | 'minor';
}

/**
 * arXiv checker implementation
 */
export class ArxivChecker {
  private apiUrl = 'https://export.arxiv.org/api/query';

  /**
   * Extract arXiv ID from URL or string
   * Handles various formats:
   * - https://arxiv.org/abs/1234.56789
   * - https://arxiv.org/pdf/1234.56789.pdf
   * - arxiv:1234.56789
   * - 1234.56789
   * - 1234.56789v2
   */
  private extractArxivId(input: string): string | null {
    const patterns = [
      /arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)/i, // URLs
      /arxiv:(\d+\.\d+)/i, // arxiv: prefix
      /^(\d+\.\d+)(?:v\d+)?$/i // Raw ID with optional version
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Parse arXiv API XML response
   */
  private parseArxivResponse(xml: string): ArxivPaper | null {
    // Simple XML parsing for arXiv Atom feed
    const getTagContent = (tag: string, content: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
      const match = content.match(regex);
      return match?.[1]?.trim() || '';
    };

    const getAllTagContent = (tag: string, content: string): string[] => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
      const matches = content.matchAll(regex);
      return Array.from(matches).map((m) => m[1]?.trim() || '');
    };

    // Find the entry element
    const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entryMatch) {
      return null;
    }
    const entry = entryMatch[1] || '';

    // Extract ID and version
    const id = getTagContent('id', entry);
    const idMatch = id.match(/arxiv\.org\/abs\/(\d+\.\d+)(v(\d+))?/);
    if (!idMatch) {
      return null;
    }

    const arxivId = idMatch[1] || '';
    const version = parseInt(idMatch[3] || '1', 10);

    // Extract metadata
    const title = getTagContent('title', entry).replace(/\s+/g, ' ');
    const abstract = getTagContent('summary', entry).replace(/\s+/g, ' ');
    const published = getTagContent('published', entry);
    const updated = getTagContent('updated', entry);

    // Extract authors
    const authorMatches = entry.matchAll(
      /<author[^>]*>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/gi
    );
    const authors = Array.from(authorMatches).map((m) => m[1]?.trim() || '');

    // Extract PDF link
    const linkMatches = entry.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi);
    let pdfUrl = '';
    for (const match of linkMatches) {
      if (match[1]?.includes('/pdf/')) {
        pdfUrl = match[1];
        break;
      }
    }

    return {
      id: arxivId,
      title,
      authors,
      abstract,
      version,
      publishedDate: published,
      updatedDate: updated,
      pdfUrl: pdfUrl || `https://arxiv.org/pdf/${arxivId}.pdf`
    };
  }

  /**
   * Fetch paper information from arXiv API
   */
  async fetch(config: ArxivConfig): Promise<ArxivSnapshot> {
    const { url, arxivId: providedId } = config;

    // Extract or use provided arXiv ID
    const arxivId = providedId || this.extractArxivId(url);
    if (!arxivId) {
      throw new Error(`Could not extract arXiv ID from: ${url}`);
    }

    try {
      // Query arXiv API
      const queryUrl = `${this.apiUrl}?id_list=${arxivId}&max_results=1`;
      const response = await fetch(queryUrl, {
        headers: {
          'User-Agent': 'dependabit-monitor/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status} ${response.statusText}`);
      }

      const xml = await response.text();
      const paper = this.parseArxivResponse(xml);

      if (!paper) {
        throw new Error(`Could not parse arXiv response for ID: ${arxivId}`);
      }

      // Create state hash from paper metadata
      const stateContent = JSON.stringify({
        version: paper.version,
        updatedDate: paper.updatedDate,
        abstract: paper.abstract.substring(0, 500) // Use first 500 chars of abstract
      });
      const stateHash = crypto.createHash('sha256').update(stateContent).digest('hex');

      return {
        version: `v${paper.version}`,
        stateHash,
        fetchedAt: new Date(),
        metadata: {
          arxivId: paper.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          publishedDate: paper.publishedDate,
          updatedDate: paper.updatedDate,
          pdfUrl: paper.pdfUrl,
          versionNumber: paper.version
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch arXiv paper: ${(error as Error).message}`);
    }
  }

  /**
   * Compare two arXiv snapshots to detect changes
   */
  async compare(prev: ArxivSnapshot, curr: ArxivSnapshot): Promise<ArxivChangeDetection> {
    const changes: string[] = [];

    // Check version change (most important for arXiv)
    const prevVersion = prev.metadata.versionNumber;
    const currVersion = curr.metadata.versionNumber;

    if (prevVersion !== currVersion) {
      changes.push('version');
    }

    // Check updated date
    if (prev.metadata.updatedDate !== curr.metadata.updatedDate) {
      changes.push('updatedDate');
    }

    // Check abstract change (paper content may have been revised)
    if (prev.metadata.abstract !== curr.metadata.abstract) {
      changes.push('abstract');
    }

    // Check title change (rare but possible)
    if (prev.metadata.title !== curr.metadata.title) {
      changes.push('title');
    }

    // Determine severity
    // For research papers, any version update is significant
    let severity: 'breaking' | 'major' | 'minor' = 'minor';
    if (changes.includes('version')) {
      // New paper version is a major change
      severity = 'major';
    } else if (changes.includes('abstract') || changes.includes('title')) {
      // Content changes without version bump (metadata update)
      severity = 'minor';
    }

    const result: ArxivChangeDetection = {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: prev.version,
      newVersion: curr.version
    };

    if (changes.length > 0) {
      result.severity = severity;
    }

    return result;
  }
}

/**
 * Create an arXiv checker instance
 */
export function createArxivChecker(): ArxivChecker {
  return new ArxivChecker();
}
