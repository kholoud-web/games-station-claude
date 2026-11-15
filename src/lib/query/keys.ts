import type { ProductFilters } from '@/services/product-service';
import type { CartItem } from '@/services/types';

/** Every query key in the app lives here so invalidation and prefetching can never drift apart. */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
  },
  categories: { all: ['categories'] as const },
  cart: { priced: (items: CartItem[]) => ['cart', 'priced', items] as const },
};
