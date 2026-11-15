import type { MockConfig } from './config';

/** Runs a mock call with simulated latency and, when configured, a simulated network failure. */
export async function simulate<T>(config: MockConfig, run: () => T): Promise<T> {
  if (config.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, config.latencyMs));
  }
  if (Math.random() < config.failureRate) {
    throw new Error('Simulated network failure (mock service)');
  }
  // Clone so callers can never mutate the seed data.
  return structuredClone(run());
}
