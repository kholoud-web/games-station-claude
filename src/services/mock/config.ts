export type MockConfig = { latencyMs: number; failureRate: number };

const DEFAULTS: MockConfig = { latencyMs: 150, failureRate: 0 };

function parse(value: string | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** Malformed or out-of-range values fall back to the defaults. */
export function readMockConfig(env: Record<string, string | undefined>): MockConfig {
  return {
    latencyMs: parse(env.NEXT_PUBLIC_MOCK_LATENCY_MS, DEFAULTS.latencyMs, 0, 10_000),
    failureRate: parse(env.NEXT_PUBLIC_MOCK_FAILURE_RATE, DEFAULTS.failureRate, 0, 1),
  };
}
