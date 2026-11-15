import type { Page, Product } from './types';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'best_selling';

export type ProductFilters = {
  query?: string;
  categoryId?: string;
  brands?: string[];
  /** Piasters, inclusive. */
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  /** Opaque cursor from a previous page's `nextCursor`. */
  cursor?: string;
  limit?: number;
};

export interface ProductService {
  list(filters: ProductFilters): Promise<Page<Product>>;
  getBySlug(slug: string): Promise<Product | null>;
}
