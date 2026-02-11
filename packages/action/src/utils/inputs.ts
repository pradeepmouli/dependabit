/**
 * Action Input Parsing
 * Handles parsing and validation of GitHub Action inputs
 */

import * as core from '@actions/core';

export interface GenerateActionInputs {
  repoPath: string;
  llmProvider: 'github-copilot' | 'claude' | 'openai';
  llmModel?: string;
  llmApiKey?: string;
  manifestPath: string;
  configPath?: string;
  enableDebug: boolean;
}

export interface UpdateActionInputs {
  repoPath: string;
  manifestPath: string;
  commits: string[]; // Commit SHAs to analyze
  configPath?: string;
}

export interface CheckActionInputs {
  manifestPath: string;
  createIssues: boolean;
  issueLabels: string[];
}

/**
 * Parse inputs for the generate action
 */
export function parseGenerateInputs(): GenerateActionInputs {
  const llmModelInput = core.getInput('llm_model');
  const llmApiKeyInput =
    core.getInput('llm_api_key') || process.env['GITHUB_TOKEN'] || process.env['OPENAI_API_KEY'];

  return {
    repoPath: core.getInput('repo_path') || process.cwd(),
    llmProvider: (core.getInput('llm_provider') || 'github-copilot') as 'github-copilot',
    ...(llmModelInput && { llmModel: llmModelInput }),
    ...(llmApiKeyInput && { llmApiKey: llmApiKeyInput }),
    manifestPath: core.getInput('manifest_path') || '.dependabit/manifest.json',
    ...(core.getInput('config_path') && { configPath: core.getInput('config_path') }),
    enableDebug: core.getInput('debug') === 'true'
  };
}

/**
 * Parse inputs for the update action
 */
export function parseUpdateInputs(): UpdateActionInputs {
  const commitsInput = core.getInput('commits');
  const commits = commitsInput ? commitsInput.split(',').map((c) => c.trim()) : [];

  return {
    repoPath: core.getInput('repo_path') || process.cwd(),
    manifestPath: core.getInput('manifest_path') || '.dependabit/manifest.json',
    commits,
    ...(core.getInput('config_path') && { configPath: core.getInput('config_path') })
  };
}

/**
 * Parse inputs for the check action
 */
export function parseCheckInputs(): CheckActionInputs {
  const labelsInput = core.getInput('issue_labels');
  const labels = labelsInput
    ? labelsInput.split(',').map((l) => l.trim())
    : ['dependabit', 'dependency-update'];

  return {
    manifestPath: core.getInput('manifest_path') || '.dependabit/manifest.json',
    createIssues: core.getBooleanInput('create_issues') !== false,
    issueLabels: labels
  };
}
