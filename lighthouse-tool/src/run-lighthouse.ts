/**
 * Runs Lighthouse programmatically against a validated URL.
 *
 * This module isolates browser/audit concerns from CLI/validation concerns
 * so it can be reused and unit-tested independently.
 */

import { launch, type LaunchedChrome } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import type { RunnerResult, Result as LHResult } from 'lighthouse';

export async function runLighthouse(url: string): Promise<LHResult> {
  let chrome: LaunchedChrome | undefined;

  try {
    chrome = await launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });
  } catch (error) {
    throw new Error(`Failed to launch Chrome: ${(error as Error).message}`);
  }

  try {
    const runnerResult = (await lighthouse(url, {
      port: chrome.port,
      logLevel: 'error',
      output: ['json'],
    })) as RunnerResult;

    return runnerResult.lhr;
  } finally {
    if (chrome) {
      try {
        await chrome.kill();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
