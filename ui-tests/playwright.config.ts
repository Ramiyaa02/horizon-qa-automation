import { defineConfig } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Playwright configuration for the login automation suite.
 *
 * Design decisions:
 * - Single Chromium project: the assignment targets one app; extra browser
 *   matrix adds runtime without added signal.
 * - trace + screenshot only on failure: useful artifacts, no noise on green runs.
 * - No fixed waits in tests; web-first assertions handle timing.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../playwright-report' }],
  ],
  use: {
    baseURL: process.env.UI_BASE_URL ?? 'https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  outputDir: '../test-results',
});
