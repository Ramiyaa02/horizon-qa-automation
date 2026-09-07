/**
 * Validates and normalizes URLs for the Lighthouse audit CLI.
 *
 * Rules:
 * - input must be a non-empty string after trimming
 * - only http:// and https:// protocols are allowed
 * - the URL must be syntactically valid
 *
 * Returns the normalized URL string on success.
 * Throws a user-friendly Error on invalid input.
 */

export function validateUrl(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('URL is required.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid URL: ${trimmed}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol}. Only http:// and https:// are allowed.`);
  }

  return parsed.toString();
}
