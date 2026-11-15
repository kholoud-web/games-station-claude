/** Field names that must never reach an analytics provider, compared without case, `_` or `-`. */
const SENSITIVE_KEYS = new Set([
  'cardnumber',
  'card',
  'pan',
  'cvv',
  'cvv2',
  'cvc',
  'expiry',
  'expirydate',
  'password',
  'passcode',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'secret',
  'apikey',
  'authorization',
  'giftcardcode',
  'code',
]);

const MAX_DEPTH = 8;

/**
 * Second line of defence behind the event types: finds a secret-looking field name anywhere
 * in a value, so a cast or an `any` cannot smuggle card data or credentials into analytics.
 * Returns the offending key, or null when the value is clean.
 */
export function findSensitiveKey(value: unknown, depth = 0): string | null {
  if (typeof value !== 'object' || value === null) return null;
  if (depth > MAX_DEPTH) return '[too deeply nested]';
  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[_-]/g, ''))) return key;
    const nested = findSensitiveKey(child, depth + 1);
    if (nested !== null) return nested;
  }
  return null;
}
