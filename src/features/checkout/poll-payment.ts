import type { PaymentService } from '@/services/payment-service';
import type { PaymentState } from '@/services/types';
import { isForwardMove, isTerminal } from './payment-machine';

type PollInput = {
  service: PaymentService;
  attemptId: string;
  from: PaymentState;
  intervalMs: number;
  maxPolls: number;
  isCancelled: () => boolean;
  onState: (state: PaymentState) => void;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Asks the server for the payment status until it settles. The server is the authority, so any
 * status further along than ours is accepted even if it skips steps; one that is not (stale) is
 * ignored. A failed check counts as a poll and is retried.
 * Returns timedOut when the outcome is still unknown, so the UI can show a pending state.
 */
export async function pollPayment(input: PollInput): Promise<{ state: PaymentState; timedOut: boolean }> {
  let current = input.from;
  for (let i = 0; i < input.maxPolls; i++) {
    if (input.isCancelled()) return { state: current, timedOut: false };
    try {
      const next = await input.service.getStatus(input.attemptId);
      if (input.isCancelled()) return { state: current, timedOut: false };
      if (isForwardMove(current, next)) {
        current = next;
        input.onState(current);
      }
      if (current === 'SUCCEEDED' || isTerminal(current)) return { state: current, timedOut: false };
    } catch {
      // A dropped status check says nothing about the payment; try again.
    }
    await sleep(input.intervalMs);
  }
  return { state: current, timedOut: true };
}
