import type { PaymentState } from './types';

export type PaymentAttempt = { attemptId: string; state: PaymentState };

/**
 * Contract for the future server-side payment API. The browser never sees card data here:
 * the real flow hands card entry to the provider's hosted fields or redirect, and the
 * backend confirms the outcome by verified webhook. `getStatus` is the only source of SUCCEEDED.
 */
export interface PaymentService {
  /** Replaying the same idempotency key must return the same attempt, never a second charge. */
  createAttempt(input: { orderRef: string; idempotencyKey: string }): Promise<PaymentAttempt>;
  getStatus(attemptId: string): Promise<PaymentState>;
}
