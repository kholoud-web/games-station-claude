import { readMockConfig } from './mock/config';
import { createMockServices } from './mock';

export type { Services } from './mock';

/**
 * The single place that chooses mock or real services. Swap the implementations here when a
 * backend exists; components and hooks only ever import `services` from this file.
 * Env vars are read with literal names so Next.js can inline the NEXT_PUBLIC_ values.
 */
export const services = createMockServices(
  readMockConfig({
    NEXT_PUBLIC_MOCK_LATENCY_MS: process.env.NEXT_PUBLIC_MOCK_LATENCY_MS,
    NEXT_PUBLIC_MOCK_FAILURE_RATE: process.env.NEXT_PUBLIC_MOCK_FAILURE_RATE,
  }),
);
