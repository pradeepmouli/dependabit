/**
 * Entry point for `@dependabit/action`.
 *
 * @remarks
 * Reads the `action` input from the GitHub Actions runtime and dispatches to
 * the appropriate sub-action: `generate`, `update`, or `validate`.
 * The `check` action is not yet implemented and will call `core.setFailed`.
 *
 * The `main` function is called immediately on module load.  It is also
 * exported for testing purposes.
 *
 * @category Action
 */

import * as core from '@actions/core';
import { run as runGenerate } from './actions/generate.js';
import { run as runUpdate } from './actions/update.js';
import { run as runValidate } from './actions/validate.js';

async function main(): Promise<void> {
  const action = core.getInput('action') || 'generate';

  switch (action) {
    case 'generate':
      await runGenerate();
      break;

    case 'update':
      await runUpdate();
      break;

    case 'check':
      core.setFailed('Check action not yet implemented');
      break;

    case 'validate':
      await runValidate();
      break;

    default:
      core.setFailed(`Unknown action: ${action}`);
  }
}

// Run the action
main().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});

// Export for testing
export { main };
export * from './logger.js';
