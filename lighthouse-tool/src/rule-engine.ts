/**
 * Deterministic rule engine that converts Lighthouse findings into
 * actionable recommendations.
 *
 * This module is pure: no browser, no filesystem, no network, no console.
 */

export interface Recommendation {
  auditId: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  currentValue?: string;
  fix: string;
}

const IMAGE_AUDITS = new Set([
  'uses-webp-images',
  'responsive-images',
  'image-size-responsive',
  'efficient-animated-content',
  'offscreen-images',
]);

const UNUSED_JS_AUDITS = new Set([
  'unused-javascript',
]);

const LCP_AUDITS = new Set([
  'largest-contentful-paint',
]);

const FCP_AUDITS = new Set([
  'first-contentful-paint',
]);

const RENDER_BLOCKING_AUDITS = new Set([
  'render-blocking-resources',
]);

function severityForScore(score: number | null | undefined): 'high' | 'medium' | 'low' {
  if (score === null || score === undefined) return 'medium';
  if (score === 0) return 'high';
  if (score < 0.5) return 'high';
  if (score < 0.9) return 'medium';
  return 'low';
}

function isAccessibilityAudit(auditId: string): boolean {
  return auditId.startsWith('aria-') ||
    auditId === 'button-name' ||
    auditId === 'link-in-text-block' ||
    auditId === 'bypass' ||
    auditId === 'landmark-one-main' ||
    auditId === 'image-alt' ||
    auditId === 'label' ||
    auditId === 'frame-title' ||
    auditId === 'html-has-lang' ||
    auditId === 'html-lang-valid' ||
    auditId === 'meta-viewport' ||
    auditId === 'valid-lang';
}

function isSeoAudit(auditId: string): boolean {
  return auditId.startsWith('meta-') ||
    auditId === 'link-text' ||
    auditId === 'robots-txt' ||
    auditId === 'canonical' ||
    auditId === 'structured-data' ||
    auditId === 'hreflang' ||
    auditId === 'lang' ||
    auditId === 'title';
}

export function generateRecommendations(summary: { audits: { id: string; title: string; score: number | null; displayValue: string | undefined; numericValue: number | undefined }[] }): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();

  for (const audit of summary.audits) {
    if (audit.score === null || audit.score === undefined) continue;
    if (audit.score >= 1) continue;

    const key = audit.id;
    if (seen.has(key)) continue;
    seen.add(key);

    const severity = severityForScore(audit.score);

    if (IMAGE_AUDITS.has(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: 'Optimize images',
        severity,
        currentValue: audit.displayValue,
        fix: 'Compress images, use responsive sizing, and prefer modern formats such as WebP or AVIF.',
      });
      continue;
    }

    if (UNUSED_JS_AUDITS.has(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: 'Reduce unused JavaScript',
        severity,
        currentValue: audit.displayValue,
        fix: 'Remove unused code, split bundles, and reduce the amount of JavaScript shipped to the browser.',
      });
      continue;
    }

    if (LCP_AUDITS.has(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: 'Improve Largest Contentful Paint',
        severity: severity === 'low' ? 'medium' : severity,
        currentValue: audit.displayValue,
        fix: 'Optimize the LCP element, reduce render-blocking resources, and improve resource delivery (preload, CDN, caching).',
      });
      continue;
    }

    if (FCP_AUDITS.has(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: 'Improve First Contentful Paint',
        severity,
        currentValue: audit.displayValue,
        fix: 'Reduce render-blocking CSS and JavaScript. Inline critical styles, defer non-critical scripts, and prioritize visible content.',
      });
      continue;
    }

    if (RENDER_BLOCKING_AUDITS.has(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: 'Reduce render-blocking resources',
        severity,
        currentValue: audit.displayValue,
        fix: 'Reduce render-blocking CSS and JavaScript. Inline critical styles, defer non-critical scripts, and prioritize visible content.',
      });
      continue;
    }

    if (isAccessibilityAudit(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: `Fix accessibility issue: ${audit.title}`,
        severity,
        currentValue: audit.displayValue,
        fix: `Address the accessibility finding: ${audit.title}. Ensure proper ARIA usage, accessible names, keyboard focus, and semantic markup.`,
      });
      continue;
    }

    if (isSeoAudit(audit.id)) {
      recommendations.push({
        auditId: audit.id,
        title: `Fix SEO issue: ${audit.title}`,
        severity,
        currentValue: audit.displayValue,
        fix: `Address the SEO finding: ${audit.title}. Improve metadata, structured data, link text, and crawlability.`,
      });
      continue;
    }

    recommendations.push({
      auditId: audit.id,
      title: `Fix: ${audit.title}`,
      severity,
      currentValue: audit.displayValue,
      fix: `Review and address the Lighthouse finding: ${audit.title}.`,
    });
  }

  return recommendations;
}
