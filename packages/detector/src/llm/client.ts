/**
 * LLM Provider Interface
 * Abstraction layer for different LLM providers (GitHub Copilot, Claude, OpenAI, etc.)
 */

import type { z } from 'zod';

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

export interface LLMUsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  latencyMs: number;
}

export interface DetectedDependency {
  url: string;
  name: string;
  description?: string;
  type:
    | 'reference-implementation'
    | 'schema'
    | 'documentation'
    | 'research-paper'
    | 'api-example'
    | 'other';
  confidence: number; // 0.0 - 1.0
  reasoning?: string; // Why this was detected as a dependency
}

export interface LLMResponse {
  dependencies: DetectedDependency[];
  usage: LLMUsageMetadata;
  rawResponse?: string; // For debugging
}

export interface LLMProviderConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Base interface that all LLM providers must implement
 */
export interface LLMProvider {
  /**
   * Analyze content and detect external dependencies
   * @param content - Text content to analyze (README, code, etc.)
   * @param prompt - Detection prompt template
   * @returns LLM response with detected dependencies
   */
  analyze(content: string, prompt: string): Promise<LLMResponse>;

  /**
   * Get list of supported models for this provider
   */
  getSupportedModels(): string[];

  /**
   * Get current rate limit status
   */
  getRateLimit(): Promise<RateLimitInfo>;

  /**
   * Validate provider configuration
   */
  validateConfig(): boolean;
}

/**
 * Create an LLM provider instance
 */
export function createLLMProvider(providerName: string, config: LLMProviderConfig): LLMProvider {
  // Implementation will be in specific provider files
  throw new Error(`Provider ${providerName} not yet implemented`);
}
