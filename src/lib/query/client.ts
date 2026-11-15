import { QueryClient } from '@tanstack/react-query';

/** Catalog data changes rarely; cart and order data must stay close to the server. */
export const STALE_TIMES = {
  catalog: 5 * 60_000,
  cart: 15_000,
  orders: 15_000,
} as const;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // With server rendering a non-zero staleTime stops the client refetching what the server just sent.
      queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    },
  });
}
