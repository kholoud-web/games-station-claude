import { z } from './zod';

// This file is imported by next.config.ts, which cannot use the `@/` alias: keep its imports relative.

/** A blank value (`FOO=`) means "not set", so the default applies instead of becoming 0. */
const blankIsUnset = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

function numberVariable(min: number, max: number, fallback: number) {
  return z.preprocess(blankIsUnset, z.coerce.number().min(min).max(max).default(fallback));
}

/** One schema per variable, shared by the strict startup check and the tolerant runtime reader. */
export const mockLatencySchema = numberVariable(0, 10_000, 150);
export const mockFailureRateSchema = numberVariable(0, 1, 0);

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
