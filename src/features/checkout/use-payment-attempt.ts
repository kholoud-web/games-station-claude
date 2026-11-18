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
 * Everything remembered (key, attempt, outcome) belongs to one orderRef: when the order changes the
 * hook starts clean, and async work still running for the old order can no longer touch it.
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
  // Bumped whenever the order changes. Async work captures it and drops its result if it moved on.
  const generation = useRef(0);

  // A new order starts clean. State is reset while rendering (React's pattern for prop changes) so
  // the old outcome is never painted for the new order; the refs are reset right after.
  const [seenOrder, setSeenOrder] = useState(orderRef);
  if (seenOrder !== orderRef) {
    setSeenOrder(orderRef);
    setState('idle');
    setError(null);
    setSubmitting(false);
  }

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    generation.current += 1;
    keyRef.current = null;
    attemptRef.current = null;
    stateRef.current = 'idle';
    lock.current = false;
  }, [orderRef]);

  const isCurrent = useCallback((gen: number) => alive.current && gen === generation.current, []);

  const update = useCallback(
    (next: UiState, gen: number) => {
      if (!isCurrent(gen)) return;
      stateRef.current = next;
      setState(next);
    },
    [isCurrent],
  );

  const poll = useCallback(
    async (attemptId: string, gen: number) => {
      const from = stateRef.current === 'idle' ? 'PROCESSING' : stateRef.current;
      const result = await pollPayment({
        service,
        attemptId,
        from,
        intervalMs: pollIntervalMs,
        maxPolls,
        isCancelled: () => !isCurrent(gen),
        onState: (next) => update(next, gen),
      });
      if (result.timedOut && isCurrent(gen)) setError('timeout');
    },
    [service, pollIntervalMs, maxPolls, update, isCurrent],
  );

  const start = useCallback(
    async (key: string, gen: number) => {
      try {
        const attempt = await service.createAttempt({ orderRef, idempotencyKey: key });
        if (!isCurrent(gen)) return;
        attemptRef.current = attempt.attemptId;
        update(attempt.state === 'SUCCEEDED' ? 'PROCESSING' : attempt.state, gen);
      } catch {
        if (isCurrent(gen)) setError('network');
        return;
      }
      if (attemptRef.current && !isTerminal(stateRef.current as PaymentState)) await poll(attemptRef.current, gen);
    },
    [service, orderRef, update, poll, isCurrent],
  );

  const run = useCallback(
    async (work: (gen: number) => Promise<void>) => {
      if (lock.current) return;
      const gen = generation.current;
      lock.current = true;
      setSubmitting(true);
      setError(null);
      try {
        await work(gen);
      } finally {
        // A run for an order we have moved away from must not unlock the new order's run.
        if (gen === generation.current) lock.current = false;
        if (isCurrent(gen)) setSubmitting(false);
      }
    },
    [isCurrent],
  );

  const submit = useCallback(() => {
    if (stateRef.current !== 'idle') return;
    void run((gen) => start((keyRef.current ??= newIdempotencyKey()), gen));
  }, [run, start]);

  const retry = useCallback(() => {
    const current = stateRef.current;
    if (current === 'FAILED' || current === 'CANCELLED' || current === 'EXPIRED') {
      void run(async (gen) => {
        keyRef.current = newIdempotencyKey();
        attemptRef.current = null;
        update('idle', gen);
        await start(keyRef.current, gen);
      });
    } else if (current === 'idle' && keyRef.current) {
      const key = keyRef.current;
      void run((gen) => start(key, gen));
    } else if (attemptRef.current && current !== 'SUCCEEDED') {
      const attemptId = attemptRef.current;
      void run((gen) => poll(attemptId, gen));
    }
  }, [run, start, poll, update]);

  return { state, error, isSubmitting, submit, retry };
}
