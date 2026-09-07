/**
 * Focused unit tests for generateHtmlReport.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/report-html.test.ts
 */

import { generateHtmlReport } from '../src/report/html';

function assertContains(html: string, expected: string, message: string): void {
  if (!html.includes(expected)) {
    console.error(`FAIL: ${message}\n  expected to contain: ${expected}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertNotContains(html: string, unexpected: string, message: string): void {
  if (html.includes(unexpected)) {
    console.error(`FAIL: ${message}\n  expected NOT to contain: ${unexpected}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- report-html tests ---');

const mockSummary = {
  lighthouseVersion: '13.4.1',
  requestedUrl: 'https://example.com',
  categoryScores: [
    { name: 'Performance', score: 100 },
    { name: 'Accessibility', score: 96 },
    { name: 'Best Practices', score: 96 },
    { name: 'SEO', score: 80 },
  ],
  coreMetrics: [
    { id: 'first-contentful-paint', title: 'FCP', score: 1, displayValue: '0.8 s' },
    { id: 'largest-contentful-paint', title: 'LCP', score: 1, displayValue: '0.9 s' },
    { id: 'cumulative-layout-shift', title: 'CLS', score: 1, displayValue: '0' },
    { id: 'total-blocking-time', title: 'TBT', score: 1, displayValue: '10 ms' },
    { id: 'interaction-to-next-paint', title: 'INP', score: 1, displayValue: '150 ms' },
  ],
  audits: [],
};

const mockRecommendations = [
  {
    auditId: 'uses-webp-images',
    title: 'Optimize images',
    severity: 'high' as const,
    currentValue: 'Failed',
    fix: 'Compress images, use responsive sizing, and prefer modern formats such as WebP or AVIF.',
  },
];

const mockQualityGates = {
  overallPassed: true,
  gates: [
    { category: 'Performance', actual: 100, minimum: 80, passed: true },
    { category: 'Accessibility', actual: 96, minimum: 90, passed: true },
    { category: 'Best Practices', actual: 96, minimum: 90, passed: true },
    { category: 'SEO', actual: 80, minimum: 80, passed: true },
  ],
};

const html = generateHtmlReport(mockSummary, mockRecommendations, mockQualityGates);

// 1. HTML document is generated
assertContains(html, '<!DOCTYPE html>', 'HTML document starts with DOCTYPE');
assertContains(html, '</html>', 'HTML document ends with html tag');

// 2. Target URL appears in the report
assertContains(html, 'https://example.com', 'target URL appears in report');

// 3. Lighthouse version appears
assertContains(html, '13.4.1', 'Lighthouse version appears');

// 4. Category scores appear
assertContains(html, 'Performance', 'Performance category appears');
assertContains(html, 'Accessibility', 'Accessibility category appears');
assertContains(html, 'Best Practices', 'Best Practices category appears');
assertContains(html, 'SEO', 'SEO category appears');
assertContains(html, '100', 'Performance score appears');
assertContains(html, '96', 'Accessibility score appears');
assertContains(html, '80', 'SEO score appears');

// 5. Core metrics appear
assertContains(html, 'FCP', 'FCP metric appears');
assertContains(html, 'LCP', 'LCP metric appears');
assertContains(html, 'CLS', 'CLS metric appears');
assertContains(html, 'TBT', 'TBT metric appears');
assertContains(html, 'INP', 'INP metric appears');
assertContains(html, '0.8 s', 'FCP value appears');
assertContains(html, '0.9 s', 'LCP value appears');

// 6. Missing metrics are handled safely
const missingMetricsSummary = {
  ...mockSummary,
  coreMetrics: [
    { id: 'first-contentful-paint', title: 'FCP', score: 1, displayValue: '0.8 s' },
  ],
};
const missingMetricsHtml = generateHtmlReport(missingMetricsSummary, [], mockQualityGates);
assertContains(missingMetricsHtml, 'FCP', 'FCP appears when present');
assertNotContains(missingMetricsHtml, 'LCP', 'LCP omitted when missing');
assertNotContains(missingMetricsHtml, 'CLS', 'CLS omitted when missing');
assertNotContains(missingMetricsHtml, 'TBT', 'TBT omitted when missing');
assertNotContains(missingMetricsHtml, 'INP', 'INP omitted when missing');

// 7. Quality-gate results appear
assertContains(html, 'Quality Gates', 'Quality Gates section appears');
assertContains(html, 'Performance', 'Performance gate appears');
assertContains(html, '100 / 80', 'Performance actual/minimum appears');
assertContains(html, 'PASS', 'PASS status appears');

// 8. Overall PASS/FAIL appears
assertContains(html, 'Overall: PASS', 'Overall PASS appears');

const failingGatesSummary = {
  ...mockSummary,
  categoryScores: [
    { name: 'Performance', score: 70 },
    { name: 'Accessibility', score: 96 },
    { name: 'Best Practices', score: 96 },
    { name: 'SEO', score: 80 },
  ],
};
const failingGates = {
  overallPassed: false,
  gates: [
    { category: 'Performance', actual: 70, minimum: 80, passed: false },
    { category: 'Accessibility', actual: 96, minimum: 90, passed: true },
    { category: 'Best Practices', actual: 96, minimum: 90, passed: true },
    { category: 'SEO', actual: 80, minimum: 80, passed: true },
  ],
};
const failingHtml = generateHtmlReport(failingGatesSummary, [], failingGates);
assertContains(failingHtml, 'Overall: FAIL', 'Overall FAIL appears');
assertContains(failingHtml, 'FAIL', 'FAIL status appears');

// 9. Recommendations appear
assertContains(html, 'Optimize images', 'recommendation title appears');
assertContains(html, 'uses-webp-images', 'audit ID appears');
assertContains(html, 'HIGH', 'severity appears');
assertContains(html, 'Compress images', 'fix text appears');
assertContains(html, 'Current: Failed', 'current value appears');

// 10. Empty recommendations are handled
const emptyRecsHtml = generateHtmlReport(mockSummary, [], mockQualityGates);
assertContains(emptyRecsHtml, 'No actionable recommendations found.', 'empty recommendations message appears');

// 11. Dynamic HTML content is escaped correctly
const xssSummary = {
  ...mockSummary,
  requestedUrl: 'https://example.com?q=<script>alert(1)</script>',
  lighthouseVersion: '13.4.1',
};
const xssRecommendations = [
  {
    auditId: 'test-audit',
    title: 'Test <img src=x onerror=alert(1)>',
    severity: 'high' as const,
    fix: 'Fix <script>alert(1)</script>',
  },
];
const xssHtml = generateHtmlReport(xssSummary, xssRecommendations, mockQualityGates);
assertNotContains(xssHtml, '<script>', 'script tags are escaped');
assertNotContains(xssHtml, '<img', 'img tags are escaped');
assertContains(xssHtml, '&lt;script&gt;', 'script content is escaped');
assertContains(xssHtml, '&lt;img', 'img tag is escaped');

// 12. Report contains expected major sections
assertContains(html, 'Lighthouse Performance Report', 'report header appears');
assertContains(html, 'Category Scores', 'Category Scores section appears');
assertContains(html, 'Core Metrics', 'Core Metrics section appears');
assertContains(html, 'Quality Gates', 'Quality Gates section appears');
assertContains(html, 'Recommendations', 'Recommendations section appears');
assertContains(html, 'Scan Timestamp', 'timestamp appears');

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
