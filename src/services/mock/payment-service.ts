import type { PaymentAttempt, PaymentService } from '../payment-service';
import type { MockConfig } from './config';
import { simulate } from './latency';

export type MockPaymentOptions = {
  /** Decides how a simulated payment ends. Defaults to approving every payment. */
  outcome?: (orderRef: string) => 'SUCCEEDED' | 'FAILED';
};

/** MOCK: simulated, not real. No money moves and no card data is ever handled. */
export function createMockPaymentService(config: MockConfig, options: MockPaymentOptions = {}): PaymentService {
  const outcome = options.outcome ?? (() => 'SUCCEEDED' as const);
  const byKey = new Map<string, PaymentAttempt>();
  const attempts = new Map<string, { orderRef: string; polls: number }>();

  return {
    createAttempt: ({ orderRef, idempotencyKey }) =>
      simulate(config, () => {
        const replay = byKey.get(idempotencyKey);
        if (replay) return replay;
        const attempt: PaymentAttempt = { attemptId: `mock-pay-${attempts.size + 1}`, state: 'PROCESSING' };
        byKey.set(idempotencyKey, attempt);
        attempts.set(attempt.attemptId, { orderRef, polls: 0 });
        return attempt;
      }),
    getStatus: (attemptId) =>
      simulate(config, () => {
        const attempt = attempts.get(attemptId);
        if (!attempt) throw new Error('Unknown payment attempt (mock service)');
        attempt.polls += 1;
        // The first check still reports PROCESSING so the UI shows a real pending state.
        return attempt.polls < 2 ? 'PROCESSING' : outcome(attempt.orderRef);
      }),
  };
}
