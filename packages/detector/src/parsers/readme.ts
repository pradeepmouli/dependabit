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
    if (!line) continue; // Skip undefined or empty lines
    
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
    const text = match[1];
    const url = match[2];
    if (text !== undefined && url !== undefined) {
      links.push({ text, url });
    }
  }

  return links;
}

function extractReferenceLinks(line: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const regex = /^\[([^\]]+)\]:\s+(.+)$/;
  const match = regex.exec(line);

  if (match) {
    const text = match[1];
    const url = match[2];
    if (text !== undefined && url !== undefined) {
      links.push({ text, url });
    }
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
    // Match owner/repo pattern not in URLs, with basic length and context constraints
    const regex = /(?<!https?:\/\/github\.com\/)(?:^|[\s(])([a-zA-Z0-9_-]{2,}\/[a-zA-Z0-9_.-]{2,})(?=$|[\s),.;])/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const ownerRepo = match[1];
      if (ownerRepo) {
        const parts = ownerRepo.split('/');
        const owner = parts[0];
        const repo = parts[1];
        
        if (
          owner &&
          repo &&
          owner.length >= 2 &&
          repo.length >= 2 &&
          owner !== 'owner' &&
          repo !== 'repo' &&
          !( /^\d+$/.test(owner) && /^\d+$/.test(repo) )
        ) {
          references.push({
            owner,
            repo,
            context: line.trim()
          });
        }
      }
    }
  }

  return references;
}
