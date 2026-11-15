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

/** A terminal payment never changes again; the customer has to start a new attempt. */
export function isTerminal(state: PaymentState): boolean {
  return allowedTransitions[state].length === 0;
}
