/**
 * Pure JSON report generator.
 *
 * This module has no side effects: no filesystem, no network, no console.
 */

export { type LighthouseSummary } from '../parse-results';
export { type Recommendation } from '../rule-engine';
export { type QualityGatesResult } from '../gates';

function formatTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function generateJsonReport(
  summary: { lighthouseVersion: string; requestedUrl: string; categoryScores: { name: string; score: number }[]; coreMetrics: { id: string; title: string; score: number | null; displayValue: string }[] },
  recommendations: { auditId: string; title: string; severity: 'high' | 'medium' | 'low'; currentValue?: string; fix: string }[],
  qualityGates: { overallPassed: boolean; gates: { category: string; actual: number | null; minimum: number; passed: boolean }[] }
): string {
  const report = {
    generatedAt: formatTimestamp(),
    targetUrl: summary.requestedUrl,
    lighthouseVersion: summary.lighthouseVersion,
    summary: {
      categoryScores: summary.categoryScores,
      coreMetrics: summary.coreMetrics,
    },
    qualityGates: qualityGates,
    recommendations: recommendations,
  };

  return JSON.stringify(report, null, 2);
}
