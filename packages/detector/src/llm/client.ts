/**
 * LLM Provider Interface
 * Abstraction layer for different LLM providers (GitHub Copilot, Claude, OpenAI, etc.)
 *
 * @remarks
 * All providers must implement this interface.  The detector relies on the
 * `analyze` method to parse raw LLM JSON output; provider implementations are
 * responsible for extracting the `dependencies` array from the model response.
 *
 * @never
 * - **Output format instability**: the schema of `LLMResponse` (specifically
 *   the `dependencies` array) may silently break when the underlying model
 *   is updated.  Pin the model version in `LLMProviderConfig.model` and
 *   run integration tests after upgrades.
 * - **Non-determinism**: even at `temperature: 0` some providers do not
 *   guarantee identical outputs across calls.  Never cache results and
 *   compare them across model versions.
 * - **Token budget**: providers that truncate the prompt silently return
 *   fewer dependencies without raising an error.  Check `LLMUsageMetadata`
 *   for unusually low `promptTokens` values.
 */

import type { z } from 'zod';

/**
 * Rate limit information returned by {@link LLMProvider.getRateLimit}.
 *
 * @category Detector
 */
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

/**
 * Token usage and latency metadata included in every {@link LLMResponse}.
 *
 * @remarks
 * `totalTokens` is the sum of `promptTokens` and `completionTokens`.
 * Unusually low `promptTokens` may indicate the provider silently truncated
 * the input, which can produce incomplete dependency lists.
 *
 * @category Detector
 */
export interface LLMUsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  latencyMs: number;
}

/**
 * A single dependency detected by the LLM.
 *
 * @remarks
 * `confidence` is provider-supplied and not independently validated — treat
 * values below `0.7` as low-quality detections that should be reviewed
 * manually.  The detector filters entries with `confidence < 0.5`.
 *
 * @category Detector
 */
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
  /** Detection confidence in the range [0.0, 1.0]. */
  confidence: number;
  /** LLM's explanation of why this was classified as a dependency. */
  reasoning?: string;
}

/**
 * The structured response returned by {@link LLMProvider.analyze}.
 *
 * @remarks
 * `rawResponse` is preserved for debugging purposes.  When the LLM returns
 * malformed JSON, provider implementations typically return an empty
 * `dependencies` array rather than throwing, so callers should not assume
 * an empty array means the LLM was not called.
 *
 * @category Detector
 */
export interface LLMResponse {
  dependencies: DetectedDependency[];
  usage: LLMUsageMetadata;
  /** Raw model output; present only when the provider preserves it. */
  rawResponse?: string;
}

/**
 * Configuration passed to an LLM provider at construction time.
 *
 * @config
 * @category Detector
 *
 * @never
 * - `model` controls which checkpoint is used. Leaving it `undefined` causes
 *   the provider to select its default, which can change between SDK
 *   versions — pin the model to avoid silent classification drift.
 * - `maxTokens` caps the completion, not the prompt.  Very large repository
 *   files will still consume prompt budget; use `Detector.ignorePatterns`
 *   to exclude large generated files.
 */
export interface LLMProviderConfig {
  apiKey?: string;
  endpoint?: string;
  /** Model identifier; pin this value to avoid classification drift. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Contract that all LLM provider implementations must satisfy.
 *
 * @remarks
 * The only method called by the {@link Detector} is `analyze`.
 * `getSupportedModels`, `getRateLimit`, and `validateConfig` exist for
 * diagnostic and health-check purposes.
 *
 * @category Detector
 *
 * @useWhen
 * You need to plug in a custom or self-hosted language model as the
 * classification backend for the detector.
 *
 * @avoidWhen
 * You only need programmatic heuristics — constructing a stub provider that
 * always returns an empty `dependencies` array has a small overhead but is
 * safe.
 *
 * @never
 * - Provider implementations must return valid JSON matching the
 *   `LLMResponse` shape.  Returning plain text causes the detector to
 *   silently produce zero LLM-sourced results.
 * - Do NOT cache the `analyze` response across different `model` values —
 *   classification schemes differ between model versions.
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
 * Factory stub — instantiate a named LLM provider.
 *
 * @remarks
 * This function is currently a placeholder and always throws.  Use the
 * concrete provider class directly (e.g., {@link GitHubCopilotProvider})
 * instead.
 *
 * @param providerName - Name of the provider (e.g. `'github-copilot'`).
 * @param config - Provider configuration.
 *
 * @throws {Error} Always — concrete providers are not yet wired here.
 *
 * @category Detector
 *
 * @deprecated Use the concrete provider classes exported from
 * `@dependabit/detector` (e.g. `GitHubCopilotProvider`) directly.
 */
export function createLLMProvider(providerName: string, config: LLMProviderConfig): LLMProvider {
  // Implementation will be in specific provider files
  throw new Error(`Provider ${providerName} not yet implemented`);
}
