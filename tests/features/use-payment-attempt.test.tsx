import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePaymentAttempt } from '@/features/checkout/use-payment-attempt';
import type { PaymentService } from '@/services/payment-service';
import type { PaymentState } from '@/services/types';

type Attempt = Awaited<ReturnType<PaymentService['createAttempt']>>;

function fakeService(statuses: PaymentState[] = ['SUCCEEDED']) {
  let n = 0;
  const createAttempt = vi.fn<PaymentService['createAttempt']>(async () => ({
    attemptId: `a-${++n}`,
    state: 'PROCESSING',
  }));
  const getStatus = vi.fn<PaymentService['getStatus']>(async () => statuses[0] ?? 'PROCESSING');
  return { createAttempt, getStatus } satisfies PaymentService;
}

const options = (service: PaymentService, extra = {}) => ({ service, pollIntervalMs: 1, maxPolls: 5, ...extra });
const keyOf = (service: ReturnType<typeof fakeService>, call: number) =>
  service.createAttempt.mock.calls[call]?.[0].idempotencyKey;

describe('usePaymentAttempt', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(fakeService())));
    expect(result.current).toMatchObject({ state: 'idle', isSubmitting: false, error: null });
  });

  it('reaches SUCCEEDED only after getStatus confirms it', async () => {
    const service = fakeService(['SUCCEEDED']);
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(result.current.isSubmitting).toBe(false);
    expect(service.getStatus).toHaveBeenCalledWith('a-1');
  });

  it('does not trust a SUCCEEDED answer from createAttempt', async () => {
    const service = fakeService(['PROCESSING']);
    service.createAttempt.mockResolvedValue({ attemptId: 'a-1', state: 'SUCCEEDED' } as Attempt);
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service, { maxPolls: 2 })));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.error).toBe('timeout'));
    expect(result.current.state).toBe('PROCESSING');
  });

  it('creates exactly one attempt when submit is called twice in the same tick', async () => {
    const service = fakeService();
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => {
      result.current.submit();
      result.current.submit();
    });
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(service.createAttempt).toHaveBeenCalledTimes(1);
  });

  it('ignores submit and retry while an attempt is in flight', async () => {
    const service = fakeService();
    let release: (a: Attempt) => void = () => {};
    service.createAttempt.mockImplementationOnce(() => new Promise<Attempt>((r) => (release = r)));
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => result.current.submit());
    expect(result.current.isSubmitting).toBe(true);
    act(() => {
      result.current.submit();
      result.current.retry();
    });
    expect(service.createAttempt).toHaveBeenCalledTimes(1);
    await act(async () => release({ attemptId: 'a-1', state: 'PROCESSING' }));
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(service.createAttempt).toHaveBeenCalledTimes(1);
  });

  it('retry after a declined payment makes a new attempt with a new idempotency key', async () => {
    const service = fakeService();
    service.getStatus.mockResolvedValueOnce('FAILED');
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.state).toBe('FAILED'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(service.createAttempt).toHaveBeenCalledTimes(2);
    expect(keyOf(service, 1)).toBeTruthy();
    expect(keyOf(service, 1)).not.toBe(keyOf(service, 0));
  });

  it('after a network error the state stays idle and retry replays the same key', async () => {
    const service = fakeService();
    service.createAttempt.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.error).toBe('network'));
    expect(result.current).toMatchObject({ state: 'idle', isSubmitting: false });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(keyOf(service, 1)).toBe(keyOf(service, 0));
    expect(result.current.error).toBeNull();
  });

  it('after a polling timeout retry resumes the same attempt instead of creating another', async () => {
    const service = fakeService(['PROCESSING']);
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service, { maxPolls: 2 })));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.error).toBe('timeout'));
    service.getStatus.mockResolvedValue('SUCCEEDED');
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(service.createAttempt).toHaveBeenCalledTimes(1);
  });

  describe('when the order changes while the hook stays mounted', () => {
    const render = (service: ReturnType<typeof fakeService>) =>
      renderHook(({ orderRef }) => usePaymentAttempt(orderRef, options(service)), {
        initialProps: { orderRef: 'o-1' },
      });

    it('starts the new order idle instead of showing the previous order outcome', async () => {
      const service = fakeService(['SUCCEEDED']);
      const { result, rerender } = render(service);
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
      rerender({ orderRef: 'o-2' });
      expect(result.current).toMatchObject({ state: 'idle', error: null, isSubmitting: false });
    });

    it('never replays the previous order idempotency key for the new order', async () => {
      const service = fakeService(['SUCCEEDED']);
      const { result, rerender } = render(service);
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
      rerender({ orderRef: 'o-2' });
      act(() => result.current.submit());
      await waitFor(() => expect(service.createAttempt).toHaveBeenCalledTimes(2));
      expect(service.createAttempt.mock.calls[1]?.[0].orderRef).toBe('o-2');
      expect(keyOf(service, 1)).not.toBe(keyOf(service, 0));
    });

    it('does not let a poll still running for the old order write into the new one', async () => {
      const service = fakeService();
      let answer: (s: PaymentState) => void = () => {};
      service.getStatus.mockImplementation(() => new Promise<PaymentState>((resolve) => (answer = resolve)));
      const { result, rerender } = render(service);
      act(() => result.current.submit());
      await waitFor(() => expect(service.getStatus).toHaveBeenCalled());
      rerender({ orderRef: 'o-2' });
      await act(async () => answer('SUCCEEDED'));
      expect(result.current.state).toBe('idle');
    });

    it('a finished run for the old order does not unlock a run still in flight for the new one', async () => {
      const service = fakeService();
      const releases: Array<(a: Attempt) => void> = [];
      service.createAttempt.mockImplementation(() => new Promise<Attempt>((resolve) => releases.push(resolve)));
      const { result, rerender } = render(service);
      act(() => result.current.submit());
      rerender({ orderRef: 'o-2' });
      act(() => result.current.submit());
      await waitFor(() => expect(releases).toHaveLength(2));
      await act(async () => releases[0]?.({ attemptId: 'a-old', state: 'PROCESSING' }));
      act(() => result.current.submit());
      expect(service.createAttempt).toHaveBeenCalledTimes(2);
    });
  });

  it('ignores a stale status that would move the payment backwards', async () => {
    const service = fakeService();
    const seen: PaymentState[] = ['PROCESSING', 'PENDING', 'SUCCEEDED'];
    service.getStatus.mockImplementation(async () => seen.shift() ?? 'SUCCEEDED');
    const history: string[] = [];
    const { result } = renderHook(() => {
      const payment = usePaymentAttempt('o-1', options(service));
      history.push(payment.state);
      return payment;
    });
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(history).not.toContain('PENDING');
  });

  it('keeps polling through a status check that fails on the network', async () => {
    const service = fakeService();
    service.getStatus.mockRejectedValueOnce(new Error('offline')).mockResolvedValue('SUCCEEDED');
    const { result } = renderHook(() => usePaymentAttempt('o-1', options(service)));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.state).toBe('SUCCEEDED'));
    expect(result.current.error).toBeNull();
  });

  it('does not update state or warn after unmount', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const service = fakeService(['PROCESSING']);
    const { result, unmount } = renderHook(() => usePaymentAttempt('o-1', options(service, { maxPolls: 50 })));
    act(() => result.current.submit());
    await waitFor(() => expect(service.getStatus).toHaveBeenCalled());
    unmount();
    const calls = service.getStatus.mock.calls.length;
    await new Promise((r) => setTimeout(r, 20));
    expect(service.getStatus.mock.calls.length - calls).toBeLessThanOrEqual(1);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
