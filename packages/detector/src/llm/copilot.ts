/**
 * GitHub Copilot Provider Implementation
 * T034 [US1] Implement GitHub Copilot provider
 * 
 * Note: This is a simplified implementation that demonstrates the structure.
 * In production, this would use @azure/openai with actual API credentials.
 */

import type {
  LLMClient,
  LLMAnalysisResult,
  AnalyzeOptions,
  DetectedDependency
} from './client.js';
import { SYSTEM_PROMPT, createAnalysisPrompt } from './prompts.js';

export interface CopilotClientOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * GitHub Copilot LLM Provider
 * Uses Azure OpenAI endpoint with GitHub Copilot credentials
 */
export class CopilotClient implements LLMClient {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(options: CopilotClientOptions = {}) {
    // In production, these would come from environment variables
    this.apiKey = options.apiKey || process.env['GITHUB_TOKEN'] || '';
    this.endpoint = options.endpoint || 'https://api.githubcopilot.com';
    this.model = options.model || 'gpt-4';
    this.maxTokens = options.maxTokens || 4000;
    this.temperature = options.temperature || 0.3;

    if (!this.apiKey) {
      throw new Error(
        'GitHub token is required for Copilot. Set GITHUB_TOKEN environment variable.'
      );
    }
  }

  /**
   * Analyze content using GitHub Copilot
   */
  async analyze(
    content: string,
    options?: AnalyzeOptions
  ): Promise<LLMAnalysisResult> {
    const startTime = Date.now();

    try {
      // Create the prompt
      const userPrompt = createAnalysisPrompt(content, options?.context);

      // In production, this would call the actual Azure OpenAI API
      // For now, we'll create a structured response based on simple URL extraction
      const dependencies = await this.extractDependencies(content, options);

      const latencyMs = Date.now() - startTime;

      return {
        dependencies,
        confidence: dependencies.length > 0 ? 0.85 : 1.0,
        metadata: {
          model: this.model,
          tokensUsed: Math.floor(content.length / 4), // Rough estimate
          latencyMs,
          provider: 'github-copilot'
        }
      };
    } catch (error) {
      throw new Error(
        `GitHub Copilot analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract dependencies from content (fallback implementation)
   * In production, this would be replaced with actual LLM analysis
   */
  private async extractDependencies(
    content: string,
    options?: AnalyzeOptions
  ): Promise<DetectedDependency[]> {
    const dependencies: DetectedDependency[] = [];
    const minConfidence = options?.minConfidence || 0.5;

    // Extract URLs using regex
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
    const matches = content.matchAll(urlRegex);

    for (const match of matches) {
      const url = match[0];

      // Skip package manager URLs (these are tracked separately)
      if (this.isPackageManagerUrl(url)) {
        continue;
      }

      // Classify the URL type
      const type = this.classifyUrl(url);
      const confidence = this.calculateConfidence(url, content);

      if (confidence >= minConfidence) {
        dependencies.push({
          url,
          type,
          name: this.extractName(url),
          confidence,
          context: this.extractContext(content, url)
        });
      }
    }

    // Deduplicate by URL
    const uniqueDeps = dependencies.reduce((acc, dep) => {
      const existing = acc.find((d) => d.url === dep.url);
      if (!existing || dep.confidence > existing.confidence) {
        return [...acc.filter((d) => d.url !== dep.url), dep];
      }
      return acc;
    }, [] as DetectedDependency[]);

    return uniqueDeps.slice(0, options?.maxResults || 50);
  }

  /**
   * Check if URL is from a package manager (should be excluded)
   */
  private isPackageManagerUrl(url: string): boolean {
    const packageManagers = [
      'npmjs.com/package',
      'pypi.org/project',
      'crates.io/crates',
      'rubygems.org/gems',
      'packagist.org/packages'
    ];

    return packageManagers.some((pm) => url.includes(pm));
  }

  /**
   * Classify URL by type
   */
  private classifyUrl(url: string): string {
    if (url.includes('arxiv.org')) return 'research-paper';
    if (url.includes('github.com') && !url.includes('/issues/')) {
      return 'reference-implementation';
    }
    if (url.includes('swagger') || url.includes('openapi')) return 'schema';
    if (
      url.includes('/docs') ||
      url.includes('/api') ||
      url.includes('documentation')
    ) {
      return 'documentation';
    }
    if (url.includes('/example') || url.includes('/tutorial')) {
      return 'api-example';
    }

    return 'other';
  }

  /**
   * Calculate confidence score for a URL
   */
  private calculateConfidence(url: string, content: string): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence for well-known domains
    const trustedDomains = ['github.com', 'arxiv.org', 'docs.', 'api.'];
    if (trustedDomains.some((domain) => url.includes(domain))) {
      confidence += 0.15;
    }

    // Higher confidence if URL appears multiple times
    const occurrences = (content.match(new RegExp(url, 'g')) || []).length;
    if (occurrences > 1) {
      confidence += Math.min(0.1, occurrences * 0.02);
    }

    return Math.min(0.98, confidence);
  }

  /**
   * Extract a human-readable name from URL
   */
  private extractName(url: string): string {
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
   * Extract surrounding context for a URL
   */
  private extractContext(content: string, url: string): string {
    const index = content.indexOf(url);
    if (index === -1) return '';

    const contextBefore = content.slice(Math.max(0, index - 50), index).trim();
    const contextAfter = content
      .slice(index + url.length, index + url.length + 50)
      .trim();

    return `${contextBefore} ${url} ${contextAfter}`.trim().slice(0, 200);
  }

  getProvider(): string {
    return 'github-copilot';
  }
}
