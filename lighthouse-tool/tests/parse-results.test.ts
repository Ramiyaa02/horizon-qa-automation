/**
 * Focused unit tests for parseLighthouseResult.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/parse-results.test.ts
 */

import { parseLighthouseResult, type LighthouseSummary } from '../src/parse-results';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    console.error(`FAIL: ${message}\n  expected: ${expected}\n  actual:   ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertApprox(actual: number, expected: number, message: string): void {
  if (Math.abs(actual - expected) > 0.001) {
    console.error(`FAIL: ${message}\n  expected: ${expected}\n  actual:   ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertExists<T>(value: T | null | undefined, message: string): void {
  if (value === null || value === undefined) {
    console.error(`FAIL: ${message}\n  expected non-null value`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- parse-results tests ---');

const mockRaw = {
  lighthouseVersion: '13.4.1',
  requestedUrl: 'https://example.com',
  categories: {
    performance: { title: 'Performance', score: 0.99 },
    accessibility: { title: 'Accessibility', score: 0.90 },
    'best-practices': { title: 'Best Practices', score: 1.0 },
    seo: { title: 'SEO', score: 0.91 },
    'agentic-browsing': { title: 'Agentic Browsing', score: 1.0 },
  },
  audits: {
    'first-contentful-paint': {
      title: 'First Contentful Paint',
      score: 1,
      displayValue: '0.6 s',
      numericValue: 600,
    },
    'largest-contentful-paint': {
      title: 'Largest Contentful Paint',
      score: 0.95,
      displayValue: '0.8 s',
      numericValue: 800,
    },
    'cumulative-layout-shift': {
      title: 'Cumulative Layout Shift',
      score: 1,
      displayValue: '0.001',
      numericValue: 0.001,
    },
    'total-blocking-time': {
      title: 'Total Blocking Time',
      score: 0.85,
      displayValue: '10 ms',
      numericValue: 10,
    },
    'interaction-to-next-paint': {
      title: 'Interaction to Next Paint',
      score: 0.9,
      displayValue: '150 ms',
      numericValue: 150,
    },
    'some-failing-audit': {
      title: 'Some Failing Audit',
      score: 0,
      displayValue: 'Failed',
      numericValue: 100,
    },
    'some-informational-audit': {
      title: 'Some Informational Audit',
      score: null,
      displayValue: undefined,
      numericValue: undefined,
    },
  },
};

const summary = parseLighthouseResult(mockRaw);

// Category scores
assertEqual(summary.lighthouseVersion, '13.4.1', 'lighthouseVersion preserved');
assertEqual(summary.requestedUrl, 'https://example.com', 'requestedUrl preserved');
assertEqual(summary.categoryScores.length, 4, 'includes exactly 4 standard categories');

const perfScore = summary.categoryScores.find(c => c.name === 'Performance');
assertExists(perfScore, 'Performance category exists');
assertApprox(perfScore!.score, 99, 'Performance score converted to percentage');

const a11yScore = summary.categoryScores.find(c => c.name === 'Accessibility');
assertExists(a11yScore, 'Accessibility category exists');
assertApprox(a11yScore!.score, 90, 'Accessibility score converted to percentage');

const bpScore = summary.categoryScores.find(c => c.name === 'Best Practices');
assertExists(bpScore, 'Best Practices category exists');
assertApprox(bpScore!.score, 100, 'Best Practices score converted to percentage');

const seoScore = summary.categoryScores.find(c => c.name === 'SEO');
assertExists(seoScore, 'SEO category exists');
assertApprox(seoScore!.score, 91, 'SEO score converted to percentage');

// Core metrics
assertEqual(summary.coreMetrics.length, 5, 'all 5 core metrics extracted when present');

const fcp = summary.coreMetrics.find(m => m.id === 'first-contentful-paint');
assertExists(fcp, 'FCP metric exists');
assertEqual(fcp!.displayValue, '0.6 s', 'FCP displayValue preserved');

const lcp = summary.coreMetrics.find(m => m.id === 'largest-contentful-paint');
assertExists(lcp, 'LCP metric exists');
assertEqual(lcp!.displayValue, '0.8 s', 'LCP displayValue preserved');

const cls = summary.coreMetrics.find(m => m.id === 'cumulative-layout-shift');
assertExists(cls, 'CLS metric exists');
assertEqual(cls!.displayValue, '0.001', 'CLS displayValue preserved');

const tbt = summary.coreMetrics.find(m => m.id === 'total-blocking-time');
assertExists(tbt, 'TBT metric exists');
assertEqual(tbt!.displayValue, '10 ms', 'TBT displayValue preserved');

const inp = summary.coreMetrics.find(m => m.id === 'interaction-to-next-paint');
assertExists(inp, 'INP metric exists when present');
assertEqual(inp!.displayValue, '150 ms', 'INP displayValue preserved');

// Failed/poor audits preserved
const failingAudit = summary.audits.find(a => a.id === 'some-failing-audit');
assertExists(failingAudit, 'failing audit is preserved');
assertEqual(failingAudit!.score, 0, 'failing audit score preserved');

const informationalAudit = summary.audits.find(a => a.id === 'some-informational-audit');
assertEqual(informationalAudit, undefined, 'informational audit (score=null) is excluded');

// Missing INP handling
const missingInpRaw = {
  lighthouseVersion: '13.4.1',
  requestedUrl: 'https://example.com',
  categories: mockRaw.categories,
  audits: {
    'first-contentful-paint': mockRaw.audits['first-contentful-paint'],
    'largest-contentful-paint': mockRaw.audits['largest-contentful-paint'],
    'cumulative-layout-shift': mockRaw.audits['cumulative-layout-shift'],
    'total-blocking-time': mockRaw.audits['total-blocking-time'],
  },
};

const summaryWithoutInp = parseLighthouseResult(missingInpRaw);
const inpAfterRemoval = summaryWithoutInp.coreMetrics.find(m => m.id === 'interaction-to-next-paint');
assertEqual(inpAfterRemoval, undefined, 'missing INP is handled gracefully');

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
