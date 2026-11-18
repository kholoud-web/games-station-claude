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

/** A card number typed without separators. Any digit run this long is redacted, whatever touches it. */
const CONTIGUOUS_DIGITS = /\d{13,}/g;

/**
 * 13 to 19 digits split by single spaces or dashes. It must start at a digit that is not glued to a
 * letter, so the "5" in "ps5 4111 1111 1111 1111" is not pulled into the number.
 */
const SEPARATED_DIGITS = /(?<![\p{L}\d])\d(?:[ -]?\d){12,18}/gu;

/**
 * Free text can hold anything a person pastes, including a card number. Replaces each card-like
 * run of digits with a placeholder and keeps the rest. It does not check the Luhn digit: a mistyped
 * card number is still sensitive, and the cost of a false match (a long numeric search such as a
 * barcode is recorded as "[redacted]") is one lost query.
 */
export function redactCardLikeNumbers(text: string): string {
  return text.replace(CONTIGUOUS_DIGITS, '[redacted]').replace(SEPARATED_DIGITS, '[redacted]');
}
