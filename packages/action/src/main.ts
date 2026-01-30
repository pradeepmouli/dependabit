/**
 * Main Action Entry Point
 */

import * as core from '@actions/core';
import { generateManifest } from './actions/generate.js';
import { getActionInputs, validateInputs } from './utils/inputs.js';
import { formatErrorMessage } from './utils/outputs.js';
import { logInfo } from './logger.js';

async function run(): Promise<void> {
  try {
    // Get and validate inputs
    const inputs = getActionInputs();
    validateInputs(inputs);

    logInfo('Starting dependabit action', { inputs });

    // Run manifest generation
    await generateManifest({
      repoPath: inputs.repoPath,
      manifestPath: inputs.manifestPath,
      llmProvider: inputs.llmProvider
    });

    logInfo('Action completed successfully');
  } catch (error) {
    const errorMessage = formatErrorMessage(
      error instanceof Error ? error : new Error(String(error)),
      { action: 'generate' }
    );

    core.setFailed(errorMessage);
  }
}

// Run the action
run();
