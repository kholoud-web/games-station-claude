import { MOCK_FAILURE_RATE, MOCK_LATENCY, parseBoundedNumber } from '@/lib/mock-env';

export type MockConfig = { latencyMs: number; failureRate: number };

/**
 * Tolerant runtime reader. next.config.ts already rejects malformed values at startup with the
 * strict schemas in lib/env.ts (`parseEnv`), so a bad value only reaches here from a test or a
 * hand-built environment; each variable then falls back to its own default instead of crashing a
 * page. This file must stay free of Zod: it runs in the browser (see tests/lib/client-bundle.test.ts).
 */
export function readMockConfig(env: Record<string, string | undefined>): MockConfig {
  return {
    latencyMs: parseBoundedNumber(env.NEXT_PUBLIC_MOCK_LATENCY_MS, MOCK_LATENCY) ?? MOCK_LATENCY.fallback,
    failureRate:
      parseBoundedNumber(env.NEXT_PUBLIC_MOCK_FAILURE_RATE, MOCK_FAILURE_RATE) ?? MOCK_FAILURE_RATE.fallback,
  };
}
