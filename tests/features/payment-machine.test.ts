import { describe, expect, it } from 'vitest';
import { newIdempotencyKey } from '@/features/checkout/idempotency';
import { allowedTransitions, canTransition, isTerminal, transition } from '@/features/checkout/payment-machine';
import type { PaymentState } from '@/services/types';

const STATES = Object.keys(allowedTransitions) as PaymentState[];

describe('payment state machine', () => {
  it('knows exactly the eight payment states', () => {
    expect([...STATES].sort()).toEqual(
      ['CANCELLED', 'EXPIRED', 'FAILED', 'PENDING', 'PROCESSING', 'REFUNDED', 'REFUND_PENDING', 'SUCCEEDED'].sort(),
    );
  });

  it('pins the documented transition table', () => {
    expect(allowedTransitions).toEqual({
      PENDING: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
      PROCESSING: ['SUCCEEDED', 'FAILED', 'CANCELLED'],
      SUCCEEDED: ['REFUND_PENDING'],
      REFUND_PENDING: ['REFUNDED', 'SUCCEEDED'],
      FAILED: [],
      CANCELLED: [],
      EXPIRED: [],
      REFUNDED: [],
    });
  });

  it('allows every move in the table', () => {
    for (const from of STATES) {
      for (const to of allowedTransitions[from]) {
        expect(transition(from, to)).toBe(to);
        expect(canTransition(from, to)).toBe(true);
      }
    }
  });

  it('rejects every move that is not in the table', () => {
    for (const from of STATES) {
      for (const to of STATES) {
        if (allowedTransitions[from].includes(to)) continue;
        expect(() => transition(from, to), `${from} -> ${to}`).toThrow(Error);
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  it('cannot go back from success to pending or restart a failed payment', () => {
    expect(() => transition('SUCCEEDED', 'PENDING')).toThrow();
    expect(() => transition('FAILED', 'PROCESSING')).toThrow();
  });

  it('only a processing payment can succeed', () => {
    const canSucceed = STATES.filter((s) => canTransition(s, 'SUCCEEDED'));
    expect(canSucceed.sort()).toEqual(['PROCESSING', 'REFUND_PENDING']);
  });

  it('treats failed, cancelled, expired and refunded as terminal', () => {
    expect(STATES.filter(isTerminal).sort()).toEqual(['CANCELLED', 'EXPIRED', 'FAILED', 'REFUNDED']);
  });
});

describe('idempotency keys', () => {
  it('returns a fresh uuid-shaped key every time', () => {
    const keys = new Set(Array.from({ length: 50 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(50);
    for (const key of keys) expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('still produces a key when crypto.randomUUID is unavailable (plain http)', () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      expect(newIdempotencyKey()).toMatch(/^[0-9a-f-]{36}$/);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });
});
