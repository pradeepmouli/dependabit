/**
 * LLM Provider Interface
 * T033 [P] [US1] Implement LLM provider interface
 */

export interface LLMAnalysisResult {
  dependencies: DetectedDependency[];
  confidence: number;
  metadata: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    provider: string;
  };
}

export interface DetectedDependency {
  url: string;
  type: string;
  name?: string;
  description?: string;
  confidence: number;
  context?: string;
}

export interface LLMClientOptions {
  provider: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Base interface for LLM providers
 */
export interface LLMClient {
  /**
   * Analyze content and detect external dependencies
   */
  analyze(content: string, options?: AnalyzeOptions): Promise<LLMAnalysisResult>;

  /**
   * Get provider metadata
   */
  getProvider(): string;
}

export interface AnalyzeOptions {
  /**
   * Context about what's being analyzed
   */
  context?: {
    filePath?: string;
    fileType?: string;
    repoName?: string;
  };

  /**
   * Maximum number of dependencies to return
   */
  maxResults?: number;

  /**
   * Minimum confidence threshold (0-1)
   */
  minConfidence?: number;
}
