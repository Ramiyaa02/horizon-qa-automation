#!/usr/bin/env ts-node
/**
 * Lighthouse Audit CLI — Phase 3 Step 2 execution.
 *
 * Usage:
 *   npm run lh -- https://example.com
 */

import { validateUrl } from '../src/validate-url';
import { runLighthouse } from '../src/run-lighthouse';

async function main(): Promise<void> {
  const target = process.argv[2];

  if (!target) {
    console.error('Usage: npm run lh -- <url>');
    console.error('Example: npm run lh -- https://example.com');
    process.exit(1);
  }

  try {
    const url = validateUrl(target);
    console.log('Lighthouse Audit');
    console.log(`Target: ${url}`);
    console.log('');
    console.log('Running Lighthouse...');

    const result = await runLighthouse(url);

    console.log('Lighthouse scan completed successfully.');
    console.log(`Lighthouse version: ${result.lighthouseVersion}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

(async () => {
  await main();
})();
