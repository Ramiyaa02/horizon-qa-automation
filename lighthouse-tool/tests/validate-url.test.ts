/**
 * Focused tests for validateUrl.
 *
 * Run with:
 *   cd lighthouse-tool && npx ts-node tests/validate-url.test.ts
 */

import { validateUrl } from '../src/validate-url';

function assertThrows(input: string, expectedMessage: string): void {
  try {
    validateUrl(input);
    console.error(`FAIL: expected error for "${input}" but none was thrown.`);
    process.exitCode = 1;
  } catch (error) {
    const message = (error as Error).message;
    if (message !== expectedMessage) {
      console.error(`FAIL: "${input}" => expected "${expectedMessage}", got "${message}"`);
      process.exitCode = 1;
    } else {
      console.log(`PASS: "${input}" => ${message}`);
    }
  }
}

function assertPass(input: string, expected: string): void {
  try {
    const result = validateUrl(input);
    if (result !== expected) {
      console.error(`FAIL: "${input}" => expected "${expected}", got "${result}"`);
      process.exitCode = 1;
    } else {
      console.log(`PASS: "${input}" => ${result}`);
    }
  } catch (error) {
    console.error(`FAIL: "${input}" threw unexpectedly: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

console.log('--- URL validator tests ---');

assertPass('https://example.com', 'https://example.com/');
assertPass('http://example.com', 'http://example.com/');
assertPass('  https://example.com  ', 'https://example.com/');

assertThrows('', 'URL is required.');
assertThrows('   ', 'URL is required.');
assertThrows('not-a-url', 'Invalid URL: not-a-url');
assertThrows('ftp://example.com', 'Unsupported protocol: ftp:. Only http:// and https:// are allowed.');

if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests passed.');
}
