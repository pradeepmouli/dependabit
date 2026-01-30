/**
 * Code Comment Parser
 * T037 [P] [US1] Implement code comment parser
 */

export interface CommentReference {
  url: string;
  file: string;
  line?: number;
  context?: string;
  commentType: 'single-line' | 'multi-line' | 'doc-comment';
}

/**
 * Parse code files and extract URLs from comments
 */
export class CodeCommentParser {
  /**
   * Parse code file content and extract URLs from comments
   */
  parse(content: string, filePath: string): CommentReference[] {
    const references: CommentReference[] = [];
    const fileExt = this.getFileExtension(filePath);
    const commentStyle = this.getCommentStyle(fileExt);

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Check for single-line comments
      for (const pattern of commentStyle.singleLine) {
        if (line.includes(pattern)) {
          const commentStart = line.indexOf(pattern);
          const commentText = line.slice(commentStart + pattern.length);
          const urls = this.extractUrls(commentText);

          for (const url of urls) {
            references.push({
              url,
              file: filePath,
              line: i + 1,
              context: this.cleanCommentText(commentText),
              commentType: 'single-line'
            });
          }
        }
      }

      // Check for multi-line comment start
      for (const pattern of commentStyle.multiLineStart) {
        if (line.includes(pattern)) {
          const blockEnd = this.findCommentBlockEnd(
            lines,
            i,
            commentStyle.multiLineEnd
          );
          const blockContent = lines.slice(i, blockEnd + 1).join('\n');
          const urls = this.extractUrls(blockContent);

          for (const url of urls) {
            references.push({
              url,
              file: filePath,
              line: i + 1,
              context: this.cleanCommentText(blockContent.slice(0, 150)),
              commentType:
                pattern.includes('/**') ? 'doc-comment' : 'multi-line'
            });
          }
        }
      }
    }

    return this.deduplicateReferences(references);
  }

  /**
   * Get file extension
   */
  private getFileExtension(filePath: string): string {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : '';
  }

  /**
   * Get comment patterns for file type
   */
  private getCommentStyle(ext: string): {
    singleLine: string[];
    multiLineStart: string[];
    multiLineEnd: string[];
  } {
    const styles: Record<
      string,
      {
        singleLine: string[];
        multiLineStart: string[];
        multiLineEnd: string[];
      }
    > = {
      // JavaScript/TypeScript
      js: {
        singleLine: ['//'],
        multiLineStart: ['/*', '/**'],
        multiLineEnd: ['*/']
      },
      ts: {
        singleLine: ['//'],
        multiLineStart: ['/*', '/**'],
        multiLineEnd: ['*/']
      },
      tsx: {
        singleLine: ['//'],
        multiLineStart: ['/*', '/**'],
        multiLineEnd: ['*/']
      },
      jsx: {
        singleLine: ['//'],
        multiLineStart: ['/*', '/**'],
        multiLineEnd: ['*/']
      },
      // Python
      py: { singleLine: ['#'], multiLineStart: ['"""', "'''"], multiLineEnd: ['"""', "'''"] },
      // CSS
      css: { singleLine: [], multiLineStart: ['/*'], multiLineEnd: ['*/'] },
      // Ruby
      rb: { singleLine: ['#'], multiLineStart: ['=begin'], multiLineEnd: ['=end'] },
      // Go
      go: {
        singleLine: ['//'],
        multiLineStart: ['/*'],
        multiLineEnd: ['*/']
      },
      // Rust
      rs: {
        singleLine: ['//'],
        multiLineStart: ['/*'],
        multiLineEnd: ['*/']
      },
      // Default
      default: {
        singleLine: ['//', '#'],
        multiLineStart: ['/*'],
        multiLineEnd: ['*/']
      }
    };

    return styles[ext] || styles['default']!;
  }

  /**
   * Find the end of a multi-line comment block
   */
  private findCommentBlockEnd(
    lines: string[],
    startIndex: number,
    endPatterns: string[]
  ): number {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      for (const pattern of endPatterns) {
        if (line.includes(pattern)) {
          return i;
        }
      }
    }
    return lines.length - 1;
  }

  /**
   * Extract URLs from text
   */
  private extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
    const matches = text.matchAll(urlRegex);
    const urls: string[] = [];

    for (const match of matches) {
      const url = match[0].replace(/[.,;)]+$/, ''); // Remove trailing punctuation
      if (this.isValidUrl(url)) {
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
   * Clean comment text (remove comment markers and extra whitespace)
   */
  private cleanCommentText(text: string): string {
    return text
      .replace(/\/\*\*?|\*\/|\/\/|#|'''|"""/g, '')
      .replace(/^\s*\*\s?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Remove duplicate references, keeping the first occurrence
   */
  private deduplicateReferences(
    references: CommentReference[]
  ): CommentReference[] {
    const seen = new Set<string>();
    return references.filter((ref) => {
      const key = `${ref.file}:${ref.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
