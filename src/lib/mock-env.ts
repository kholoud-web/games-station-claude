// No imports on purpose: the browser reads these rules at runtime (services/mock/config.ts) and must
// not download a validation library for it. src/lib/env.ts builds its Zod schemas from the same
// constants for the strict startup check, and tests/lib/env.test.ts pins that both agree.

export type NumberRule = { readonly min: number; readonly max: number; readonly fallback: number };

export const MOCK_LATENCY: NumberRule = { min: 0, max: 10_000, fallback: 150 };
export const MOCK_FAILURE_RATE: NumberRule = { min: 0, max: 1, fallback: 0 };

/**
 * A number inside the rule's range. Unset or blank gives the fallback (a blank `FOO=` must not
 * become 0); anything that is not a finite number in range gives null.
 */
export function parseBoundedNumber(raw: string | undefined, rule: NumberRule): number | null {
  if (raw === undefined || raw.trim() === '') return rule.fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= rule.min && value <= rule.max ? value : null;
}
