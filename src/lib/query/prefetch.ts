import type { QueryClient } from '@tanstack/react-query';
import type { ProductFilters } from '@/services/product-service';
import { categoriesQueryOptions, productsQueryOptions } from './options';

/**
 * Server-side prefetch for pages that hydrate the client cache. prefetchQuery swallows errors on
 * purpose: if the service is down the page still renders and the client fetches and shows its own error state.
 */
export async function prefetchProducts(client: QueryClient, filters: ProductFilters): Promise<void> {
  await client.prefetchQuery(productsQueryOptions(filters));
}

export async function prefetchCategories(client: QueryClient): Promise<void> {
  await client.prefetchQuery(categoriesQueryOptions());
}
