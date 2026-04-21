/**
 * Detector Orchestrator
 * Coordinates content parsers and LLM analysis to detect external dependencies
 */

import { readdir, readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, normalize, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import ignore, { type Ignore } from 'ignore';
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

/**
 * Configuration options for the {@link Detector} orchestrator.
 *
 * @remarks
 * All options except `repoPath` and `llmProvider` have safe defaults.
 * The detector respects `.gitignore` files and git's global excludes file
 * by default; set `useGitExcludes` to `false` to disable that behaviour.
 *
 * @config
 * @category Detector
 *
 * @useWhen
 * You want to scan a local repository clone for informational dependencies
 * that package managers do not track.
 *
 * @avoidWhen
 * The repository has not been cloned to disk — the detector reads files
 * from the filesystem and cannot operate on a bare Git remote.
 *
 * @never
 * - `ignorePatterns` performs substring matching on path segments; overly
 *   broad patterns (e.g. `"src"`) will silently exclude large parts of the
 *   repository.
 * - `repoOwner` / `repoName` are used to filter self-referential URLs from
 *   results. Omitting them causes the repo's own URLs to appear as
 *   dependencies.
 * - Token budgets: the LLM provider is called once per README (up to 5) and
 *   once per unclassified URL. Large repositories with many READMEs can
 *   exhaust the provider's context window mid-run; truncation at 5 000
 *   characters per document is intentional but may miss late-appearing URLs.
 */
export interface DetectorOptions {
  /** Absolute path to the root of the repository on disk. */
  repoPath: string;
  /** LLM provider used for document analysis and dependency classification. */
  llmProvider: LLMProvider;
  /**
   * Path segments to exclude during directory traversal.
   * @defaultValue `['node_modules', 'dist', 'build', 'target', 'vendor', 'venv', '__pycache__', 'coverage']`
   */
  ignorePatterns?: string[];
  /**
   * When `true`, `.gitignore` files and git's global excludes are loaded
   * and applied during traversal.
   * @defaultValue `true`
   */
  useGitExcludes?: boolean;
  /** GitHub owner used to filter self-referential URLs. */
  repoOwner?: string;
  /** GitHub repository name used to filter self-referential URLs. */
  repoName?: string;
}

/**
 * The result produced by {@link Detector.detectDependencies} or
 * {@link Detector.analyzeFiles}.
 *
 * @remarks
 * `statistics` are informational only — they track how many LLM calls were
 * made and the cumulative token cost.  Do not rely on `llmCalls` being zero
 * as an indicator that the LLM was not consulted; programmatic classification
 * may succeed without any LLM calls.
 *
 * @category Detector
 */
export interface DetectionResult {
  /** Discovered dependency entries ready for merging into a manifest. */
  dependencies: DependencyEntry[];
  /** Diagnostic counters for the scan run. */
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
  'dist',
  'build',
  'target',
  'vendor',
  'venv',
  '__pycache__',
  'coverage'
];

const ALLOWED_DOT_DIRECTORIES = new Set<string>();

/**
 * Orchestrates multi-stage detection of informational external dependencies
 * inside a local repository clone.
 *
 * @remarks
 * Detection follows a hybrid pipeline:
 * 1. Programmatic parsing of README files, documentation, package metadata,
 *    and code comments extracts candidate URLs.
 * 2. An LLM second-pass (up to 5 README files, capped at 5 000 chars each)
 *    enriches the candidate set with URLs that plain text parsing missed.
 * 3. Programmatic heuristics classify each URL's `DependencyType` and
 *    `AccessMethod`; an LLM fallback is used only when heuristics fail.
 * 4. Low-confidence entries (below 0.5) are discarded before returning.
 *
 * The detector does **not** write to disk or mutate any manifest file —
 * callers are responsible for merging the returned `DetectionResult` into
 * an existing manifest via `@dependabit/manifest`.
 *
 * @category Detector
 *
 * @useWhen
 * Scanning a freshly-cloned or locally-checked-out repository to build an
 * initial manifest, or during CI to detect newly-introduced dependencies from
 * a commit diff.
 *
 * @avoidWhen
 * - The repository is very large (> 10 000 source files) — source file
 *   scanning is hard-capped at 50 files per run.
 * - You need deterministic, reproducible output across model versions — LLM
 *   classifications are non-deterministic even with `temperature: 0`.
 *
 * @never
 * - **LLM output format instability**: the detector parses raw JSON from the
 *   LLM response; a model update that changes the output schema will silently
 *   produce zero LLM-sourced results rather than throwing.  Pin the model
 *   version in `DetectorOptions.llmProvider` when reproducibility matters.
 * - **Non-determinism**: identical inputs across two runs may produce
 *   different `dependencies` arrays if LLM classification is involved.
 *   Never diff two manifests by dependency count alone.
 * - **Token budget exhaustion**: manifests with large README files are
 *   truncated to 5 000 characters before being sent to the LLM.  URLs that
 *   appear only in the truncated portion will not be discovered by the LLM
 *   pass (they may still be found by the programmatic parser).
 * - **Source file cap**: only the first 50 source files returned by the
 *   directory traversal are scanned for code-comment references.  Repositories
 *   with many source files may have incomplete coverage.
 *
 * @example
 * ```ts
 * import { Detector } from '@dependabit/detector';
 * import { GitHubCopilotProvider } from '@dependabit/detector';
 *
 * const detector = new Detector({
 *   repoPath: '/path/to/repo',
 *   llmProvider: new GitHubCopilotProvider({ model: 'gpt-4o' }),
 *   repoOwner: 'my-org',
 *   repoName: 'my-repo',
 * });
 *
 * const result = await detector.detectDependencies();
 * console.log(`Found ${result.dependencies.length} dependencies`);
 * ```
 */
export class Detector {
  private options: Required<DetectorOptions>;
  private ignoreMatcher: Ignore | null = null;
  private ignoreMatcherLoaded = false;
  private skipUrlPatterns: RegExp[];

  constructor(options: DetectorOptions) {
    this.options = {
      ...options,
      ignorePatterns: options.ignorePatterns || DEFAULT_IGNORE_PATTERNS,
      useGitExcludes: options.useGitExcludes ?? true,
      repoOwner: options.repoOwner || '',
      repoName: options.repoName || ''
    };

    this.skipUrlPatterns = [
      /example\.com/,
      /example\.org/,
      /localhost/,
      /127\.0\.0\.1/,
      /\[.*\]/, // template placeholders like [NUMBER]
      /github\.com\/user\/repo/, // common placeholder in docs
      /your-?username/i, // template placeholder: your-username or yourusername
      /you\/your-project/i, // template: you/your-project
      /github\.com\/YOUR-?USERNAME/i, // GitHub template: YOUR-USERNAME
      /github\.com\/your-?username/i, // GitHub template: your-username
      // Self-reference: skip if URL matches current repository
      ...(this.options.repoOwner && this.options.repoName
        ? [
            new RegExp(
              `github\\.com\\/${this.options.repoOwner}\\/${this.options.repoName}(?:\\.git)?(?:[/?#]|$)`,
              'i'
            )
          ]
        : [])
    ];
  }

  /**
   * Performs a full-repository scan and returns all detected informational
   * dependencies as a {@link DetectionResult}.
   *
   * @remarks
   * The scan is bounded: README files are capped at 5 for LLM analysis,
   * source files at 50 for code-comment parsing.  Results are
   * non-deterministic when LLM classification is involved.
   *
   * @returns Detected dependencies and diagnostic statistics.
   *
   * @throws {Error} If the LLM provider's `analyze` call throws and the error
   * is not caught by the internal try-catch blocks (individual LLM failures
   * are logged and skipped; file-system errors bubble up).
   *
   * @category Detector
   *
   * @useWhen
   * Building an initial manifest for a repository or running a full refresh
   * on a schedule.
   *
   * @avoidWhen
   * Only a small subset of files changed — prefer {@link Detector.analyzeFiles}
   * for incremental updates to avoid unnecessary LLM calls.
   *
   * @never
   * - Results are **not** cached between calls; calling `detectDependencies`
   *   twice on the same instance makes duplicate LLM calls.
   * - The method does not deduplicate against an existing manifest; callers
   *   must use `mergeManifests` from `@dependabit/manifest` to avoid
   *   duplicate entries.
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

    // 1b. Parse non-README documentation files
    const documentationFiles = await this.findFiles(this.options.repoPath, /\.(md|txt|rst|adoc)$/i);
    for (const file of documentationFiles) {
      if (/^README/i.test(basename(file))) {
        continue;
      }

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

    // 1c. Parse package files for metadata (NOT dependencies)
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

    // 1d. Parse code comments from source files
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
      // Skip entries that will end up with low confidence
      // (entries that can't be typed programmatically and LLM assigns low confidence)
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

      // Skip low-confidence entries
      if (typeConfidence < 0.5) {
        continue;
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
    // Skip URLs that don't start with http:// or https://
    if (!/^https?:\/\//.test(url)) {
      return;
    }

    // Skip URLs matching skip patterns (placeholders, localhost, etc.)
    if (this.skipUrlPatterns.some((pattern) => pattern.test(url))) {
      return;
    }

    // Skip self-references (URLs pointing to the repo itself)
    if (this.options.repoOwner && this.options.repoName) {
      const selfPattern = new RegExp(
        `github\\.com[/:]${this.escapeRegExp(this.options.repoOwner)}/${this.escapeRegExp(this.options.repoName)}(?:/|$|#|\\?)`,
        'i'
      );
      if (selfPattern.test(url)) {
        return;
      }
    }

    if (!map.has(url)) {
      map.set(url, {
        url,
        contexts: [],
        detectionMethod
      });
    }
    map.get(url)!.contexts.push(context);
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    const isGitHubRepositoryUrl = /^https?:\/\/github\.com\/[^/]+\/[^/#?]+(?:$|[/?#])/.test(
      lowerUrl
    );

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
      isGitHubRepositoryUrl ||
      (lowerUrl.includes('github.com') &&
        (lowerContext.includes('example') ||
          lowerContext.includes('implementation') ||
          lowerContext.includes('reference')))
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

        if (await this.shouldIgnorePath(fullPath, entry.isDirectory())) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, pattern);
          files.push(...subFiles);
        } else if (pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
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

  private async shouldIgnorePath(filePath: string, isDirectory = false): Promise<boolean> {
    if (this.isDotDirectoryPath(filePath)) {
      return true;
    }

    const segments = normalize(filePath).split(sep);
    if (segments.some((segment) => this.shouldIgnore(segment))) {
      return true;
    }

    return await this.isGitIgnored(filePath, isDirectory);
  }

  private isDotDirectoryPath(filePath: string): boolean {
    const segments = normalize(filePath).split(sep);
    return segments.some(
      (segment) =>
        segment.startsWith('.') && segment.length > 1 && !ALLOWED_DOT_DIRECTORIES.has(segment)
    );
  }

  private isDotDirectoryName(name: string): boolean {
    return name.startsWith('.') && name.length > 1 && !ALLOWED_DOT_DIRECTORIES.has(name);
  }

  private async isGitIgnored(filePath: string, isDirectory: boolean): Promise<boolean> {
    if (!this.options.useGitExcludes) {
      return false;
    }
    const matcher = await this.getIgnoreMatcher();
    if (!matcher) {
      return false;
    }

    const relativePath = this.getRepoRelativePath(filePath);
    if (!relativePath) {
      return false;
    }

    const normalized = relativePath.split(sep).join('/');
    const testPath = isDirectory ? `${normalized}/` : normalized;
    return matcher.ignores(testPath);
  }

  private getRepoRelativePath(filePath: string): string | null {
    const repoPath = resolve(normalize(this.options.repoPath));
    const normalizedPath = resolve(normalize(filePath));

    if (normalizedPath === repoPath) {
      return '';
    }

    if (normalizedPath.startsWith(repoPath + sep)) {
      return relative(repoPath, normalizedPath);
    }

    return normalize(filePath);
  }

  private async getIgnoreMatcher(): Promise<Ignore | null> {
    if (this.ignoreMatcherLoaded) {
      return this.ignoreMatcher;
    }

    this.ignoreMatcherLoaded = true;

    if (!this.options.useGitExcludes) {
      this.ignoreMatcher = null;
      return this.ignoreMatcher;
    }

    try {
      const matcher = ignore();
      const gitignoreFiles = await this.collectGitignoreFiles(this.options.repoPath);
      const extraIgnoreFiles = this.collectExtraIgnoreFiles();

      for (const filePath of gitignoreFiles) {
        const content = await readFile(filePath, 'utf-8');
        const rules = this.prefixGitignoreRules(filePath, content);
        if (rules.length > 0) {
          matcher.add(rules);
        }
      }

      for (const filePath of extraIgnoreFiles) {
        try {
          const content = await readFile(filePath, 'utf-8');
          const rules = this.prefixGitignoreRules(filePath, content, '');
          if (rules.length > 0) {
            matcher.add(rules);
          }
        } catch {
          // Ignore missing or unreadable global ignore files
        }
      }

      this.ignoreMatcher = matcher;
    } catch {
      this.ignoreMatcher = null;
    }

    return this.ignoreMatcher;
  }

  private async collectGitignoreFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (this.isDotDirectoryName(entry.name) || this.shouldIgnore(entry.name)) {
            continue;
          }
          files.push(...(await this.collectGitignoreFiles(join(dir, entry.name))));
        } else if (entry.isFile() && entry.name === '.gitignore') {
          files.push(join(dir, entry.name));
        }
      }
    } catch {
      // Ignore errors
    }

    return files;
  }

  private prefixGitignoreRules(filePath: string, content: string, basePrefix?: string): string[] {
    const repoPath = resolve(normalize(this.options.repoPath));
    const ignoreDir = dirname(filePath);
    const relativeDir = relative(repoPath, ignoreDir).split(sep).join('/');
    const prefix = basePrefix !== undefined ? basePrefix : relativeDir ? `${relativeDir}/` : '';

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const negated = line.startsWith('!');
        const raw = negated ? line.slice(1) : line;
        const trimmed = raw.startsWith('/') ? raw.slice(1) : raw;
        const scoped = `${prefix}${trimmed}`;
        return negated ? `!${scoped}` : scoped;
      });
  }

  private collectExtraIgnoreFiles(): string[] {
    const files = new Set<string>();

    files.add(join(this.options.repoPath, '.git', 'info', 'exclude'));

    const globalConfig = this.getGlobalExcludeFileFromGit();
    if (globalConfig) {
      files.add(globalConfig);
    }

    for (const fallback of this.getDefaultGlobalExcludeFiles()) {
      files.add(fallback);
    }

    return Array.from(files);
  }

  private getGlobalExcludeFileFromGit(): string | null {
    try {
      const output = execSync('git config --get core.excludesfile', {
        stdio: ['ignore', 'pipe', 'ignore']
      })
        .toString()
        .trim();

      if (!output) {
        return null;
      }

      return this.expandHomePath(output);
    } catch {
      return null;
    }
  }

  private getDefaultGlobalExcludeFiles(): string[] {
    const home = homedir();
    return [
      join(home, '.config', 'git', 'ignore'),
      join(home, '.gitignore_global'),
      join(home, '.gitignore')
    ];
  }

  private expandHomePath(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return join(homedir(), filePath.slice(2));
    }
    if (filePath === '~') {
      return homedir();
    }
    return filePath;
  }

  /**
   * Analyzes a specific list of files for dependencies rather than scanning
   * the entire repository.  Prefer this over {@link Detector.detectDependencies}
   * when only a handful of files changed (e.g., in a pull-request diff).
   *
   * @param filePaths - Absolute or `repoPath`-relative file paths to analyze.
   *   Paths outside the repository root are silently skipped to prevent
   *   directory-traversal attacks.
   *
   * @returns Detected dependencies and diagnostic statistics.
   *
   * @remarks
   * Unlike `detectDependencies`, this method does NOT perform an LLM second
   * pass on README files.  Classification still falls back to the LLM when
   * programmatic heuristics cannot determine a dependency type.
   *
   * @category Detector
   *
   * @useWhen
   * Incremental manifest updates after a commit or pull request — pass the
   * list of changed files from the diff parser.
   *
   * @avoidWhen
   * Running a full initial scan — use {@link Detector.detectDependencies}
   * instead, which also performs an LLM enrichment pass.
   *
   * @never
   * - Files outside `repoPath` are **silently** skipped without error.
   *   Callers relying on path-traversal behaviour will get empty results.
   * - File read errors are logged with `console.warn` and skipped, not
   *   thrown; a broken file system will produce partial results without
   *   surfacing an error.
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
      if (await this.shouldIgnorePath(filePath)) {
        continue;
      }
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
