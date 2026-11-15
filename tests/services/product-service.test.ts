import { describe, expect, it } from 'vitest';
import { createMockServices } from '@/services/mock';

const { products } = createMockServices({ latencyMs: 0, failureRate: 0 });

describe('ProductService.list', () => {
  it('finds products by name regardless of case', async () => {
    const page = await products.list({ query: 'DUALSENSE' });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((p) => p.name.en.toLowerCase().includes('dualsense'))).toBe(true);
  });

  it('finds products by Arabic name', async () => {
    const page = await products.list({ query: 'سماعة' });
    expect(page.items.map((p) => p.slug)).toContain('pulse-3d-wireless-headset');
  });

  it('finds products by SKU', async () => {
    const page = await products.list({ query: 'GS-VR-001' });
    expect(page.items.map((p) => p.slug)).toEqual(['meta-quest-3-128gb']);
  });

  it('returns nothing for a query that matches nothing', async () => {
    const page = await products.list({ query: 'zzzz-no-match' });
    expect(page).toEqual({ items: [], nextCursor: null, total: 0 });
  });

  it('filters by category and brand', async () => {
    const page = await products.list({ categoryId: 'controllers-input', brands: ['Sony'] });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((p) => p.categoryId === 'controllers-input' && p.brand === 'Sony')).toBe(true);
  });

  it('filters by price range in piasters', async () => {
    const page = await products.list({ minPrice: 100_000, maxPrice: 500_000 });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((p) => p.price.amount >= 100_000 && p.price.amount <= 500_000)).toBe(true);
  });

  it('hides products with no stock when inStockOnly is set', async () => {
    const all = await products.list({});
    const inStock = await products.list({ inStockOnly: true });
    expect(all.items.map((p) => p.slug)).toContain('playstation-5-digital');
    expect(inStock.items.map((p) => p.slug)).not.toContain('playstation-5-digital');
  });

  it('sorts by price ascending and descending', async () => {
    const asc = (await products.list({ sort: 'price_asc' })).items.map((p) => p.price.amount);
    const desc = (await products.list({ sort: 'price_desc' })).items.map((p) => p.price.amount);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('sorts newest first and best selling first', async () => {
    const newest = (await products.list({ sort: 'newest' })).items.map((p) => p.createdAt);
    expect(newest).toEqual([...newest].sort().reverse());
    const best = (await products.list({ sort: 'best_selling' })).items.map((p) => p.salesRank);
    expect(best).toEqual([...best].sort((a, b) => a - b));
  });

  it('pages through every product exactly once with a cursor', async () => {
    const total = (await products.list({})).total;
    const seen: string[] = [];
    let cursor: string | undefined;
    let pages = 0;
    do {
      const page = await products.list({ limit: 5, cursor });
      expect(page.items.length).toBeLessThanOrEqual(5);
      seen.push(...page.items.map((p) => p.id));
      cursor = page.nextCursor ?? undefined;
      pages += 1;
    } while (cursor && pages < 20);
    expect(seen).toHaveLength(total);
    expect(new Set(seen).size).toBe(total);
  });

  it('starts from the first page when the cursor is garbage', async () => {
    const first = await products.list({ limit: 3 });
    const garbage = await products.list({ limit: 3, cursor: 'not-a-cursor' });
    expect(garbage.items.map((p) => p.id)).toEqual(first.items.map((p) => p.id));
  });
});

describe('ProductService.getBySlug', () => {
  it('returns the product for a known slug', async () => {
    const product = await products.getBySlug('dualsense-edge-wireless-controller');
    expect(product?.sku).toBe('GS-CTL-001');
  });

  it('returns null for an unknown slug', async () => {
    expect(await products.getBySlug('does-not-exist')).toBeNull();
  });
});
