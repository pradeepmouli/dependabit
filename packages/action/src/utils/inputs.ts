/**
 * Action Input Parsing
 * T042 [US1] Implement action input parsing
 */

import * as core from '@actions/core';

export interface ActionInputs {
  /**
   * LLM provider to use
   */
  llmProvider: string;

  /**
   * Output path for manifest
   */
  manifestPath: string | undefined;

  /**
   * Repository path
   */
  repoPath: string | undefined;

  /**
   * Minimum confidence threshold (0-1)
   */
  minConfidence: number | undefined;
}

/**
 * Get and validate action inputs
 */
export function getActionInputs(): ActionInputs {
  const llmProvider = core.getInput('llm-provider') || 'github-copilot';
  const manifestPath = core.getInput('manifest-path') || undefined;
  const repoPath = core.getInput('repo-path') || undefined;
  const minConfidenceStr = core.getInput('min-confidence');

  let minConfidence: number | undefined;
  if (minConfidenceStr) {
    minConfidence = parseFloat(minConfidenceStr);
    if (isNaN(minConfidence) || minConfidence < 0 || minConfidence > 1) {
      core.warning(
        `Invalid min-confidence value: ${minConfidenceStr}. Must be between 0 and 1. Using default.`
      );
      minConfidence = undefined;
    }
  }

  return {
    llmProvider,
    manifestPath,
    repoPath,
    minConfidence
  };
}

/**
 * Validate required inputs
 */
export function validateInputs(inputs: ActionInputs): void {
  // Currently only github-copilot is implemented
  const implementedProviders = ['github-copilot'];
  const validProviders = ['github-copilot', 'claude', 'openai'];

  if (!implementedProviders.includes(inputs.llmProvider)) {
    core.warning(
      `LLM provider '${inputs.llmProvider}' is not yet implemented. Falling back to 'github-copilot'. ` +
      `Valid providers: ${validProviders.join(', ')} (only github-copilot currently implemented)`
    );
  }
}
