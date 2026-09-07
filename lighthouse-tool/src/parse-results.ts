/**
 * Pure parser that converts a raw Lighthouse result into a concise summary.
 *
 * This module has no side effects: no browser, no filesystem, no console.
 */

export interface CategoryScore {
  name: string;
  score: number;
}

export interface CoreMetric {
  id: string;
  title: string;
  score: number | null;
  displayValue: string;
  numericValue: number;
}

export interface AuditSummary {
  id: string;
  title: string;
  score: number | null;
  displayValue: string | undefined;
  numericValue: number | undefined;
}

export interface LighthouseSummary {
  lighthouseVersion: string;
  requestedUrl: string;
  categoryScores: CategoryScore[];
  coreMetrics: CoreMetric[];
  audits: AuditSummary[];
}

const CORE_METRIC_AUDITS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'interaction-to-next-paint',
];

const CORE_METRIC_TITLES: Record<string, string> = {
  'first-contentful-paint': 'FCP',
  'largest-contentful-paint': 'LCP',
  'cumulative-layout-shift': 'CLS',
  'total-blocking-time': 'TBT',
  'interaction-to-next-paint': 'INP',
};

const INCLUDE_CATEGORIES = new Set([
  'performance',
  'accessibility',
  'best-practices',
  'seo',
]);

function toPercentage(score: number | null | undefined): number {
  if (score === null || score === undefined) return 0;
  return Math.round(score * 100);
}

function extractCoreMetric(audits: Record<string, any>, auditId: string): CoreMetric | null {
  const audit = audits[auditId];
  if (!audit) return null;

  return {
    id: auditId,
    title: CORE_METRIC_TITLES[auditId] ?? audit.title,
    score: audit.score ?? null,
    displayValue: audit.displayValue ?? 'N/A',
    numericValue: audit.numericValue ?? 0,
  };
}

function shouldIncludeAudit(audit: any): boolean {
  const score = audit.score;
  if (score === null || score === undefined) return false;
  return score < 1;
}

export function parseLighthouseResult(raw: any): LighthouseSummary {
  const audits = raw.audits ?? {};
  const categories = raw.categories ?? {};

  const categoryScores: CategoryScore[] = [];
  for (const [key, category] of Object.entries(categories)) {
    if (!INCLUDE_CATEGORIES.has(key)) continue;
    const score = (category as any).score;
    categoryScores.push({
      name: (category as any).title ?? key,
      score: toPercentage(score),
    });
  }

  const coreMetrics: CoreMetric[] = [];
  for (const auditId of CORE_METRIC_AUDITS) {
    const metric = extractCoreMetric(audits, auditId);
    if (metric) {
      coreMetrics.push(metric);
    }
  }

  const auditSummaries: AuditSummary[] = [];
  for (const [auditId, audit] of Object.entries(audits)) {
    if (!shouldIncludeAudit(audit as any)) continue;
    auditSummaries.push({
      id: auditId,
      title: (audit as any).title ?? auditId,
      score: (audit as any).score ?? null,
      displayValue: (audit as any).displayValue,
      numericValue: (audit as any).numericValue,
    });
  }

  return {
    lighthouseVersion: raw.lighthouseVersion ?? 'unknown',
    requestedUrl: raw.requestedUrl ?? '',
    categoryScores,
    coreMetrics,
    audits: auditSummaries,
  };
}
