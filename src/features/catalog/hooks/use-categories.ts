'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesQueryOptions } from '@/lib/query/options';

export function useCategories() {
  return useQuery(categoriesQueryOptions());
}
