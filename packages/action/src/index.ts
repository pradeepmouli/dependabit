/**
 * Entry point for @dependabit/action
 * Routes to the appropriate action based on input
 */

import * as core from '@actions/core';
import { run as runGenerate } from './actions/generate.js';

async function main(): Promise<void> {
  const action = core.getInput('action') || 'generate';

  switch (action) {
    case 'generate':
      await runGenerate();
      break;
    
    case 'update':
      core.setFailed('Update action not yet implemented');
      break;
    
    case 'check':
      core.setFailed('Check action not yet implemented');
      break;
    
    case 'validate':
      core.setFailed('Validate action not yet implemented');
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
