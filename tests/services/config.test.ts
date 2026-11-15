import { describe, expect, it } from 'vitest';
import { readMockConfig } from '@/services/mock/config';

describe('readMockConfig', () => {
  it('defaults to 150 ms latency and no failures', () => {
    expect(readMockConfig({})).toEqual({ latencyMs: 150, failureRate: 0 });
  });

  it('reads valid values', () => {
    expect(readMockConfig({ NEXT_PUBLIC_MOCK_LATENCY_MS: '400', NEXT_PUBLIC_MOCK_FAILURE_RATE: '0.25' })).toEqual({
      latencyMs: 400,
      failureRate: 0.25,
    });
  });

  it('falls back to the defaults for malformed or out-of-range values', () => {
    expect(readMockConfig({ NEXT_PUBLIC_MOCK_LATENCY_MS: 'fast', NEXT_PUBLIC_MOCK_FAILURE_RATE: '2' })).toEqual({
      latencyMs: 150,
      failureRate: 0,
    });
    expect(readMockConfig({ NEXT_PUBLIC_MOCK_LATENCY_MS: '-5', NEXT_PUBLIC_MOCK_FAILURE_RATE: '-0.1' })).toEqual({
      latencyMs: 150,
      failureRate: 0,
    });
  });
});
