/**
 * Focused unit tests for evaluateQualityGates.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/gates.test.ts
 */

import { evaluateQualityGates, type QualityGateConfig, type QualityGatesResult } from '../src/gates';

function assertEqual(actual: any, expected: any, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`FAIL: ${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- gates tests ---');

const defaultConfig: QualityGateConfig = {
  performance: 80,
  accessibility: 90,
  bestPractices: 90,
  seo: 80,
};

function summaryWithScores(scores: { name: string; score: number }[]): { categoryScores: { name: string; score: number }[] } {
  return { categoryScores: scores };
}

// 1. All gates pass
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 100 },
      { name: 'Accessibility', score: 96 },
      { name: 'Best Practices', score: 96 },
      { name: 'SEO', score: 91 },
    ]),
    defaultConfig
  ),
  {
    overallPassed: true,
    gates: [
      { category: 'Performance', actual: 100, minimum: 80, passed: true },
      { category: 'Accessibility', actual: 96, minimum: 90, passed: true },
      { category: 'Best Practices', actual: 96, minimum: 90, passed: true },
      { category: 'SEO', actual: 91, minimum: 80, passed: true },
    ],
  },
  'all gates pass when scores meet thresholds'
);

// 2. One category fails
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 78 },
      { name: 'Accessibility', score: 96 },
      { name: 'Best Practices', score: 96 },
      { name: 'SEO', score: 91 },
    ]),
    defaultConfig
  ),
  {
    overallPassed: false,
    gates: [
      { category: 'Performance', actual: 78, minimum: 80, passed: false },
      { category: 'Accessibility', actual: 96, minimum: 90, passed: true },
      { category: 'Best Practices', actual: 96, minimum: 90, passed: true },
      { category: 'SEO', actual: 91, minimum: 80, passed: true },
    ],
  },
  'one failing gate causes overall failure'
);

// 3. Multiple categories fail
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 70 },
      { name: 'Accessibility', score: 85 },
      { name: 'Best Practices', score: 80 },
      { name: 'SEO', score: 70 },
    ]),
    defaultConfig
  ),
  {
    overallPassed: false,
    gates: [
      { category: 'Performance', actual: 70, minimum: 80, passed: false },
      { category: 'Accessibility', actual: 85, minimum: 90, passed: false },
      { category: 'Best Practices', actual: 80, minimum: 90, passed: false },
      { category: 'SEO', actual: 70, minimum: 80, passed: false },
    ],
  },
  'multiple failing gates cause overall failure'
);

// 4. Score exactly equal to threshold passes
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 80 },
      { name: 'Accessibility', score: 90 },
      { name: 'Best Practices', score: 90 },
      { name: 'SEO', score: 80 },
    ]),
    defaultConfig
  ),
  {
    overallPassed: true,
    gates: [
      { category: 'Performance', actual: 80, minimum: 80, passed: true },
      { category: 'Accessibility', actual: 90, minimum: 90, passed: true },
      { category: 'Best Practices', actual: 90, minimum: 90, passed: true },
      { category: 'SEO', actual: 80, minimum: 80, passed: true },
    ],
  },
  'score exactly at threshold passes'
);

// 5. Score below threshold fails
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 79 },
    ]),
    { ...defaultConfig, performance: 80 }
  ),
  {
    overallPassed: false,
    gates: [
      { category: 'Performance', actual: 79, minimum: 80, passed: false },
      { category: 'Accessibility', actual: null, minimum: 90, passed: false },
      { category: 'Best Practices', actual: null, minimum: 90, passed: false },
      { category: 'SEO', actual: null, minimum: 80, passed: false },
    ],
  },
  'score below threshold fails'
);

// 6. Missing category score is handled safely
assertEqual(
  evaluateQualityGates(
    summaryWithScores([
      { name: 'Performance', score: 100 },
    ]),
    defaultConfig
  ),
  {
    overallPassed: false,
    gates: [
      { category: 'Performance', actual: 100, minimum: 80, passed: true },
      { category: 'Accessibility', actual: null, minimum: 90, passed: false },
      { category: 'Best Practices', actual: null, minimum: 90, passed: false },
      { category: 'SEO', actual: null, minimum: 80, passed: false },
    ],
  },
  'missing category scores are treated as failures'
);

// 7. Invalid threshold configuration is rejected
try {
  evaluateQualityGates(summaryWithScores([]), { ...defaultConfig, performance: -1 });
  console.error('FAIL: negative threshold should throw');
  process.exitCode = 1;
} catch (error) {
  const message = (error as Error).message;
  if (message.includes('Invalid threshold')) {
    console.log('PASS: negative threshold is rejected');
  } else {
    console.error(`FAIL: unexpected error: ${message}`);
    process.exitCode = 1;
  }
}

try {
  evaluateQualityGates(summaryWithScores([]), { ...defaultConfig, performance: 101 });
  console.error('FAIL: threshold > 100 should throw');
  process.exitCode = 1;
} catch (error) {
  const message = (error as Error).message;
  if (message.includes('Invalid threshold')) {
    console.log('PASS: threshold > 100 is rejected');
  } else {
    console.error(`FAIL: unexpected error: ${message}`);
    process.exitCode = 1;
  }
}

// 8. Gate result contains actual score and required minimum
const result = evaluateQualityGates(
  summaryWithScores([
    { name: 'Performance', score: 85 },
    { name: 'Accessibility', score: 92 },
  ]),
  { ...defaultConfig, performance: 80, accessibility: 95, bestPractices: 90, seo: 80 }
);

const perfGate = result.gates.find(g => g.category === 'Performance');
if (perfGate && perfGate.actual === 85 && perfGate.minimum === 80 && perfGate.passed === true) {
  console.log('PASS: gate result contains actual score and required minimum');
} else {
  console.error('FAIL: gate result missing expected fields');
  process.exitCode = 1;
}

const a11yGate = result.gates.find(g => g.category === 'Accessibility');
if (a11yGate && a11yGate.actual === 92 && a11yGate.minimum === 95 && a11yGate.passed === false) {
  console.log('PASS: failing gate preserves actual score and minimum');
} else {
  console.error('FAIL: failing gate missing expected fields');
  process.exitCode = 1;
}

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
