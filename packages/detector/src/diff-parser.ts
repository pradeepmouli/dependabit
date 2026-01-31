/**
 * Diff Parser
 * Parse git diffs to extract meaningful changes for dependency analysis
 */

import type { CommitFile } from '@dependabit/github-client';

export interface DiffParseResult {
  additions: string[];
  deletions: string[];
}

export interface ExtractedContent {
  urls: string[];
  packageDeps: string[];
}

export interface ChangedFilesResult {
  relevantFiles: string[];
  packageFiles: string[];
  documentationFiles: string[];
}

// URL pattern to match HTTP(S) URLs
const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Package dependency patterns
const PACKAGE_DEP_PATTERNS = {
  packageJson: /"([^"]+)":\s*"[\^~]?[\d.]+"/g,
  requirementsTxt: /^([a-zA-Z0-9_-]+)[>=<~!]=.*/gm,
  cargoToml: /^([a-zA-Z0-9_-]+)\s*=.*/gm
};

// File extensions relevant for dependency analysis
const RELEVANT_EXTENSIONS = [
  '.md', '.txt', '.rst', '.adoc',  // Documentation
  '.ts', '.js', '.py', '.rs', '.go', '.java', '.cpp', '.c', '.h',  // Code
  '.json', '.toml', '.yaml', '.yml',  // Config
  '.html', '.xml'  // Markup
];

// Package manifest files
const PACKAGE_MANIFEST_FILES = [
  'package.json',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'composer.json'
];

/**
 * Parse a unified diff and extract additions and deletions
 */
export function parseDiff(patch: string): DiffParseResult {
  const additions: string[] = [];
  const deletions: string[] = [];

  if (!patch) {
    return { additions, deletions };
  }

  const lines = patch.split('\n');

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      // Addition (remove the + prefix)
      additions.push(line.substring(1));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      // Deletion (remove the - prefix)
      deletions.push(line.substring(1));
    }
    // Ignore context lines (no prefix or space prefix)
  }

  return { additions, deletions };
}

/**
 * Extract meaningful content from added lines
 */
export function extractAddedContent(
  additions: string[],
  filename?: string
): ExtractedContent {
  const urls: string[] = [];
  const packageDeps: string[] = [];

  const content = additions.join('\n');

  // Extract URLs
  const urlMatches = content.matchAll(URL_PATTERN);
  for (const match of urlMatches) {
    urls.push(match[0]);
  }

  // Extract package dependencies based on file type
  if (filename) {
    if (filename === 'package.json') {
      const depMatches = content.matchAll(PACKAGE_DEP_PATTERNS.packageJson);
      for (const match of depMatches) {
        packageDeps.push(match[1]);
      }
    } else if (filename === 'requirements.txt') {
      const depMatches = content.matchAll(PACKAGE_DEP_PATTERNS.requirementsTxt);
      for (const match of depMatches) {
        packageDeps.push(match[1]);
      }
    } else if (filename === 'Cargo.toml') {
      const depMatches = content.matchAll(PACKAGE_DEP_PATTERNS.cargoToml);
      for (const match of depMatches) {
        packageDeps.push(match[1]);
      }
    }
  }

  return {
    urls: Array.from(new Set(urls)),
    packageDeps: Array.from(new Set(packageDeps))
  };
}

/**
 * Extract meaningful content from removed lines
 */
export function extractRemovedContent(
  deletions: string[],
  filename?: string
): ExtractedContent {
  // Use the same logic as extractAddedContent
  return extractAddedContent(deletions, filename);
}

/**
 * Identify files relevant for dependency analysis
 */
export function getChangedFiles(files: CommitFile[]): ChangedFilesResult {
  const relevantFiles: string[] = [];
  const packageFiles: string[] = [];
  const documentationFiles: string[] = [];

  for (const file of files) {
    const filename = file.filename.toLowerCase();
    const basename = filename.split('/').pop() || '';

    // Check if it's a package manifest file
    if (PACKAGE_MANIFEST_FILES.includes(basename)) {
      packageFiles.push(file.filename);
      relevantFiles.push(file.filename);
      continue;
    }

    // Check if it's a documentation file
    if (basename.startsWith('readme') || 
        filename.includes('/docs/') || 
        filename.includes('/documentation/')) {
      documentationFiles.push(file.filename);
      relevantFiles.push(file.filename);
      continue;
    }

    // Check if it has a relevant extension
    const hasRelevantExtension = RELEVANT_EXTENSIONS.some(ext => 
      filename.endsWith(ext)
    );

    if (hasRelevantExtension) {
      relevantFiles.push(file.filename);
    }
  }

  return {
    relevantFiles: Array.from(new Set(relevantFiles)),
    packageFiles: Array.from(new Set(packageFiles)),
    documentationFiles: Array.from(new Set(documentationFiles))
  };
}

/**
 * Parse all diffs from commit files
 */
export function parseCommitDiffs(files: CommitFile[]): Map<string, DiffParseResult> {
  const diffMap = new Map<string, DiffParseResult>();

  for (const file of files) {
    if (file.patch) {
      diffMap.set(file.filename, parseDiff(file.patch));
    }
  }

  return diffMap;
}

/**
 * Extract all dependency-related content from commit diffs
 */
export function extractDependencyChanges(files: CommitFile[]): {
  addedUrls: string[];
  removedUrls: string[];
  addedPackages: string[];
  removedPackages: string[];
  changedFiles: ChangedFilesResult;
} {
  const changedFiles = getChangedFiles(files);
  const allAddedUrls: string[] = [];
  const allRemovedUrls: string[] = [];
  const allAddedPackages: string[] = [];
  const allRemovedPackages: string[] = [];

  for (const file of files) {
    if (!file.patch || !changedFiles.relevantFiles.includes(file.filename)) {
      continue;
    }

    const diff = parseDiff(file.patch);
    const basename = file.filename.split('/').pop();

    // Extract added content
    const addedContent = extractAddedContent(diff.additions, basename);
    allAddedUrls.push(...addedContent.urls);
    allAddedPackages.push(...addedContent.packageDeps);

    // Extract removed content
    const removedContent = extractRemovedContent(diff.deletions, basename);
    allRemovedUrls.push(...removedContent.urls);
    allRemovedPackages.push(...removedContent.packageDeps);
  }

  return {
    addedUrls: Array.from(new Set(allAddedUrls)),
    removedUrls: Array.from(new Set(allRemovedUrls)),
    addedPackages: Array.from(new Set(allAddedPackages)),
    removedPackages: Array.from(new Set(allRemovedPackages)),
    changedFiles
  };
}
