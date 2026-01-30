/**
 * Detector Orchestrator
 * Coordinates content parsers and LLM analysis to detect external dependencies
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { LLMProvider } from './llm/client.js';
import { createDetectionPrompt, createClassificationPrompt } from './llm/prompts.js';
import { parseReadme, extractGitHubReferences } from './parsers/readme.js';
import { parseCodeComments, extractSpecReferences } from './parsers/code-comments.js';
import {
  parsePackageJson,
  parseRequirementsTxt,
  parseCargoToml,
  parseGoMod
} from './parsers/package-files.js';
import type {
  DependencyEntry,
  DependencyType,
  AccessMethod,
  DetectionMethod
} from '@dependabit/manifest';

export interface DetectorOptions {
  repoPath: string;
  llmProvider: LLMProvider;
  ignorePatterns?: string[];
}

export interface DetectionResult {
  dependencies: DependencyEntry[];
  statistics: {
    filesScanned: number;
    urlsFound: number;
    llmCalls: number;
    totalTokens: number;
    totalLatencyMs: number;
  };
}

const DEFAULT_IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'target',
  'vendor',
  '.venv',
  'venv',
  '__pycache__',
  'coverage',
  '.next',
  '.nuxt'
];

/**
 * Main detector class
 */
export class Detector {
  private options: Required<DetectorOptions>;

  constructor(options: DetectorOptions) {
    this.options = {
      ...options,
      ignorePatterns: options.ignorePatterns || DEFAULT_IGNORE_PATTERNS
    };
  }

  /**
   * Detect all external dependencies in the repository
   */
  async detectDependencies(): Promise<DetectionResult> {
    const allReferences: Map<string, {
      url: string;
      contexts: Array<{ file: string; line?: number; text: string }>;
      detectionMethod: DetectionMethod;
    }> = new Map();

    let filesScanned = 0;
    let llmCalls = 0;
    let totalTokens = 0;
    let totalLatencyMs = 0;

    // 1. Parse README files
    const readmeFiles = await this.findFiles(this.options.repoPath, /^README/i);
    for (const file of readmeFiles) {
      const content = await readFile(file, 'utf-8');
      const references = parseReadme(content, relative(this.options.repoPath, file));
      
      for (const ref of references) {
        this.addReference(allReferences, ref.url, {
          file: relative(this.options.repoPath, file),
          line: ref.line,
          text: ref.context
        }, 'llm-analysis');
      }
      
      filesScanned++;
    }

    // 2. Parse package files for metadata (NOT dependencies)
    const packageFiles = await this.findPackageFiles(this.options.repoPath);
    for (const file of packageFiles) {
      const content = await readFile(file, 'utf-8');
      const metadata = this.parsePackageFile(file, content);
      
      for (const url of [...(metadata.urls || []), metadata.repository, metadata.homepage, metadata.documentation].filter(Boolean)) {
        this.addReference(allReferences, url!, {
          file: relative(this.options.repoPath, file),
          text: 'Package metadata'
        }, 'package-json');
      }
      
      filesScanned++;
    }

    // 3. Parse code comments from source files
    const sourceFiles = await this.findSourceFiles(this.options.repoPath);
    for (const file of sourceFiles.slice(0, 50)) { // Limit to 50 files for performance
      const content = await readFile(file, 'utf-8');
      const references = parseCodeComments(content, relative(this.options.repoPath, file));
      
      for (const ref of references) {
        this.addReference(allReferences, ref.url, {
          file: ref.file,
          line: ref.line,
          text: ref.context
        }, 'code-comment');
      }
      
      filesScanned++;
    }

    // 4. Use LLM to analyze aggregated content and classify dependencies
    const dependencies: DependencyEntry[] = [];
    const now = new Date().toISOString();

    for (const [url, data] of allReferences) {
      // Prepare context for LLM
      const context = data.contexts
        .map(c => `${c.file}${c.line ? `:${c.line}` : ''}: ${c.text}`)
        .join('\n');

      // Classify the dependency using LLM
      const classificationPrompt = createClassificationPrompt(url, context);
      
      try {
        const response = await this.options.llmProvider.analyze('', classificationPrompt);
        llmCalls++;
        totalTokens += response.usage.totalTokens;
        totalLatencyMs += response.usage.latencyMs;

        // Parse LLM classification
        let type: DependencyType = 'other';
        let accessMethod: AccessMethod = 'http';
        let confidence = 0.5;

        if (response.dependencies.length > 0) {
          const dep = response.dependencies[0];
          type = dep.type as DependencyType;
          confidence = dep.confidence;
        }

        // Determine access method based on URL
        accessMethod = this.determineAccessMethod(url);

        // Create dependency entry
        const entry: DependencyEntry = {
          id: randomUUID(),
          url,
          type,
          accessMethod,
          name: this.extractName(url),
          description: data.contexts[0]?.text || '',
          currentVersion: undefined,
          currentStateHash: '', // Will be populated by monitor
          detectionMethod: data.detectionMethod,
          detectionConfidence: confidence,
          detectedAt: now,
          lastChecked: now,
          auth: undefined,
          monitoring: {
            enabled: true,
            checkFrequency: 'daily',
            ignoreChanges: false
          },
          referencedIn: data.contexts.map(c => ({
            file: c.file,
            line: c.line,
            context: c.text
          })),
          changeHistory: []
        };

        dependencies.push(entry);
      } catch (error) {
        console.error(`Failed to classify ${url}:`, error);
        // Continue with next URL
      }
    }

    return {
      dependencies,
      statistics: {
        filesScanned,
        urlsFound: allReferences.size,
        llmCalls,
        totalTokens,
        totalLatencyMs
      }
    };
  }

