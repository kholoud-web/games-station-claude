import { describe, expect, it } from 'vitest';
import { createMockServices } from '@/services/mock';

describe('OrderService', () => {
  const { orders } = createMockServices({ latencyMs: 0, failureRate: 0 });

  it('lists orders newest first', async () => {
    const list = await orders.list();
    expect(list.length).toBeGreaterThan(0);
    const dates = list.map((o) => o.placedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('gets an order by id and returns null for an unknown id', async () => {
    const first = (await orders.list())[0];
    expect(await orders.get(first?.id ?? '')).toEqual(first);
    expect(await orders.get('missing')).toBeNull();
  });
});

describe('CategoryService', () => {
  it('lists the five storefront categories', async () => {
    const { categories } = createMockServices({ latencyMs: 0, failureRate: 0 });
    const list = await categories.list();
    expect(list.map((c) => c.id)).toEqual([
      'console-systems',
      'controllers-input',
      'vr-simulation',
      'digital-games',
      'gift-cards',
    ]);
  });
});

describe('failure injection', () => {
  it('rejects every call when failureRate is 1', async () => {
    const s = createMockServices({ latencyMs: 0, failureRate: 1 });
    await expect(s.products.list({})).rejects.toThrow(Error);
    await expect(s.products.getBySlug('x')).rejects.toThrow(Error);
    await expect(s.categories.list()).rejects.toThrow(Error);
    await expect(s.pricing.price([])).rejects.toThrow(Error);
    await expect(s.orders.list()).rejects.toThrow(Error);
  });

  it('never rejects when failureRate is 0', async () => {
    const s = createMockServices({ latencyMs: 0, failureRate: 0 });
    for (let i = 0; i < 50; i += 1) {
      await expect(s.products.list({ limit: 1 })).resolves.toBeDefined();
    }
  });
});
