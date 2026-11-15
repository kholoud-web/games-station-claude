import { describe, expect, it } from 'vitest';
import { stockFromQuantity, stockOfProduct } from '@/lib/stock';

describe('stockFromQuantity', () => {
  it.each([
    [0, 'out_of_stock'],
    [1, 'low_stock'],
    [5, 'low_stock'],
    [6, 'in_stock'],
    [200, 'in_stock'],
  ] as const)('maps %i units to %s', (quantity, expected) => {
    expect(stockFromQuantity(quantity)).toBe(expected);
  });

  it('treats a negative or fractional count as out of stock', () => {
    expect(stockFromQuantity(-3)).toBe('out_of_stock');
    expect(stockFromQuantity(Number.NaN)).toBe('out_of_stock');
  });
});

describe('stockOfProduct', () => {
  const variant = (quantity: number) => ({ id: String(quantity), sku: 's', label: { en: 'v', ar: 'v' }, quantity });

  it('is the best state across variants', () => {
    expect(stockOfProduct([variant(0), variant(3)])).toBe('low_stock');
    expect(stockOfProduct([variant(0), variant(3), variant(40)])).toBe('in_stock');
  });

  it('is out of stock when every variant is empty or there are none', () => {
    expect(stockOfProduct([variant(0), variant(0)])).toBe('out_of_stock');
    expect(stockOfProduct([])).toBe('out_of_stock');
  });
});
