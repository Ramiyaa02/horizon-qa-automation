/**
 * Focused unit tests for generateJsonReport.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/report-json.test.ts
 */

import { generateJsonReport } from '../src/report/json';

function assertContains(json: string, expected: string, message: string): void {
  if (!json.includes(expected)) {
    console.error(`FAIL: ${message}\n  expected to contain: ${expected}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertNotContains(json: string, unexpected: string, message: string): void {
  if (json.includes(unexpected)) {
    console.error(`FAIL: ${message}\n  expected NOT to contain: ${unexpected}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertValidJson(json: string, message: string): void {
  try {
    JSON.parse(json);
    console.log(`PASS: ${message}`);
  } catch (error) {
    console.error(`FAIL: ${message}\n  invalid JSON: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

console.log('--- report-json tests ---');

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

const json = generateJsonReport(mockSummary, mockRecommendations, mockQualityGates);

// 1. JSON report is generated
assertContains(json, '"generatedAt"', 'generatedAt field is present');
assertContains(json, '"targetUrl"', 'targetUrl field is present');
assertContains(json, '"lighthouseVersion"', 'lighthouseVersion field is present');
assertContains(json, '"summary"', 'summary field is present');
assertContains(json, '"qualityGates"', 'qualityGates field is present');
assertContains(json, '"recommendations"', 'recommendations field is present');

// 2. Returned string is valid JSON
assertValidJson(json, 'returned string is valid JSON');

// 3. Target URL is included
assertContains(json, 'https://example.com', 'target URL is included');

// 4. Lighthouse version is included
assertContains(json, '13.4.1', 'Lighthouse version is included');

// 5. Category scores are included
assertContains(json, '"Performance"', 'Performance category is included');
assertContains(json, '"Accessibility"', 'Accessibility category is included');
assertContains(json, '"Best Practices"', 'Best Practices category is included');
assertContains(json, '"SEO"', 'SEO category is included');
assertContains(json, '"score": 100', 'Performance score is included');
assertContains(json, '"score": 96', 'Accessibility score is included');

// 6. Core metrics are included
assertContains(json, '"FCP"', 'FCP metric is included');
assertContains(json, '"LCP"', 'LCP metric is included');
assertContains(json, '"CLS"', 'CLS metric is included');
assertContains(json, '"TBT"', 'TBT metric is included');
assertContains(json, '"INP"', 'INP metric is included');
assertContains(json, '"displayValue": "0.8 s"', 'FCP displayValue is included');
assertContains(json, '"displayValue": "0.9 s"', 'LCP displayValue is included');

// 7. Missing optional metrics are handled correctly
const missingMetricsSummary = {
  ...mockSummary,
  coreMetrics: [
    { id: 'first-contentful-paint', title: 'FCP', score: 1, displayValue: '0.8 s' },
  ],
};
const missingMetricsJson = generateJsonReport(missingMetricsSummary, [], mockQualityGates);
assertContains(missingMetricsJson, '"FCP"', 'FCP appears when present');
assertNotContains(missingMetricsJson, '"LCP"', 'LCP omitted when missing');
assertNotContains(missingMetricsJson, '"CLS"', 'CLS omitted when missing');
assertNotContains(missingMetricsJson, '"TBT"', 'TBT omitted when missing');
assertNotContains(missingMetricsJson, '"INP"', 'INP omitted when missing');

// 8. Quality-gate results are included
assertContains(json, '"overallPassed": true', 'overallPassed is included');
assertContains(json, '"category": "Performance"', 'Performance gate category is included');
assertContains(json, '"actual": 100', 'gate actual value is included');
assertContains(json, '"minimum": 80', 'gate minimum is included');
assertContains(json, '"passed": true', 'gate passed status is included');

// 9. Recommendations are included
assertContains(json, '"auditId": "uses-webp-images"', 'auditId is included');
assertContains(json, '"title": "Optimize images"', 'recommendation title is included');
assertContains(json, '"severity": "high"', 'severity is included');
assertContains(json, '"currentValue": "Failed"', 'currentValue is included');
assertContains(json, '"fix": "Compress images', 'fix text is included');

// 10. Empty recommendations are handled
const emptyRecsJson = generateJsonReport(mockSummary, [], mockQualityGates);
assertContains(emptyRecsJson, '"recommendations": []', 'empty recommendations array is included');

// 11. generatedAt is present and valid
const json1 = generateJsonReport(mockSummary, [], mockQualityGates);
const match1 = json1.match(/"generatedAt": "([^"]+)"/);
if (match1) {
  const ts1 = match1[1];
  const date = new Date(ts1);
  if (!isNaN(date.getTime())) {
    console.log('PASS: generatedAt is present and is a valid ISO timestamp');
  } else {
    console.error('FAIL: generatedAt is not a valid ISO timestamp');
    process.exitCode = 1;
  }
} else {
  console.error('FAIL: generatedAt field not found');
  process.exitCode = 1;
}

// Verify JSON.stringify produces valid JSON with dynamic strings preserved
const xssSummary = {
  ...mockSummary,
  requestedUrl: 'https://example.com?q=<script>alert(1)</script>',
  lighthouseVersion: '13.4.1',
};
const xssRecs = [
  {
    auditId: 'test-audit',
    title: 'Test <img src=x onerror=alert(1)>',
    severity: 'high' as const,
    fix: 'Fix <script>alert(1)</script>',
  },
];
const xssJson = generateJsonReport(xssSummary, xssRecs, mockQualityGates);

// JSON.stringify preserves special chars inside string values (it JSON-escapes quotes/backslashes,
// but does NOT HTML-escape angle brackets). That is correct for a JSON data file.
// Verify the JSON is still valid and round-trips cleanly.
assertValidJson(xssJson, 'JSON with special characters is still valid JSON');

// Verify round-trip: parse JSON and check values are preserved exactly
const parsedXss = JSON.parse(xssJson);
if (parsedXss.targetUrl === 'https://example.com?q=<script>alert(1)</script>' &&
    parsedXss.recommendations[0].title === 'Test <img src=x onerror=alert(1)>' &&
    parsedXss.recommendations[0].fix === 'Fix <script>alert(1)</script>') {
  console.log('PASS: dynamic strings survive JSON round-trip without corruption');
} else {
  console.error('FAIL: dynamic strings were corrupted during JSON serialization');
  process.exitCode = 1;
}

// 12. JSON structure contains the expected major sections
const parsed = JSON.parse(json);
if (parsed.generatedAt && parsed.targetUrl && parsed.lighthouseVersion && parsed.summary && parsed.qualityGates && parsed.recommendations) {
  console.log('PASS: JSON structure contains all expected major sections');
} else {
  console.error('FAIL: JSON structure missing expected sections');
  process.exitCode = 1;
}

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
