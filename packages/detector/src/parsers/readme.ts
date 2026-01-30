/**
 * README Parser
 * Extracts URLs and references from README and markdown files
 */

export interface ExtractedReference {
  url: string;
  context: string; // Surrounding text
  line?: number;
  type: 'markdown-link' | 'bare-url' | 'reference-link';
}

// Patterns to skip (package managers, CI badges, shields.io)
const SKIP_PATTERNS = [
  /npmjs\.com\/package/,
  /pypi\.org\/project/,
  /crates\.io\/crates/,
  /rubygems\.org\/gems/,
  /packagist\.org\/packages/,
  /shields\.io/,
  /badge(s)?\..*\.svg/,
  /travis-ci\.(org|com)/,
  /circleci\.com/,
  /github\.com\/.*\/actions/  // GitHub Actions badges
];

/**
 * Parse README content and extract external references
 */
export function parseReadme(content: string, filePath = 'README.md'): ExtractedReference[] {
  const references: ExtractedReference[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Extract markdown links [text](url)
    const markdownLinks = extractMarkdownLinks(line);
    for (const { url, text } of markdownLinks) {
      if (!shouldSkipUrl(url)) {
        references.push({
          url,
          context: text || line.trim(),
          line: lineNumber,
          type: 'markdown-link'
        });
      }
    }

    // Extract reference-style links [text]: url
    const referenceLinks = extractReferenceLinks(line);
    for (const { url, text } of referenceLinks) {
      if (!shouldSkipUrl(url)) {
        references.push({
          url,
          context: text || line.trim(),
          line: lineNumber,
          type: 'reference-link'
        });
      }
    }

    // Extract bare URLs
    const bareUrls = extractBareUrls(line);
    for (const url of bareUrls) {
      if (!shouldSkipUrl(url)) {
        references.push({
          url,
          context: line.trim(),
          line: lineNumber,
          type: 'bare-url'
        });
      }
    }
  }

  // Deduplicate by URL
  return deduplicateReferences(references);
}

function extractMarkdownLinks(line: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }

  return links;
}

function extractReferenceLinks(line: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const regex = /^\[([^\]]+)\]:\s+(.+)$/;
  const match = regex.exec(line);

  if (match) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }

  return links;
}

function extractBareUrls(line: string): string[] {
  const urls: string[] = [];
  const regex = /https?:\/\/[^\s<>()[\]]+/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    urls.push(match[0]);
  }

  return urls;
}

function shouldSkipUrl(url: string): boolean {
  return SKIP_PATTERNS.some(pattern => pattern.test(url));
}

function deduplicateReferences(references: ExtractedReference[]): ExtractedReference[] {
  const seen = new Set<string>();
  return references.filter(ref => {
    if (seen.has(ref.url)) {
      return false;
    }
    seen.add(ref.url);
    return true;
  });
}

/**
 * Extract GitHub repository mentions (owner/repo format)
 */
export function extractGitHubReferences(content: string): Array<{ owner: string; repo: string; context: string }> {
  const references: Array<{ owner: string; repo: string; context: string }> = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match owner/repo pattern not in URLs
    const regex = /(?<!https?:\/\/github\.com\/)([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(?!\/)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const [_, ownerRepo] = match;
      const [owner, repo] = ownerRepo.split('/');
      
      if (owner && repo && owner !== 'owner' && repo !== 'repo') {
        references.push({
          owner,
          repo,
          context: line.trim()
        });
      }
    }
  }

  return references;
}
