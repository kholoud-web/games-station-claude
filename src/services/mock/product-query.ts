import type { Page, Product } from '../types';
import type { ProductFilters } from '../product-service';
import { stockOfProduct } from '@/lib/stock';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

function matchesQuery(product: Product, query: string): boolean {
  const haystack = [product.name.en, product.name.ar, product.sku, product.brand, ...product.variants.map((v) => v.sku)]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

const SORTERS: Record<NonNullable<ProductFilters['sort']>, (a: Product, b: Product) => number> = {
  newest: (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.salesRank - b.salesRank),
  price_asc: (a, b) => a.price.amount - b.price.amount,
  price_desc: (a, b) => b.price.amount - a.price.amount,
  best_selling: (a, b) => a.salesRank - b.salesRank,
};

function parseCursor(cursor: string | undefined): number {
  return cursor !== undefined && /^\d+$/.test(cursor) ? Number(cursor) : 0;
}

export function queryProducts(all: Product[], f: ProductFilters): Page<Product> {
  const matches = all
    .filter((p) => !f.query?.trim() || matchesQuery(p, f.query))
    .filter((p) => !f.categoryId || p.categoryId === f.categoryId)
    .filter((p) => !f.brands?.length || f.brands.includes(p.brand))
    .filter((p) => f.minPrice === undefined || p.price.amount >= f.minPrice)
    .filter((p) => f.maxPrice === undefined || p.price.amount <= f.maxPrice)
    .filter((p) => !f.inStockOnly || stockOfProduct(p.variants) !== 'out_of_stock')
    .sort(SORTERS[f.sort ?? 'best_selling']);

  const limit = Math.min(Math.max(Math.trunc(f.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = parseCursor(f.cursor);
  const end = offset + limit;
  return {
    items: matches.slice(offset, end),
    nextCursor: end < matches.length ? String(end) : null,
    total: matches.length,
  };
}
