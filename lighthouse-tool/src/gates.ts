/**
 * Pure quality-gate evaluator.
 *
 * This module has no side effects: no filesystem, no network, no console.
 */

export interface QualityGateConfig {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface GateResult {
  category: string;
  actual: number | null;
  minimum: number;
  passed: boolean;
}

export interface QualityGatesResult {
  overallPassed: boolean;
  gates: GateResult[];
}

export function evaluateQualityGates(
  summary: { categoryScores: { name: string; score: number }[] },
  config: QualityGateConfig
): QualityGatesResult {
  const gates: GateResult[] = [];
  let overallPassed = true;

  const categoryMap = new Map<string, number>();
  for (const category of summary.categoryScores) {
    categoryMap.set(category.name.toLowerCase(), category.score);
  }

  const entries: { key: keyof QualityGateConfig; name: string }[] = [
    { key: 'performance', name: 'Performance' },
    { key: 'accessibility', name: 'Accessibility' },
    { key: 'bestPractices', name: 'Best Practices' },
    { key: 'seo', name: 'SEO' },
  ];

  for (const entry of entries) {
    const minimum = config[entry.key];

    if (typeof minimum !== 'number' || !Number.isFinite(minimum)) {
      throw new Error(`Invalid threshold for ${entry.name}: ${minimum}. Must be a number from 0 to 100.`);
    }

    if (minimum < 0 || minimum > 100) {
      throw new Error(`Invalid threshold for ${entry.name}: ${minimum}. Must be a number from 0 to 100.`);
    }

    const actual = categoryMap.get(entry.name.toLowerCase()) ?? null;
    const passed = actual !== null ? actual >= minimum : false;

    if (!passed) {
      overallPassed = false;
    }

    gates.push({
      category: entry.name,
      actual,
      minimum,
      passed,
    });
  }

  return {
    overallPassed,
    gates,
  };
}
