import { describe, expect, it } from 'vitest';
import { createMockPaymentService } from '@/services/mock/payment-service';

const fast = { latencyMs: 0, failureRate: 0 };

describe('mock payment service', () => {
  it('never reports success when an attempt is created', async () => {
    const service = createMockPaymentService(fast);
    for (let i = 0; i < 20; i++) {
      const attempt = await service.createAttempt({ orderRef: `o-${i}`, idempotencyKey: `k-${i}` });
      expect(attempt.state).not.toBe('SUCCEEDED');
      expect(['PENDING', 'PROCESSING']).toContain(attempt.state);
    }
  });

  it('returns the same attempt for the same idempotency key', async () => {
    const service = createMockPaymentService(fast);
    const first = await service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' });
    const replay = await service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' });
    const other = await service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-2' });
    expect(replay.attemptId).toBe(first.attemptId);
    expect(other.attemptId).not.toBe(first.attemptId);
  });

  it('confirms success only through getStatus, after the attempt has been processing', async () => {
    const service = createMockPaymentService(fast);
    const { attemptId } = await service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' });
    expect(await service.getStatus(attemptId)).toBe('PROCESSING');
    expect(await service.getStatus(attemptId)).toBe('SUCCEEDED');
    expect(await service.getStatus(attemptId)).toBe('SUCCEEDED');
  });

  it('can simulate a declined payment', async () => {
    const service = createMockPaymentService(fast, { outcome: () => 'FAILED' });
    const { attemptId } = await service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' });
    await service.getStatus(attemptId);
    expect(await service.getStatus(attemptId)).toBe('FAILED');
  });

  it('rejects a status check for an attempt it never created', async () => {
    await expect(createMockPaymentService(fast).getStatus('nope')).rejects.toThrow(/unknown/i);
  });

  it('simulates network failures like every other mock service', async () => {
    const service = createMockPaymentService({ latencyMs: 0, failureRate: 1 });
    await expect(service.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' })).rejects.toThrow();
  });

  it('keeps attempts separate between service instances', async () => {
    const a = createMockPaymentService(fast);
    const b = createMockPaymentService(fast);
    const { attemptId } = await a.createAttempt({ orderRef: 'o-1', idempotencyKey: 'k-1' });
    await expect(b.getStatus(attemptId)).rejects.toThrow();
  });
});
