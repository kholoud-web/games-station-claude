import { hashKey } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { makeQueryClient, STALE_TIMES } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { categoriesQueryOptions, pricedCartQueryOptions, productsQueryOptions } from '@/lib/query/options';
import { prefetchProducts } from '@/lib/query/prefetch';

describe('queryKeys', () => {
  it('gives equal filters the same key, whatever the property order', () => {
    expect(hashKey(queryKeys.products.list({ query: 'x', sort: 'price_asc' }))).toBe(
      hashKey(queryKeys.products.list({ sort: 'price_asc', query: 'x' })),
    );
  });

  it('gives different filters different keys', () => {
    expect(hashKey(queryKeys.products.list({ query: 'x' }))).not.toBe(hashKey(queryKeys.products.list({ query: 'y' })));
    expect(hashKey(queryKeys.products.detail('a'))).not.toBe(hashKey(queryKeys.products.detail('b')));
  });

  it('keys a priced cart by its items', () => {
    const a = [{ productId: 'p', variantId: 'v', quantity: 1 }];
    const b = [{ productId: 'p', variantId: 'v', quantity: 2 }];
    expect(hashKey(queryKeys.cart.priced(a))).not.toBe(hashKey(queryKeys.cart.priced(b)));
  });
});

describe('stale times', () => {
  it('keeps catalog data fresh longer than cart data', () => {
    expect(STALE_TIMES.catalog).toBe(5 * 60_000);
    expect(STALE_TIMES.cart).toBe(15_000);
    expect(productsQueryOptions({}).staleTime).toBe(STALE_TIMES.catalog);
    expect(categoriesQueryOptions().staleTime).toBe(STALE_TIMES.catalog);
    expect(pricedCartQueryOptions([]).staleTime).toBe(STALE_TIMES.cart);
  });
});

describe('prefetchProducts', () => {
  it('fills the cache so the client can hydrate without refetching', async () => {
    const client = makeQueryClient();
    await prefetchProducts(client, { limit: 3 });
    const cached = client.getQueryData(queryKeys.products.list({ limit: 3 }));
    expect(cached).toMatchObject({ items: expect.any(Array) });
  });
});
