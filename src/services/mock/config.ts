import { mockFailureRateSchema, mockLatencySchema } from '@/lib/env';

export type MockConfig = { latencyMs: number; failureRate: number };

/**
 * Tolerant runtime reader. next.config.ts already rejects malformed values at startup with the same
 * schemas (`parseEnv`), so a bad value only reaches here from a test or a hand-built environment;
 * each variable then falls back to its own default instead of crashing a page.
 */
export function readMockConfig(env: Record<string, string | undefined>): MockConfig {
  const latency = mockLatencySchema.safeParse(env.NEXT_PUBLIC_MOCK_LATENCY_MS);
  const failureRate = mockFailureRateSchema.safeParse(env.NEXT_PUBLIC_MOCK_FAILURE_RATE);
  return {
    latencyMs: latency.success ? latency.data : mockLatencySchema.parse(undefined),
    failureRate: failureRate.success ? failureRate.data : mockFailureRateSchema.parse(undefined),
  };
}
