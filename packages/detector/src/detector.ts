/**
 * Detector Orchestrator
 * Coordinates content parsers and LLM analysis to detect external dependencies
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, normalize, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { LLMProvider } from './llm/client.js';
import { createClassificationPrompt } from './llm/prompts.js';
import { parseReadme } from './parsers/readme.js';
import { parseCodeComments } from './parsers/code-comments.js';
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
   *
   * Implementation follows a hybrid approach:
   * 1. Programmatic parsing of repository files (README, code comments, package files)
   * 2. LLM analysis only for documents not fully parsed in step 1 (future enhancement)
   * 3. Programmatic type categorization based on URL patterns and context
   * 4. LLM fallback for uncategorized dependencies
   * 5. Programmatic access method determination based on URL patterns
   * 6. LLM fallback for access methods that can't be determined (future enhancement)
   * 7. Manifest entry creation with references and versioning
   */
  async detectDependencies(): Promise<DetectionResult> {
    const allReferences: Map<
      string,
      {
        url: string;
        contexts: Array<{ file: string; line?: number; text: string }>;
        detectionMethod: DetectionMethod;
      }
    > = new Map();

    let filesScanned = 0;
    let llmCalls = 0;
    let totalTokens = 0;
    let totalLatencyMs = 0;

    // Step 1: Parse repository for dependencies (programmatic)
    // 1a. Parse README files
    const readmeFiles = await this.findFiles(this.options.repoPath, /^README/i);
    for (const file of readmeFiles) {
      const content = await readFile(file, 'utf-8');
      const references = parseReadme(content, relative(this.options.repoPath, file));

      for (const ref of references) {
        this.addReference(
          allReferences,
          ref.url,
          {
            file: relative(this.options.repoPath, file),
            ...(ref.line !== undefined && { line: ref.line }),
            text: ref.context
          },
          'llm-analysis'
        );
      }

      filesScanned++;
    }

    // 1b. Parse package files for metadata (NOT dependencies)
    const packageFiles = await this.findPackageFiles(this.options.repoPath);
    for (const file of packageFiles) {
      const content = await readFile(file, 'utf-8');
      const metadata = this.parsePackageFile(file, content);

      for (const url of [
        ...(metadata.urls || []),
        metadata.repository,
        metadata.homepage,
        metadata.documentation
      ].filter(Boolean)) {
        this.addReference(
          allReferences,
          url!,
          {
            file: relative(this.options.repoPath, file),
            text: 'Package metadata'
          },
          'package-json'
        );
      }

      filesScanned++;
    }

    // 1c. Parse code comments from source files
    const sourceFiles = await this.findSourceFiles(this.options.repoPath);
    for (const file of sourceFiles.slice(0, 50)) {
      // Limit to 50 files for performance
      const content = await readFile(file, 'utf-8');
      const references = parseCodeComments(content, relative(this.options.repoPath, file));

      for (const ref of references) {
        this.addReference(
          allReferences,
          ref.url,
          {
            file: ref.file,
            line: ref.line,
            text: ref.context
          },
          'code-comment'
        );
      }

      filesScanned++;
    }

    // Step 2: LLM 2nd pass for documents not fully parsed in step 1
    // Analyze README files for dependency context that parsers might have missed
    const llmEnhancedReferences = new Set<string>();

    for (const file of readmeFiles.slice(0, 5)) {
      // Limit to 5 READMEs for LLM analysis
      try {
        const content = await readFile(file, 'utf-8');
        const relPath = relative(this.options.repoPath, file);

        // Use LLM to extract additional context from README
        const detectionPrompt = `Analyze this README file and identify any external dependencies or resources that might be referenced but not explicitly linked:

File: ${relPath}
Content:
${content.slice(0, 5000)}

Identify:
1. Documentation sites mentioned but not linked
2. Tools or libraries referenced in text
3. API services mentioned
4. Research papers or specifications cited

Return as JSON with "dependencies" array.`;

        const response = await this.options.llmProvider.analyze(content, detectionPrompt);
        llmCalls++;
        totalTokens += response.usage.totalTokens;
        totalLatencyMs += response.usage.latencyMs;

        // Add LLM-discovered references
        for (const dep of response.dependencies) {
          if (dep.url && !allReferences.has(dep.url)) {
            llmEnhancedReferences.add(dep.url);
            this.addReference(
              allReferences,
              dep.url,
              {
                file: relPath,
                text: dep.description || 'Discovered by LLM analysis'
              },
              'llm-analysis'
            );
          }
        }
      } catch (error) {
        console.error(`LLM document analysis failed for ${file}:`, error);
      }
    }

    // Steps 3-6: Categorize dependencies (programmatic first, LLM fallback)
    const dependencies: DependencyEntry[] = [];
    const now = new Date().toISOString();

    for (const [url, data] of allReferences) {
      // Prepare context for potential LLM use
      const context = data.contexts
        .map((c) => `${c.file}${c.line ? `:${c.line}` : ''}: ${c.text}`)
        .join('\n');
      const firstContext = data.contexts[0]?.text || '';

      // Step 3: Try programmatic type categorization
      let type: DependencyType | null = this.determineDependencyType(url, firstContext);
      let typeConfidence = type ? 0.9 : 0.5; // High confidence for programmatic

      // Step 4: If type couldn't be determined, use LLM fallback
      if (!type) {
        try {
          const classificationPrompt = createClassificationPrompt(url, context);
          const response = await this.options.llmProvider.analyze('', classificationPrompt);
          llmCalls++;
          totalTokens += response.usage.totalTokens;
          totalLatencyMs += response.usage.latencyMs;

          if (response.dependencies.length > 0) {
            const dep = response.dependencies[0];
            if (dep) {
              type = dep.type as DependencyType;
              typeConfidence = dep.confidence;
            }
          }
        } catch (error) {
          console.error(`LLM classification failed for ${url}:`, error);
        }
      }

      // Default to 'other' if still not determined
      if (!type) {
        type = 'other';
        typeConfidence = 0.3;
      }

      // Step 5: Try programmatic access method determination
      let accessMethod: AccessMethod | null = this.determineAccessMethod(url);

      // Step 6: If access method couldn't be determined, use LLM fallback
      if (!accessMethod) {
        try {
          const accessMethodPrompt = `Determine the best access method for this URL: ${url}

Context: ${firstContext}

Choose ONE of these access methods:
- "github-api": For GitHub repositories
- "arxiv": For arXiv papers
- "openapi": For API specifications
- "context7": For Context7 documentation
- "http": For general web resources

Return as JSON: {"accessMethod": "...", "confidence": 0.0-1.0}`;

          const response = await this.options.llmProvider.analyze('', accessMethodPrompt);
          llmCalls++;
          totalTokens += response.usage.totalTokens;
          totalLatencyMs += response.usage.latencyMs;

          // Parse LLM response for access method
          const content = response.rawResponse || '{}';
          try {
            const parsed = JSON.parse(content);
            if (parsed.accessMethod) {
              accessMethod = parsed.accessMethod as AccessMethod;
            }
          } catch {
            // If parsing fails, fall back to http
            accessMethod = 'http';
          }
        } catch (error) {
          console.error(`LLM access method determination failed for ${url}:`, error);
          accessMethod = 'http';
        }
      }

      // Ensure we have a valid access method
      if (!accessMethod) {
        accessMethod = 'http';
      }

      // Step 7: Create manifest entry with references and versioning
      const entry: DependencyEntry = {
        id: randomUUID(),
        url,
        type,
        accessMethod,
        name: this.extractName(url),
        description: firstContext,
        currentVersion: undefined,
        currentStateHash: '', // Will be populated by monitor
        detectionMethod: data.detectionMethod,
        detectionConfidence: typeConfidence,
        detectedAt: now,
        lastChecked: now,
        auth: undefined,
        monitoring: {
          enabled: true,
          checkFrequency: 'daily',
          ignoreChanges: false
        },
        referencedIn: data.contexts.map((c) => ({
          file: c.file,
          line: c.line,
          context: c.text
        })),
        changeHistory: []
      };

      dependencies.push(entry);
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

  /**
   * Programmatically determine access method based on URL patterns
   * Returns null if cannot be determined programmatically
   */
  private determineAccessMethod(url: string): AccessMethod | null {
    // GitHub URLs
    if (url.includes('github.com')) return 'github-api';

    // arXiv papers
    if (url.includes('arxiv.org')) return 'arxiv';

    // OpenAPI/Swagger specs
    if (
      url.includes('openapi') ||
      url.includes('swagger') ||
      url.endsWith('.yaml') ||
      url.endsWith('.json') ||
      url.includes('/api/spec') ||
      url.includes('/api-docs')
    ) {
      return 'openapi';
    }

    // Context7 documentation
    if (url.includes('context7')) return 'context7';

    // Cannot determine programmatically - needs LLM
    return null;
  }

  /**
   * Programmatically determine dependency type based on URL patterns and context
   * Returns null if cannot be determined programmatically
   */
  private determineDependencyType(url: string, context: string): DependencyType | null {
    const lowerUrl = url.toLowerCase();
    const lowerContext = context.toLowerCase();

    // Research papers
    if (
      lowerUrl.includes('arxiv.org') ||
      lowerContext.includes('paper') ||
      lowerContext.includes('research')
    ) {
      return 'research-paper';
    }

    // Schemas
    if (
      lowerUrl.includes('schema') ||
      lowerUrl.includes('openapi') ||
      lowerUrl.includes('swagger') ||
      lowerUrl.includes('graphql') ||
      lowerUrl.includes('protobuf')
    ) {
      return 'schema';
    }

    // Documentation
    if (
      lowerUrl.includes('/docs') ||
      lowerUrl.includes('/documentation') ||
      lowerUrl.includes('/guide') ||
      lowerUrl.includes('/tutorial') ||
      lowerUrl.includes('/reference') ||
      lowerContext.includes('documentation') ||
      lowerContext.includes('docs')
    ) {
      return 'documentation';
    }

    // Reference implementations (GitHub repos)
    if (
      lowerUrl.includes('github.com') &&
      (lowerContext.includes('example') ||
        lowerContext.includes('implementation') ||
        lowerContext.includes('reference'))
    ) {
      return 'reference-implementation';
    }

    // API examples
    if (
      lowerContext.includes('example') &&
      (lowerContext.includes('api') || lowerContext.includes('endpoint'))
    ) {
      return 'api-example';
    }

    // Cannot determine programmatically - needs LLM
    return null;
  }

  private extractName(url: string): string {
    // Extract a reasonable name from URL
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart) {
          return lastPart.replace(/\.[^.]+$/, '');
        }
      }
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  private parsePackageFile(
    filePath: string,
    content: string
  ): { urls: string[]; repository?: string; homepage?: string; documentation?: string } {
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
    } catch  {
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
    return this.options.ignorePatterns.some((pattern) => name.includes(pattern));
  }

  /**
   * Analyze only specific files for dependencies (for incremental updates)
   * This is more efficient than full repository scan when only few files changed
   */
  async analyzeFiles(filePaths: string[]): Promise<DetectionResult> {
    const allReferences: Map<
      string,
      {
        url: string;
        contexts: Array<{ file: string; line?: number; text: string }>;
        detectionMethod: DetectionMethod;
      }
    > = new Map();

    let filesScanned = 0;
    let llmCalls = 0;
    let totalTokens = 0;
    let totalLatencyMs = 0;

    for (const filePath of filePaths) {
      // Validate that the file path is safe before joining
      const normalizedRepoPath = resolve(normalize(this.options.repoPath));
      const normalizedFilePath = normalize(filePath);
      const fullPath = resolve(normalizedRepoPath, normalizedFilePath);

      // Ensure the resolved path is within the repository boundaries
      // Use path.sep for cross-platform compatibility
      const repoPathWithSep = normalizedRepoPath.endsWith(sep)
        ? normalizedRepoPath
        : normalizedRepoPath + sep;

      if (!fullPath.startsWith(repoPathWithSep) && fullPath !== normalizedRepoPath) {
        // Skip files outside the repository to prevent path traversal
        if (process.env['DEBUG']) {
          console.warn(`Skipping file outside repository: ${filePath}`);
        }
        continue;
      }

      try {
        const content = await readFile(fullPath, 'utf-8');
        const relativePath = relative(this.options.repoPath, fullPath);
        const fileName = filePath.split('/').pop() || '';

        // Parse based on file type
        if (/^README/i.test(fileName)) {
          // README file
          const references = parseReadme(content, relativePath);
          for (const ref of references) {
            this.addReference(
              allReferences,
              ref.url,
              {
                file: relativePath,
                ...(ref.line !== undefined && { line: ref.line }),
                text: ref.context
              },
              'llm-analysis'
            );
          }
        } else if (/^(package\.json|requirements\.txt|Cargo\.toml|go\.mod)$/i.test(fileName)) {
          // Package file
          const metadata = this.parsePackageFile(fullPath, content);
          for (const url of [
            ...(metadata.urls || []),
            metadata.repository,
            metadata.homepage,
            metadata.documentation
          ].filter(Boolean)) {
            this.addReference(
              allReferences,
              url!,
              {
                file: relativePath,
                text: 'Package metadata'
              },
              'package-json'
            );
          }
        } else if (/\.(ts|js|tsx|jsx|py|rs|go|java|kt|cs|rb|php)$/.test(fileName)) {
          // Source file
          const references = parseCodeComments(content, relativePath);
          for (const ref of references) {
            this.addReference(
              allReferences,
              ref.url,
              {
                file: ref.file,
                line: ref.line,
                text: ref.context
              },
              'code-comment'
            );
          }
        } else if (/\.(md|txt|rst|adoc)$/.test(fileName)) {
          // Documentation file
          const references = parseReadme(content, relativePath);
          for (const ref of references) {
            this.addReference(
              allReferences,
              ref.url,
              {
                file: relativePath,
                ...(ref.line !== undefined && { line: ref.line }),
                text: ref.context
              },
              'llm-analysis'
            );
          }
        }

        filesScanned++;
      } catch (error) {
        // Skip files that can't be read - log but don't throw
        // Using console.warn since we don't have a logger instance here
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to analyze ${filePath}: ${message}`);
        if (process.env['DEBUG']) {
          // Log full error details when DEBUG is enabled
          console.debug('Full error while analyzing %s:', filePath, error);
        }
      }
    }

    // Create dependency entries
    const dependencies: DependencyEntry[] = [];

    for (const [url, refData] of allReferences.entries()) {
      const contextText = refData.contexts.map((c) => c.text).join(' ');

      // Step 3: Programmatic type categorization
      let type = this.determineDependencyType(url, contextText);

      // Step 4: LLM fallback for type categorization (if needed)
      if (!type && refData.contexts.length > 0) {
        const startTime = Date.now();
        try {
          const prompt = createClassificationPrompt(url, contextText);
          const response = await this.options.llmProvider.analyze('', prompt);

          llmCalls++;
          totalTokens += response.usage?.totalTokens || 0;
          totalLatencyMs += Date.now() - startTime;

          // Use rawResponse for classification
          const responseText = (response.rawResponse || '').toLowerCase();
          type = (
            responseText.includes('schema')
              ? 'schema'
              : responseText.includes('documentation')
                ? 'documentation'
                : responseText.includes('research') || responseText.includes('paper')
                  ? 'research-paper'
                  : responseText.includes('implementation')
                    ? 'reference-implementation'
                    : responseText.includes('example')
                      ? 'api-example'
                      : 'other'
          ) as DependencyType;
        } catch {
          type = 'other';
        }
      }

      if (!type) {
        type = 'other';
      }

      // Step 5: Programmatic access method determination
      let accessMethod = this.determineAccessMethod(url);
      if (!accessMethod) {
        accessMethod = 'http'; // Default fallback
      }

      const dependency: DependencyEntry = {
        id: randomUUID(),
        url,
        type,
        accessMethod,
        name: this.extractName(url),
        currentStateHash: `sha256:pending`,
        detectionMethod: refData.detectionMethod,
        detectionConfidence: refData.detectionMethod === 'manual' ? 1.0 : 0.85,
        detectedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        auth: undefined,
        referencedIn: refData.contexts.map((ctx) => ({
          file: ctx.file,
          line: ctx.line,
          context: ctx.text
        })),
        changeHistory: []
      };

      dependencies.push(dependency);
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
}
