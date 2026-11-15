import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { services } from '@/services';
import type { ProductFilters } from '@/services/product-service';
import type { CartItem } from '@/services/types';
import { STALE_TIMES } from './client';
import { queryKeys } from './keys';

/** Shared by hooks and server prefetching, so both always use the same key, fetcher and cache time. */
export const productsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => services.products.list(filters),
    staleTime: STALE_TIMES.catalog,
    placeholderData: keepPreviousData,
  });

export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => services.products.getBySlug(slug),
    staleTime: STALE_TIMES.catalog,
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.categories.all,
    queryFn: () => services.categories.list(),
    staleTime: STALE_TIMES.catalog,
  });

export const pricedCartQueryOptions = (items: CartItem[]) =>
  queryOptions({
    queryKey: queryKeys.cart.priced(items),
    queryFn: () => services.pricing.price(items),
    staleTime: STALE_TIMES.cart,
  });
