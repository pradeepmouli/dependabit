/**
 * Detector Orchestrator
 * T039 [US1] Implement detector orchestrator
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import type { DependencyEntry } from '@dependabit/manifest';
import type { LLMClient } from './llm/client.js';
import { CopilotClient } from './llm/copilot.js';
import { ReadmeParser } from './parsers/readme.js';
import { CodeCommentParser } from './parsers/code-comments.js';
import { PackageFileParser } from './parsers/package-files.js';

// Placeholder warning logger (replace with actual logger in production)
function logWarning(_message: string, _data?: Record<string, unknown>): void {
  // console.warn(message, data);
}

export interface DetectorOptions {
  /**
   * Repository root path
   */
  repoPath: string;

  /**
   * LLM client to use for analysis
   */
  llmClient?: LLMClient;

  /**
   * Maximum depth for directory traversal
   */
  maxDepth?: number;

  /**
   * File patterns to include
   */
  includePatterns?: RegExp[];

  /**
   * File patterns to exclude
   */
  excludePatterns?: RegExp[];
}

export interface DetectorResult {
  dependencies: DependencyEntry[];
  statistics: {
    totalFiles: number;
    parsedFiles: number;
    dependencies: number;
    byType: Record<string, number>;
    averageConfidence: number;
  };
}

/**
 * Main detector orchestrator that coordinates parsing and LLM analysis
 */
export class Detector {
  private readonly repoPath: string;
  private readonly llmClient: LLMClient;
  private readonly maxDepth: number;
  private readonly includePatterns: RegExp[];
  private readonly excludePatterns: RegExp[];

  private readonly readmeParser = new ReadmeParser();
  private readonly codeCommentParser = new CodeCommentParser();
  private readonly packageFileParser = new PackageFileParser();

  constructor(options: DetectorOptions) {
    this.repoPath = options.repoPath;
    this.llmClient = options.llmClient || new CopilotClient();
    this.maxDepth = options.maxDepth || 5;

    // Default patterns
    this.includePatterns = options.includePatterns || [
      /\.md$/i,
      /\.ts$/i,
      /\.js$/i,
      /\.tsx$/i,
      /\.jsx$/i,
      /\.py$/i,
      /\.go$/i,
      /\.rs$/i,
      /\.rb$/i
    ];

    this.excludePatterns = options.excludePatterns || [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/,
      /\.cache/
    ];
  }

