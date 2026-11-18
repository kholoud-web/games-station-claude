import type { PaymentState } from '@/services/types';

export type { PaymentState };

/**
 * Every legal payment move. Only a status confirmed by the server may reach SUCCEEDED:
 * a browser redirect or a success URL is never proof of payment.
 */
export const allowedTransitions: Record<PaymentState, readonly PaymentState[]> = {
  PENDING: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
  PROCESSING: ['SUCCEEDED', 'FAILED', 'CANCELLED'],
  SUCCEEDED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED', 'SUCCEEDED'],
  FAILED: [],
  CANCELLED: [],
  EXPIRED: [],
  REFUNDED: [],
};

export function canTransition(from: PaymentState, to: PaymentState): boolean {
  return allowedTransitions[from].includes(to);
}

export function transition(from: PaymentState, to: PaymentState): PaymentState {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal payment transition ${from} -> ${to}`);
  }
  return to;
}

/** How far along the payment lifecycle a state is. Settled outcomes share one stage. */
const stage: Record<PaymentState, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SUCCEEDED: 2,
  FAILED: 2,
  CANCELLED: 2,
  EXPIRED: 2,
  REFUND_PENDING: 3,
  REFUNDED: 4,
};

/**
 * Whether a status reported by the server is news. The server is the authority, so it may skip
 * steps the client never saw (PENDING straight to SUCCEEDED, PROCESSING to EXPIRED); only a status
 * that is not further along than what we already show is stale and ignored.
 */
export function isForwardMove(from: PaymentState, to: PaymentState): boolean {
  return stage[to] > stage[from];
}

/** A terminal payment never changes again; the customer has to start a new attempt. */
export function isTerminal(state: PaymentState): boolean {
  return allowedTransitions[state].length === 0;
}
