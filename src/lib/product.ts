import type { Product, Variant } from '@/services/types';

/**
 * The variant a quick-add buys: the first one with stock, or null when none is available.
 * A sold-out first variant must not be added just because it is listed first.
 */
export function purchasableVariant(product: Pick<Product, 'variants'>): Variant | null {
  return product.variants.find((v) => Number.isFinite(v.quantity) && v.quantity > 0) ?? null;
}
