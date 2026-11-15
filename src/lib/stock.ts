import type { Stock, Variant } from '@/services/types';

/** Units at or below this count are shown as "low stock". */
export const LOW_STOCK_THRESHOLD = 5;

export function stockFromQuantity(quantity: number): Stock {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'out_of_stock';
  return quantity <= LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock';
}

/** The best state across variants: a product is buyable if any variant is. */
export function stockOfProduct(variants: Pick<Variant, 'quantity'>[]): Stock {
  const best = variants.reduce((max, v) => Math.max(max, Number.isFinite(v.quantity) ? v.quantity : 0), 0);
  return stockFromQuantity(best);
}
