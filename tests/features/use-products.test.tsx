import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCategories } from '@/features/catalog/hooks/use-categories';
import { useProducts } from '@/features/catalog/hooks/use-products';
import { makeQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { prefetchProducts } from '@/lib/query/prefetch';

const state = vi.hoisted(() => ({ failureRate: 0 }));

vi.mock('@/services', async () => {
  const { createMockServices } = await import('@/services/mock');
  return {
    get services() {
      return createMockServices({ latencyMs: 0, failureRate: state.failureRate });
    },
  };
});

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useProducts', () => {
  it('is loading first, then returns the page', async () => {
    state.failureRate = 0;
    const { result } = renderHook(() => useProducts({ limit: 4 }), { wrapper });
    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(4);
  });

  it('surfaces an error state when the service rejects', async () => {
    state.failureRate = 1;
    const { result } = renderHook(() => useProducts({}), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCategories', () => {
  it('returns the five categories', async () => {
    state.failureRate = 0;
    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(5);
  });
});

describe('prefetchProducts when the service fails', () => {
  it('resolves without throwing and leaves the cache empty so the client fetches instead', async () => {
    state.failureRate = 1;
    const client = makeQueryClient();
    await expect(prefetchProducts(client, {})).resolves.toBeUndefined();
    expect(client.getQueryData(queryKeys.products.list({}))).toBeUndefined();
  });
});
