#!/usr/bin/env ts-node
/**
 * Lighthouse Audit CLI — Phase 3 Step 2 execution + Step 3 summary + Step 4 quality gates.
 *
 * Usage:
 *   npm run lh -- https://example.com
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateUrl } from '../src/validate-url';
import { runLighthouse } from '../src/run-lighthouse';
import { parseLighthouseResult } from '../src/parse-results';
import { generateRecommendations, type Recommendation } from '../src/rule-engine';
import { evaluateQualityGates, type QualityGateConfig, type QualityGatesResult } from '../src/gates';

function loadQualityGatesConfig(): QualityGateConfig {
  const configPath = path.resolve(__dirname, '..', 'config', 'quality-gates.json');
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content) as QualityGateConfig;
}

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

function printRecommendations(recommendations: Recommendation[]): void {
  console.log('');
  console.log('Recommendations');
  console.log('────────────────────────────────────');

  if (recommendations.length === 0) {
    console.log('No actionable issues detected.');
    return;
  }

  for (const rec of recommendations) {
    const severity = rec.severity.toUpperCase();
    const title = rec.title;
    const fix = rec.fix;

    console.log(`[${severity}] ${title}`);
    console.log(`Fix: ${fix}`);
    console.log('');
  }
}

function printQualityGates(result: QualityGatesResult): void {
  console.log('');
  console.log('Quality Gates');
  console.log('────────────────────────────────────');

  for (const gate of result.gates) {
    const status = gate.passed ? 'PASS' : 'FAIL';
    const actual = gate.actual !== null ? gate.actual : 'N/A';
    console.log(`${gate.category}:${' '.repeat(Math.max(1, 18 - gate.category.length))}${actual} / ${gate.minimum}   ${status}`);
  }

  console.log('');
  console.log(`Overall: ${result.overallPassed ? 'PASS' : 'FAIL'}`);
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
    const recommendations = generateRecommendations(summary);
    const qualityGatesConfig = loadQualityGatesConfig();
    const qualityGatesResult = evaluateQualityGates(summary, qualityGatesConfig);

    console.log('Lighthouse scan completed successfully.');
    printSummary(summary);
    printRecommendations(recommendations);
    printQualityGates(qualityGatesResult);

    if (!qualityGatesResult.overallPassed) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

(async () => {
  await main();
})();
