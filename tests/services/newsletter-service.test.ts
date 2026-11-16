import { describe, expect, it } from 'vitest';

import { createMockNewsletterService } from '@/services/mock/newsletter-service';

describe('mock newsletter service', () => {
  it('confirms the subscription and says it was simulated', async () => {
    const service = createMockNewsletterService({ latencyMs: 0, failureRate: 0 });
    await expect(service.subscribe('gamer@example.com')).resolves.toEqual({
      status: 'subscribed',
      simulated: true,
    });
  });

  it('can fail like a dropped network request, so the form error state is reachable', async () => {
    const service = createMockNewsletterService({ latencyMs: 0, failureRate: 1 });
    await expect(service.subscribe('gamer@example.com')).rejects.toThrow(/simulated/i);
  });

  it('is exposed on the services object', async () => {
    const { createMockServices } = await import('@/services/mock');
    const services = createMockServices({ latencyMs: 0, failureRate: 0 });
    expect(typeof services.newsletter.subscribe).toBe('function');
  });
});
