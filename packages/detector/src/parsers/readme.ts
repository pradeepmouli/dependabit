/**
 * README Parser
 * T036 [P] [US1] Implement README parser
 */

export interface ParsedReference {
  url: string;
  line?: number;
  context?: string;
}

/**
 * Parse README files and extract URLs and references
 */
export class ReadmeParser {
  /**
   * Parse README content and extract all URLs
   */
  parse(content: string, filePath?: string): ParsedReference[] {
    const references: ParsedReference[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const urls = this.extractUrlsFromLine(line);

      for (const url of urls) {
        references.push({
          url,
          line: i + 1,
          context: this.extractContext(line, url)
        });
      }
    }

    return this.deduplicateReferences(references);
  }

  /**
   * Extract URLs from a single line
   */
  private extractUrlsFromLine(line: string): string[] {
    const urls: string[] = [];

    // Match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = markdownLinkRegex.exec(line)) !== null) {
      const url = match[2];
      if (url && this.isValidUrl(url)) {
        urls.push(url);
      }
    }

    // Match bare URLs
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
    const bareMatches = line.matchAll(urlRegex);

    for (const bareMatch of bareMatches) {
      const url = bareMatch[0];
      if (this.isValidUrl(url) && !urls.includes(url)) {
        urls.push(url);
      }
    }

    return urls;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extract context around a URL
   */
  private extractContext(line: string, url: string): string {
    // Remove markdown formatting
    let context = line.replace(/[*_`#]/g, '').trim();

    // Limit context length
    const maxLength = 150;
    if (context.length > maxLength) {
      const urlIndex = context.indexOf(url);
      const start = Math.max(0, urlIndex - 50);
      const end = Math.min(context.length, urlIndex + url.length + 50);
      context = context.slice(start, end).trim();
    }

    return context;
  }

  /**
   * Remove duplicate references, keeping the first occurrence
   */
  private deduplicateReferences(
    references: ParsedReference[]
  ): ParsedReference[] {
    const seen = new Set<string>();
    return references.filter((ref) => {
      if (seen.has(ref.url)) {
        return false;
      }
      seen.add(ref.url);
      return true;
    });
  }
}
