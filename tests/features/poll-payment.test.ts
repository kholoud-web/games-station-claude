import { describe, expect, it, vi } from 'vitest';
import { pollPayment } from '@/features/checkout/poll-payment';
import type { PaymentService } from '@/services/payment-service';
import type { PaymentState } from '@/services/types';

/** A service whose getStatus answers from a fixed sequence, then repeats the last answer. */
function serviceAnswering(sequence: PaymentState[]) {
  let i = 0;
  const getStatus = vi.fn<PaymentService['getStatus']>(async () => sequence[Math.min(i++, sequence.length - 1)] ?? 'PROCESSING');
  const createAttempt = vi.fn<PaymentService['createAttempt']>();
  return { createAttempt, getStatus } satisfies PaymentService;
}

const poll = (service: PaymentService, from: PaymentState, onState = vi.fn()) =>
  pollPayment({ service, attemptId: 'a-1', from, intervalMs: 1, maxPolls: 5, isCancelled: () => false, onState });

describe('pollPayment follows the server, which is the authority', () => {
  it('shows EXPIRED when the gateway session expires while PROCESSING', async () => {
    const result = await poll(serviceAnswering(['EXPIRED']), 'PROCESSING');
    expect(result).toEqual({ state: 'EXPIRED', timedOut: false });
  });

  it('shows SUCCEEDED when the server approves while the client still sees PENDING', async () => {
    const result = await poll(serviceAnswering(['SUCCEEDED']), 'PENDING');
    expect(result).toEqual({ state: 'SUCCEEDED', timedOut: false });
  });

  it('shows FAILED when the server declines while the client still sees PENDING', async () => {
    const result = await poll(serviceAnswering(['FAILED']), 'PENDING');
    expect(result).toEqual({ state: 'FAILED', timedOut: false });
  });

  it('still ignores a stale status that moves the payment backwards', async () => {
    const onState = vi.fn();
    const result = await poll(serviceAnswering(['PENDING', 'SUCCEEDED']), 'PROCESSING', onState);
    expect(result.state).toBe('SUCCEEDED');
    expect(onState.mock.calls.map(([s]) => s)).toEqual(['SUCCEEDED']);
  });

  it('reports each forward step once and stops at the first settled state', async () => {
    const onState = vi.fn();
    const service = serviceAnswering(['PROCESSING', 'FAILED', 'SUCCEEDED']);
    const result = await poll(service, 'PENDING', onState);
    expect(result).toEqual({ state: 'FAILED', timedOut: false });
    expect(onState.mock.calls.map(([s]) => s)).toEqual(['PROCESSING', 'FAILED']);
    expect(service.getStatus).toHaveBeenCalledTimes(2);
  });
});
