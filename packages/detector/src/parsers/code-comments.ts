/**
 * Code Comment Parser
 * Extracts URLs and references from code comments
 */

export interface CommentReference {
  url: string;
  context: string;
  file: string;
  line: number;
  commentType: 'single-line' | 'multi-line' | 'jsdoc';
}

/**
 * Parse code files and extract references from comments
 */
export function parseCodeComments(
  content: string,
  filePath: string
): CommentReference[] {
  const references: CommentReference[] = [];
  const extension = getFileExtension(filePath);
  const commentStyle = getCommentStyle(extension);

  if (!commentStyle) {
    return references; // Unsupported file type
  }

  const lines = content.split('\n');
  let inMultiLineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for multi-line comment start/end
    if (commentStyle.multiLine) {
      if (line.includes(commentStyle.multiLine.start)) {
        inMultiLineComment = true;
      }
      if (inMultiLineComment) {
        const urls = extractUrls(line);
        for (const url of urls) {
          references.push({
            url,
            context: line.trim(),
            file: filePath,
            line: lineNumber,
            commentType: line.includes('/**') ? 'jsdoc' : 'multi-line'
          });
        }
      }
      if (line.includes(commentStyle.multiLine.end)) {
        inMultiLineComment = false;
      }
      continue;
    }

    // Check for single-line comments
    if (commentStyle.singleLine) {
      const commentStart = line.indexOf(commentStyle.singleLine);
      if (commentStart !== -1) {
        const comment = line.substring(commentStart);
        const urls = extractUrls(comment);
        for (const url of urls) {
          references.push({
            url,
            context: comment.trim(),
            file: filePath,
            line: lineNumber,
            commentType: 'single-line'
          });
        }
      }
    }
  }

  return references;
}

function getFileExtension(filePath: string): string {
  const match = filePath.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

interface CommentStyle {
  singleLine?: string;
  multiLine?: { start: string; end: string };
}

function getCommentStyle(extension: string): CommentStyle | null {
  const styles: Record<string, CommentStyle> = {
    // JavaScript/TypeScript
    js: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    ts: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    jsx: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    tsx: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // Python
    py: { singleLine: '#', multiLine: { start: '"""', end: '"""' } },
    
    // Ruby
    rb: { singleLine: '#', multiLine: { start: '=begin', end: '=end' } },
    
    // Go
    go: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // Rust
    rs: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // C/C++
    c: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    cpp: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    h: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // Java/Kotlin
    java: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    kt: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // C#
    cs: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // PHP
    php: { singleLine: '//', multiLine: { start: '/*', end: '*/' } },
    
    // Shell
    sh: { singleLine: '#' },
    bash: { singleLine: '#' },
    
    // YAML
    yml: { singleLine: '#' },
    yaml: { singleLine: '#' }
  };

  return styles[extension] || null;
}

function extractUrls(text: string): string[] {
  const urls: string[] = [];
  const regex = /https?:\/\/[^\s<>()[\]'"]+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  return urls;
}

/**
 * Extract specification and RFC references from comments
 */
export function extractSpecReferences(content: string): Array<{ spec: string; context: string }> {
  const references: Array<{ spec: string; context: string }> = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match RFC references
    const rfcMatch = /RFC\s*(\d+)/i.exec(line);
    if (rfcMatch) {
      references.push({
        spec: `RFC ${rfcMatch[1]}`,
        context: line.trim()
      });
    }

    // Match standard references (ISO, IEEE, etc.)
    const standardMatch = /(ISO|IEEE|ECMA|W3C)[\s-]*(\d+(?:[-.]\d+)*)/i.exec(line);
    if (standardMatch) {
      references.push({
        spec: `${standardMatch[1]} ${standardMatch[2]}`,
        context: line.trim()
      });
    }
  }

  return references;
}
