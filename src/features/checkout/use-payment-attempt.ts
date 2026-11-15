'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { services } from '@/services';
import type { PaymentService } from '@/services/payment-service';
import type { PaymentState } from '@/services/types';
import { newIdempotencyKey } from './idempotency';
import { isTerminal } from './payment-machine';
import { pollPayment } from './poll-payment';

export type PaymentError = 'network' | 'timeout' | null;
type UiState = PaymentState | 'idle';

export type UsePaymentAttemptOptions = {
  service?: PaymentService;
  pollIntervalMs?: number;
  maxPolls?: number;
};

/**
 * Drives one payment through the state machine. A ref lock blocks double submits in the same
 * tick, and the idempotency key rules keep a retry from charging twice:
 * - a declined payment is over, so a retry gets a new key and a new attempt;
 * - a network error leaves the outcome unknown, so a retry replays the same key;
 * - a polling timeout resumes asking about the same attempt.
 * SUCCEEDED only ever comes from the status endpoint, never from creating the attempt.
 */
export function usePaymentAttempt(orderRef: string, options: UsePaymentAttemptOptions = {}) {
  const { service = services.payments, pollIntervalMs = 1000, maxPolls = 30 } = options;
  const [state, setState] = useState<UiState>('idle');
  const [error, setError] = useState<PaymentError>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const alive = useRef(true);
  const stateRef = useRef<UiState>('idle');
  const keyRef = useRef<string | null>(null);
  const attemptRef = useRef<string | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const update = useCallback((next: UiState) => {
    stateRef.current = next;
    if (alive.current) setState(next);
  }, []);

  const poll = useCallback(
    async (attemptId: string) => {
      const from = stateRef.current === 'idle' ? 'PROCESSING' : stateRef.current;
      const result = await pollPayment({
        service,
        attemptId,
        from,
        intervalMs: pollIntervalMs,
        maxPolls,
        isCancelled: () => !alive.current,
        onState: update,
      });
      if (result.timedOut && alive.current) setError('timeout');
    },
    [service, pollIntervalMs, maxPolls, update],
  );

  const start = useCallback(
    async (key: string) => {
      try {
        const attempt = await service.createAttempt({ orderRef, idempotencyKey: key });
        attemptRef.current = attempt.attemptId;
        update(attempt.state === 'SUCCEEDED' ? 'PROCESSING' : attempt.state);
      } catch {
        if (alive.current) setError('network');
        return;
      }
      if (attemptRef.current && !isTerminal(stateRef.current as PaymentState)) await poll(attemptRef.current);
    },
    [service, orderRef, update, poll],
  );

  const run = useCallback(async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await work();
    } finally {
      lock.current = false;
      if (alive.current) setSubmitting(false);
    }
  }, []);

  const submit = useCallback(() => {
    if (stateRef.current !== 'idle') return;
    void run(() => start((keyRef.current ??= newIdempotencyKey())));
  }, [run, start]);

  const retry = useCallback(() => {
    const current = stateRef.current;
    if (current === 'FAILED' || current === 'CANCELLED' || current === 'EXPIRED') {
      void run(async () => {
        keyRef.current = newIdempotencyKey();
        attemptRef.current = null;
        update('idle');
        await start(keyRef.current);
      });
    } else if (current === 'idle' && keyRef.current) {
      const key = keyRef.current;
      void run(() => start(key));
    } else if (attemptRef.current && current !== 'SUCCEEDED') {
      const attemptId = attemptRef.current;
      void run(() => poll(attemptId));
    }
  }, [run, start, poll, update]);

  return { state, error, isSubmitting, submit, retry };
}
