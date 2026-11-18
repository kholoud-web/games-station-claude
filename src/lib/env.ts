import { MOCK_FAILURE_RATE, MOCK_LATENCY, type NumberRule } from './mock-env';
import { z } from './zod';

// This file is imported by next.config.ts, which cannot use the `@/` alias: keep its imports relative.

/** A blank value (`FOO=`) means "not set", so the default applies instead of becoming 0. */
const blankIsUnset = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

function numberVariable({ min, max, fallback }: NumberRule) {
  return z.preprocess(blankIsUnset, z.coerce.number().min(min).max(max).default(fallback));
}

/** Strict startup check. The ranges come from mock-env.ts, which the browser-side reader also uses. */
export const mockLatencySchema = numberVariable(MOCK_LATENCY);
export const mockFailureRateSchema = numberVariable(MOCK_FAILURE_RATE);

const envSchema = z.object({
  NEXT_PUBLIC_MOCK_LATENCY_MS: mockLatencySchema,
  NEXT_PUBLIC_MOCK_FAILURE_RATE: mockFailureRateSchema,
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates the environment once at startup (next.config.ts), so a typo such as a failure rate of
 * "2" stops the build or dev server with a clear message instead of changing behaviour silently.
 * Only public variables exist today; never add a secret here, because NEXT_PUBLIC_ values are
 * copied into the browser bundle.
 */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${problems.join('\n')}`);
}
