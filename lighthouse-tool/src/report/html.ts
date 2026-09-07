/**
 * Pure HTML report generator.
 *
 * This module has no side effects: no filesystem, no network, no console.
 */

export { type LighthouseSummary } from '../parse-results';
export { type Recommendation } from '../rule-engine';
export { type QualityGatesResult } from '../gates';

function escapeHtml(value: string | undefined | null): string {
  if (value === undefined || value === null) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreColor(score: number | null): string {
  if (score === null) return '#888888';
  if (score >= 0.9) return '#0cce6b';
  if (score >= 0.5) return '#ffa400';
  return '#ff4e42';
}

function severityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return '#ff4e42';
    case 'medium':
      return '#ffa400';
    case 'low':
      return '#0cce6b';
  }
}

function formatTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function generateHtmlReport(
  summary: { lighthouseVersion: string; requestedUrl: string; categoryScores: { name: string; score: number }[]; coreMetrics: { id: string; title: string; score: number | null; displayValue: string }[] },
  recommendations: { auditId: string; title: string; severity: 'high' | 'medium' | 'low'; currentValue?: string; fix: string }[],
  qualityGates: { overallPassed: boolean; gates: { category: string; actual: number | null; minimum: number; passed: boolean }[] }
): string {
  const timestamp = formatTimestamp();
  const escapedUrl = escapeHtml(summary.requestedUrl);

  const categoryScoresHtml = summary.categoryScores
    .map(
      (category) => `
      <div class="score-card">
        <div class="score-name">${escapeHtml(category.name)}</div>
        <div class="score-value" style="color: ${scoreColor(category.score)}">${category.score}</div>
      </div>
    `
    )
    .join('');

  const coreMetricsHtml = summary.coreMetrics
    .map(
      (metric) => `
      <div class="metric-row">
        <div class="metric-name">${escapeHtml(metric.title)}</div>
        <div class="metric-value">${escapeHtml(metric.displayValue)}</div>
      </div>
    `
    )
    .join('');

  const qualityGatesHtml = qualityGates.gates
    .map(
      (gate) => `
      <div class="gate-row ${gate.passed ? 'pass' : 'fail'}">
        <div class="gate-category">${escapeHtml(gate.category)}</div>
        <div class="gate-values">${gate.actual !== null ? gate.actual : 'N/A'} / ${gate.minimum}</div>
        <div class="gate-status">${gate.passed ? 'PASS' : 'FAIL'}</div>
      </div>
    `
    )
    .join('');

  const recommendationsHtml = recommendations.length === 0
    ? '<p class="empty-state">No actionable recommendations found.</p>'
    : recommendations
        .map(
          (rec) => `
        <div class="recommendation-card">
          <div class="recommendation-header">
            <span class="recommendation-id">${escapeHtml(rec.auditId)}</span>
            <span class="recommendation-severity" style="background-color: ${severityColor(rec.severity)}">${rec.severity.toUpperCase()}</span>
          </div>
          <div class="recommendation-title">${escapeHtml(rec.title)}</div>
          ${rec.currentValue !== undefined ? `<div class="recommendation-value">Current: ${escapeHtml(rec.currentValue)}</div>` : ''}
          <div class="recommendation-fix">${escapeHtml(rec.fix)}</div>
        </div>
      `
        )
        .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Performance Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }
    header {
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #1a1a1a;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .meta div {
      margin-bottom: 4px;
    }
    section {
      background-color: #fff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #1a1a1a;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .score-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .score-name {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .score-value {
      font-size: 32px;
      font-weight: bold;
    }
    .metrics-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .metric-name {
      font-weight: 500;
    }
    .metric-value {
      color: #666;
    }
    .gate-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .gate-row:last-child {
      border-bottom: none;
    }
    .gate-row.pass .gate-status {
      color: #0cce6b;
      font-weight: bold;
    }
    .gate-row.fail .gate-status {
      color: #ff4e42;
      font-weight: bold;
    }
    .gate-category {
      font-weight: 500;
      flex: 1;
    }
    .gate-values {
      color: #666;
      margin-right: 16px;
    }
    .gate-status {
      min-width: 60px;
      text-align: right;
    }
    .overall-status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      font-size: 16px;
    }
    .overall-status.pass {
      background-color: #e6f7ed;
      color: #0cce6b;
    }
    .overall-status.fail {
      background-color: #fde8e8;
      color: #ff4e42;
    }
    .recommendation-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .recommendation-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background-color: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .recommendation-severity {
      color: #fff;
      font-size: 12px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .recommendation-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .recommendation-value {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .recommendation-fix {
      color: #333;
      font-size: 14px;
    }
    .empty-state {
      color: #666;
      font-style: italic;
    }
    @media (max-width: 600px) {
      .container {
        padding: 16px;
      }
      .scores-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Lighthouse Performance Report</h1>
      <div class="meta">
        <div><strong>Target URL:</strong> ${escapeHtml(summary.requestedUrl)}</div>
        <div><strong>Lighthouse Version:</strong> ${escapeHtml(summary.lighthouseVersion)}</div>
        <div><strong>Scan Timestamp:</strong> ${escapeHtml(timestamp)}</div>
      </div>
    </header>

    <section>
      <h2>Category Scores</h2>
      <div class="scores-grid">
        ${categoryScoresHtml}
      </div>
    </section>

    <section>
      <h2>Core Metrics</h2>
      <div class="metrics-list">
        ${coreMetricsHtml}
      </div>
    </section>

    <section>
      <h2>Quality Gates</h2>
      ${qualityGatesHtml}
      <div class="overall-status ${qualityGates.overallPassed ? 'pass' : 'fail'}">
        Overall: ${qualityGates.overallPassed ? 'PASS' : 'FAIL'}
      </div>
    </section>

    <section>
      <h2>Recommendations</h2>
      ${recommendationsHtml}
    </section>
  </div>
</body>
</html>`;
}
