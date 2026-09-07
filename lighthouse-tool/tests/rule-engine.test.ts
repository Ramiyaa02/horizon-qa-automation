/**
 * Focused unit tests for generateRecommendations.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/rule-engine.test.ts
 */

import { generateRecommendations, type Recommendation } from '../src/rule-engine';

function assertEqual(actual: string[], expected: string[], message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`FAIL: ${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- rule-engine tests ---');

// 1. Perfect/healthy audit → no recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'first-contentful-paint', title: 'First Contentful Paint', score: 1, displayValue: '0.6 s', numericValue: 600 },
      { id: 'largest-contentful-paint', title: 'Largest Contentful Paint', score: 1, displayValue: '0.8 s', numericValue: 800 },
    ],
  }).map(r => r.title),
  [],
  'perfect audits produce no recommendations'
);

// 2. Failed image optimization audit → image recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'uses-webp-images', title: 'Serve images in next-gen formats', score: 0, displayValue: 'Failed', numericValue: 0 },
    ],
  }).map(r => r.title),
  ['Optimize images'],
  'failed image audit produces image recommendation'
);

// 3. Failed unused JavaScript audit → JavaScript recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'unused-javascript', title: 'Reduce unused JavaScript', score: 0.5, displayValue: '200 KiB', numericValue: 200 },
    ],
  }).map(r => r.title),
  ['Reduce unused JavaScript'],
  'failed unused JS audit produces JS recommendation'
);

// 4. Failed accessibility audit → accessibility recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'button-name', title: 'Buttons have an accessible name', score: 0, displayValue: 'Failed', numericValue: 0 },
    ],
  }).map(r => r.title),
  ['Fix accessibility issue: Buttons have an accessible name'],
  'failed accessibility audit produces a11y recommendation'
);

// 5. Failed SEO audit → SEO recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'meta-description', title: 'Document does not have a meta description', score: 0, displayValue: 'Failed', numericValue: 0 },
    ],
  }).map(r => r.title),
  ['Fix SEO issue: Document does not have a meta description'],
  'failed SEO audit produces SEO recommendation'
);

// 6. Poor LCP-related audit → LCP recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'largest-contentful-paint', title: 'Largest Contentful Paint', score: 0.4, displayValue: '3.5 s', numericValue: 3500 },
    ],
  }).map(r => r.title),
  ['Improve Largest Contentful Paint'],
  'poor LCP audit produces LCP recommendation'
);

// 7. score: null audit → no recommendation
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'user-timings', title: 'User Timing marks and measures', score: null, displayValue: undefined, numericValue: undefined },
    ],
  }).map(r => r.title),
  [],
  'null-score audit produces no recommendation'
);

// 8. Multiple findings → multiple recommendations
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'largest-contentful-paint', title: 'Largest Contentful Paint', score: 0.4, displayValue: '3.5 s', numericValue: 3500 },
      { id: 'uses-webp-images', title: 'Serve images in next-gen formats', score: 0, displayValue: 'Failed', numericValue: 0 },
      { id: 'button-name', title: 'Buttons have an accessible name', score: 0, displayValue: 'Failed', numericValue: 0 },
    ],
  }).map(r => r.title),
  [
    'Improve Largest Contentful Paint',
    'Optimize images',
    'Fix accessibility issue: Buttons have an accessible name',
  ],
  'multiple findings produce multiple recommendations'
);

// 9. Duplicate/related findings do not create unnecessary duplicate recommendations
assertEqual(
  generateRecommendations({
    audits: [
      { id: 'render-blocking-resources', title: 'Reduce unused JavaScript', score: 0, displayValue: 'Failed', numericValue: 0 },
      { id: 'render-blocking-resources', title: 'Reduce unused JavaScript', score: 0, displayValue: 'Failed', numericValue: 0 },
    ],
  }).map(r => r.title),
  [
    'Reduce render-blocking resources',
  ],
  'duplicate audits produce only one recommendation'
);

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
