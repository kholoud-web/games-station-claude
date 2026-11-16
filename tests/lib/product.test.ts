import { describe, expect, it } from 'vitest';

import { purchasableVariant } from '@/lib/product';

import { makeProduct } from '../helpers/fixtures';

const variant = (id: string, quantity: number) => ({
  id,
  sku: id,
  label: { en: id, ar: id },
  quantity,
});

describe('purchasableVariant', () => {
  it('returns the first variant when it has stock', () => {
    const product = makeProduct({ variants: [variant('a', 3), variant('b', 9)] });
    expect(purchasableVariant(product)?.id).toBe('a');
  });

  it('skips a first variant that is out of stock', () => {
    const product = makeProduct({ variants: [variant('a', 0), variant('b', 4)] });
    expect(purchasableVariant(product)?.id).toBe('b');
  });

  it('returns null when no variant has stock', () => {
    expect(
      purchasableVariant(makeProduct({ variants: [variant('a', 0), variant('b', 0)] })),
    ).toBeNull();
  });

  it('returns null for a product with no variants', () => {
    expect(purchasableVariant(makeProduct({ variants: [] }))).toBeNull();
  });

  it('does not treat a negative or non-numeric quantity as stock', () => {
    const product = makeProduct({
      variants: [variant('a', -2), variant('b', Number.NaN), variant('c', 1)],
    });
    expect(purchasableVariant(product)?.id).toBe('c');
  });
});