  /**
   * Detect all dependencies in the repository
   */
  async detect(): Promise<DetectorResult> {
    // Find all relevant files
    const files = await this.findFiles(this.repoPath, 0);

    // Parse package files first (to exclude package manager dependencies)
    const packageDeps = await this.parsePackageFiles(files);

    // Parse files and collect references
    const allReferences: Map<string, Set<{ file: string; line?: number; context?: string }>> =
      new Map();

    let parsedFiles = 0;

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const relativePath = relative(this.repoPath, file);

        if (file.match(/readme\.md$/i)) {
          // Parse README
          const refs = this.readmeParser.parse(content, relativePath);
          for (const ref of refs) {
            this.addReference(allReferences, ref.url, {
              file: relativePath,
              line: ref.line,
              context: ref.context
            });
          }
          parsedFiles++;
        } else {
          // Parse code comments
          const refs = this.codeCommentParser.parse(content, relativePath);
          for (const ref of refs) {
            this.addReference(allReferences, ref.url, {
              file: ref.file,
              line: ref.line,
              context: ref.context
            });
          }
          parsedFiles++;
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    // Analyze each unique URL with LLM for classification
    const dependencies: DependencyEntry[] = [];

    for (const [url, references] of allReferences.entries()) {
      // Skip package manager URLs
      if (this.packageFileParser.isPackageManagerUrl(url, packageDeps)) {
        continue;
      }

      try {
        // Use LLM to analyze and classify the URL
        const repoName = this.repoPath.split('/').pop();
        const analysis = await this.llmClient.analyze(
          `Analyze this URL and classify it: ${url}`,
          repoName ? {
            context: {
              repoName
            }
          } : undefined
        );

        if (analysis.dependencies.length > 0) {
          const dep = analysis.dependencies[0];
          if (!dep) continue;

          const entry: DependencyEntry = {
            id: randomUUID(),
            url: dep.url,
            type: this.mapToSchemaType(dep.type),
            accessMethod: this.inferAccessMethod(dep.url),
            name: dep.name || this.extractNameFromUrl(dep.url),
            description: dep.description,
            currentVersion: '',
            currentStateHash: this.generateHash(dep.url),
            detectionMethod: 'llm-analysis',
            detectionConfidence: dep.confidence,
            detectedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            referencedIn: Array.from(references),
            changeHistory: []
          };

          dependencies.push(entry);
        }
      } catch (error) {
        // Log errors but continue processing other URLs
        logWarning(`Failed to analyze URL: ${url}`, {
          error: error instanceof Error ? error.message : String(error)
        });
        // Create basic entry without LLM classification
        const entry: DependencyEntry = {
          id: randomUUID(),
          url,
          type: 'other',
          accessMethod: 'http',
          name: this.extractNameFromUrl(url),
          currentVersion: '',
          currentStateHash: this.generateHash(url),
          detectionMethod: 'llm-analysis',
          detectionConfidence: 0.7,
          detectedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          referencedIn: Array.from(references),
          changeHistory: []
        };

        dependencies.push(entry);
      }
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(dependencies, files.length, parsedFiles);

    return {
      dependencies,
      statistics
    };
  }

  /**
   * Find all files to analyze
   */
  private async findFiles(dir: string, depth: number): Promise<string[]> {
    if (depth > this.maxDepth) return [];

    const files: string[] = [];

    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);

        // Check exclusion patterns
        if (this.excludePatterns.some((pattern) => pattern.test(fullPath))) {
          continue;
        }

        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, depth + 1);
          files.push(...subFiles);
        } else if (stats.isFile()) {
          // Check inclusion patterns
          if (this.includePatterns.some((pattern) => pattern.test(fullPath))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return files;
  }

  /**
   * Parse package files
   */
  private async parsePackageFiles(files: string[]): Promise<any[]> {
    const packageFiles = files.filter(
      (f) =>
        f.endsWith('package.json') ||
        f.includes('requirements.txt') ||
        f.endsWith('Cargo.toml') ||
        f.endsWith('Gemfile') ||
        f.endsWith('composer.json')
    );

    const allDeps: any[] = [];

    for (const file of packageFiles) {
      try {
        const deps = await this.packageFileParser.parseFile(file);
        allDeps.push(...deps);
      } catch {
        continue;
      }
    }

    return allDeps;
  }

  /**
   * Add a reference to the map
   */
  private addReference(
    map: Map<string, Set<any>>,
    url: string,
    reference: any
  ): void {
    if (!map.has(url)) {
      map.set(url, new Set());
    }
    map.get(url)!.add(reference);
  }

  /**
   * Map LLM type to schema type
   */
  private mapToSchemaType(type: string): 'reference-implementation' | 'schema' | 'documentation' | 'research-paper' | 'api-example' | 'other' {
    const typeMap: Record<string, 'reference-implementation' | 'schema' | 'documentation' | 'research-paper' | 'api-example' | 'other'> = {
      'reference-implementation': 'reference-implementation',
      documentation: 'documentation',
      'research-paper': 'research-paper',
      schema: 'schema',
      'api-example': 'api-example'
    };

    return typeMap[type] || 'other';
  }

  /**
   * Infer access method from URL
   */
  private inferAccessMethod(url: string): 'context7' | 'arxiv' | 'openapi' | 'github-api' | 'http' {
    if (url.includes('github.com')) return 'github-api';
    if (url.includes('arxiv.org')) return 'arxiv';
    if (url.includes('openapi') || url.includes('swagger')) return 'openapi';
    if (url.includes('context7')) return 'context7';
    return 'http';
  }

  /**
   * Extract name from URL
   */
  private extractNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1]!.replace(/\.[^/.]+$/, '');
      }
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Generate hash for URL
   */
  private generateHash(url: string): string {
    return createHash('sha256').update(url).digest('hex').slice(0, 16);
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics(
    dependencies: DependencyEntry[],
    totalFiles: number,
    parsedFiles: number
  ): DetectorResult['statistics'] {
    const byType: Record<string, number> = {};

    for (const dep of dependencies) {
      byType[dep.type] = (byType[dep.type] || 0) + 1;
    }

    const averageConfidence =
      dependencies.length > 0
        ? dependencies.reduce((sum, dep) => sum + dep.detectionConfidence, 0) /
          dependencies.length
        : 0;

    return {
      totalFiles,
      parsedFiles,
      dependencies: dependencies.length,
      byType,
      averageConfidence
    };
  }
}
