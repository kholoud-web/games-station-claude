import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/lib/env';
import { readMockConfig } from '@/services/mock/config';

describe('parseEnv', () => {
  it('applies the defaults when nothing is set', () => {
    expect(parseEnv({})).toEqual({
      NEXT_PUBLIC_MOCK_LATENCY_MS: 150,
      NEXT_PUBLIC_MOCK_FAILURE_RATE: 0,
    });
  });

  it('reads numbers from the strings the environment provides', () => {
    expect(
      parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: '400', NEXT_PUBLIC_MOCK_FAILURE_RATE: '0.25' }),
    ).toEqual({ NEXT_PUBLIC_MOCK_LATENCY_MS: 400, NEXT_PUBLIC_MOCK_FAILURE_RATE: 0.25 });
  });

  it('accepts the edges of both ranges', () => {
    expect(parseEnv({ NEXT_PUBLIC_MOCK_FAILURE_RATE: '0' }).NEXT_PUBLIC_MOCK_FAILURE_RATE).toBe(0);
    expect(parseEnv({ NEXT_PUBLIC_MOCK_FAILURE_RATE: '1' }).NEXT_PUBLIC_MOCK_FAILURE_RATE).toBe(1);
    expect(parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: '0' }).NEXT_PUBLIC_MOCK_LATENCY_MS).toBe(0);
    expect(parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: '10000' }).NEXT_PUBLIC_MOCK_LATENCY_MS).toBe(10_000);
  });

  it('treats an empty or blank value like an unset one', () => {
    expect(parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: '', NEXT_PUBLIC_MOCK_FAILURE_RATE: '  ' })).toEqual({
      NEXT_PUBLIC_MOCK_LATENCY_MS: 150,
      NEXT_PUBLIC_MOCK_FAILURE_RATE: 0,
    });
  });

  it.each(['2', '1.01', '-0.1', 'abc', 'NaN', 'Infinity'])(
    'throws on a failure rate of %s and names the variable',
    (value) => {
      expect(() => parseEnv({ NEXT_PUBLIC_MOCK_FAILURE_RATE: value })).toThrow(
        /NEXT_PUBLIC_MOCK_FAILURE_RATE/,
      );
    },
  );

  it.each(['-1', '10001', 'fast', '1e9', 'Infinity'])('throws on a latency of %s and names the variable', (value) => {
    expect(() => parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: value })).toThrow(/NEXT_PUBLIC_MOCK_LATENCY_MS/);
  });

  it('reports every bad variable in one error', () => {
    expect(() =>
      parseEnv({ NEXT_PUBLIC_MOCK_LATENCY_MS: 'fast', NEXT_PUBLIC_MOCK_FAILURE_RATE: '2' }),
    ).toThrow(/NEXT_PUBLIC_MOCK_LATENCY_MS[\s\S]*NEXT_PUBLIC_MOCK_FAILURE_RATE/);
  });

  it('ignores variables it does not know about', () => {
    expect(parseEnv({ SOMETHING_ELSE: 'x' })).toEqual({
      NEXT_PUBLIC_MOCK_LATENCY_MS: 150,
      NEXT_PUBLIC_MOCK_FAILURE_RATE: 0,
    });
  });
});

describe('parseEnv and readMockConfig share one set of rules', () => {
  it.each([
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: '0', NEXT_PUBLIC_MOCK_FAILURE_RATE: '1' }],
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: '10000', NEXT_PUBLIC_MOCK_FAILURE_RATE: '0' }],
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: '250', NEXT_PUBLIC_MOCK_FAILURE_RATE: '0.5' }],
    [{}],
  ])('agree on the valid input %j', (raw) => {
    const strict = parseEnv(raw);
    expect(readMockConfig(raw)).toEqual({
      latencyMs: strict.NEXT_PUBLIC_MOCK_LATENCY_MS,
      failureRate: strict.NEXT_PUBLIC_MOCK_FAILURE_RATE,
    });
  });

  it('differ only in how they treat a bad value: startup throws, runtime falls back', () => {
    const bad = { NEXT_PUBLIC_MOCK_FAILURE_RATE: '2' };
    expect(() => parseEnv(bad)).toThrow();
    expect(readMockConfig(bad).failureRate).toBe(0);
  });
});

describe('.env.example', () => {
  const lines = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
  const entries = lines.map((line) => {
    const at = line.indexOf('=');
    return [line.slice(0, at), line.slice(at + 1)] as const;
  });

  it('has only public variables, so nothing in it can be a secret', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [key] of entries) {
      expect(key).toMatch(/^NEXT_PUBLIC_[A-Z0-9_]+$/);
      expect(key).not.toMatch(/SECRET|TOKEN|KEY|PASSWORD|CREDENTIAL|PRIVATE/);
    }
  });

  it('holds values the app accepts as they are', () => {
    expect(() => parseEnv(Object.fromEntries(entries))).not.toThrow();
  });
});