  private addReference(
    map: Map<string, any>,
    url: string,
    context: { file: string; line?: number; text: string },
    detectionMethod: DetectionMethod
  ): void {
    if (!map.has(url)) {
      map.set(url, {
        url,
        contexts: [],
        detectionMethod
      });
    }
    map.get(url)!.contexts.push(context);
  }

  private determineAccessMethod(url: string): AccessMethod {
    if (url.includes('github.com')) return 'github-api';
    if (url.includes('arxiv.org')) return 'arxiv';
    if (url.includes('openapi') || url.endsWith('.yaml') || url.endsWith('.json')) return 'openapi';
    return 'http';
  }

  private extractName(url: string): string {
    // Extract a reasonable name from URL
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1].replace(/\.[^.]+$/, '');
      }
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  private parsePackageFile(filePath: string, content: string): { urls: string[]; repository?: string; homepage?: string; documentation?: string } {
    const fileName = filePath.split('/').pop() || '';
    
    if (fileName === 'package.json') {
      return parsePackageJson(content);
    }
    if (fileName === 'requirements.txt') {
      return parseRequirementsTxt(content);
    }
    if (fileName === 'Cargo.toml') {
      return parseCargoToml(content);
    }
    if (fileName === 'go.mod') {
      return parseGoMod(content);
    }
    
    return { urls: [] };
  }

  private async findFiles(dir: string, pattern: RegExp): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (this.shouldIgnore(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, pattern);
          files.push(...subFiles);
        } else if (pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors (permission denied, etc.)
    }
    
    return files;
  }

  private async findPackageFiles(dir: string): Promise<string[]> {
    return this.findFiles(dir, /^(package\.json|requirements\.txt|Cargo\.toml|go\.mod)$/);
  }

  private async findSourceFiles(dir: string): Promise<string[]> {
    return this.findFiles(dir, /\.(ts|js|tsx|jsx|py|rs|go|java|kt|cs|rb|php)$/);
  }

  private shouldIgnore(name: string): boolean {
    return this.options.ignorePatterns.some(pattern => name.includes(pattern));
  }
}
