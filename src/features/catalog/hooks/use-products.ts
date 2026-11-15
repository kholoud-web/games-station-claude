'use client';

import { useQuery } from '@tanstack/react-query';
import { productsQueryOptions } from '@/lib/query/options';
import type { ProductFilters } from '@/services/product-service';

export function useProducts(filters: ProductFilters) {
  return useQuery(productsQueryOptions(filters));
}
