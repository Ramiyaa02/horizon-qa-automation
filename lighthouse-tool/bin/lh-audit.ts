#!/usr/bin/env ts-node
/**
 * Lighthouse Audit CLI — Phase 3 Step 1 foundation.
 *
 * Usage:
 *   npm run lh -- https://example.com
 *
 * This entry point only validates the target URL.
 * Actual Lighthouse execution is added in later phases.
 */

import { validateUrl } from '../src/validate-url';

function main(): void {
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
    console.log('URL validation passed.');
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
