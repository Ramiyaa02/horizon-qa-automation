#!/usr/bin/env ts-node
/**
 * Lighthouse Audit CLI — Phase 3 Step 2 execution + Step 3 summary.
 *
 * Usage:
 *   npm run lh -- https://example.com
 */

import { validateUrl } from '../src/validate-url';
import { runLighthouse } from '../src/run-lighthouse';
import { parseLighthouseResult } from '../src/parse-results';

function printSummary(summary: ReturnType<typeof parseLighthouseResult>): void {
  console.log('');
  console.log('Scores');
  for (const category of summary.categoryScores) {
    console.log(`${category.name}:${' '.repeat(Math.max(1, 18 - category.name.length))}${category.score}`);
  }

  console.log('');
  console.log('Core Metrics');
  for (const metric of summary.coreMetrics) {
    const value = metric.displayValue ?? 'N/A';
    console.log(`${metric.title}:${' '.repeat(Math.max(1, 18 - metric.title.length))}${value}`);
  }
}

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

    const rawResult = await runLighthouse(url);
    const summary = parseLighthouseResult(rawResult);

    console.log('Lighthouse scan completed successfully.');
    printSummary(summary);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

(async () => {
  await main();
})();
