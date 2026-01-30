/**
 * Package File Parser
 * Extracts metadata and references from package manager files
 * EXCLUDES actual dependencies (handled by dependabot)
 */

export interface PackageMetadata {
  repository?: string;
  homepage?: string;
  documentation?: string;
  urls: string[]; // URLs found in descriptions, etc.
}

/**
 * Parse package.json and extract metadata URLs (NOT dependencies)
 */
export function parsePackageJson(content: string): PackageMetadata {
  try {
    const pkg = JSON.parse(content);
    const urls: string[] = [];

    // Extract repository URL
    let repository: string | undefined;
    if (typeof pkg.repository === 'string') {
      repository = pkg.repository;
    } else if (pkg.repository && pkg.repository.url) {
      repository = pkg.repository.url;
    }

    // Extract homepage
    const homepage = pkg.homepage;

    // Extract documentation (not standard but sometimes present)
    const documentation = pkg.documentation || pkg.docs;

    // Extract URLs from description
    if (pkg.description) {
      const descUrls = extractUrls(pkg.description);
      urls.push(...descUrls);
    }

    // Note: We DO NOT extract dependencies/devDependencies
    // Those are handled by dependabot

    return {
      repository,
      homepage,
      documentation,
      urls
    };
  } catch (error) {
    return { urls: [] };
  }
}

/**
 * Parse requirements.txt and extract URLs from comments
 * EXCLUDES actual packages (handled by dependabot)
 */
export function parseRequirementsTxt(content: string): PackageMetadata {
  const urls: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Only extract URLs from comments
    if (line.trim().startsWith('#')) {
      const commentUrls = extractUrls(line);
      urls.push(...commentUrls);
    }
    // Skip actual package lines - dependabot handles those
  }

  return { urls };
}

/**
 * Parse Cargo.toml and extract metadata URLs
 * EXCLUDES actual dependencies (handled by dependabot)
 */
export function parseCargoToml(content: string): PackageMetadata {
  const urls: string[] = [];
  let repository: string | undefined;
  let homepage: string | undefined;
  let documentation: string | undefined;

  const lines = content.split('\n');
  let inPackageSection = false;

  for (const line of lines) {
    if (line.trim() === '[package]') {
      inPackageSection = true;
      continue;
    }

    if (line.trim().startsWith('[') && line.trim() !== '[package]') {
      inPackageSection = false;
      continue;
    }

    if (inPackageSection) {
      const repoMatch = /repository\s*=\s*"([^"]+)"/.exec(line);
      if (repoMatch) repository = repoMatch[1];

      const homepageMatch = /homepage\s*=\s*"([^"]+)"/.exec(line);
      if (homepageMatch) homepage = homepageMatch[1];

      const docMatch = /documentation\s*=\s*"([^"]+)"/.exec(line);
      if (docMatch) documentation = docMatch[1];
    }

    // Extract URLs from comments
    if (line.trim().startsWith('#')) {
      const commentUrls = extractUrls(line);
      urls.push(...commentUrls);
    }
  }

  return {
    repository,
    homepage,
    documentation,
    urls
  };
}

/**
 * Parse go.mod and extract URLs from comments
 * EXCLUDES actual dependencies (handled by dependabot)
 */
export function parseGoMod(content: string): PackageMetadata {
  const urls: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Only extract URLs from comments
    if (line.trim().startsWith('//')) {
      const commentUrls = extractUrls(line);
      urls.push(...commentUrls);
    }
    // Skip actual require lines - dependabot handles those
  }

  return { urls };
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
