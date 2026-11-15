import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY, createCartStore, selectCount } from '@/stores/cart-store';

const A = { productId: 'p-1', variantId: 'v-1' };
const B = { productId: 'p-2', variantId: 'v-2' };

beforeEach(() => {
  localStorage.clear();
});

describe('cart store lines', () => {
  it('merges the same product and variant into one line', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 1 });
    store.getState().add({ ...A, quantity: 1 });
    expect(store.getState().items).toEqual([{ ...A, quantity: 2 }]);
  });

  it('keeps different variants of one product as separate lines', () => {
    const store = createCartStore();
    store.getState().add({ productId: 'p-1', variantId: 'v-1', quantity: 1 });
    store.getState().add({ productId: 'p-1', variantId: 'v-2', quantity: 1 });
    expect(store.getState().items).toHaveLength(2);
  });

  it('removes a line when its quantity is set to 0 or below', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 3 });
    store.getState().setQuantity(A.productId, A.variantId, 0);
    expect(store.getState().items).toEqual([]);
    store.getState().add({ ...B, quantity: 3 });
    store.getState().setQuantity(B.productId, B.variantId, -4);
    expect(store.getState().items).toEqual([]);
  });

  it('clamps a quantity above 99 to 99, including when merging', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 150 });
    expect(store.getState().items[0]?.quantity).toBe(99);
    store.getState().add({ ...A, quantity: 5 });
    expect(store.getState().items[0]?.quantity).toBe(99);
    store.getState().setQuantity(A.productId, A.variantId, 500);
    expect(store.getState().items[0]?.quantity).toBe(99);
  });

  it('ignores a line with an invalid quantity', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 0 });
    store.getState().add({ ...A, quantity: Number.NaN });
    store.getState().add({ ...A, quantity: -1 });
    expect(store.getState().items).toEqual([]);
  });

  it('truncates a fractional quantity to a whole number', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 2.9 });
    expect(store.getState().items[0]?.quantity).toBe(2);
  });

  it('removes one line and clears the cart', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 1 });
    store.getState().add({ ...B, quantity: 1 });
    store.getState().remove(A.productId, A.variantId);
    expect(store.getState().items).toEqual([{ ...B, quantity: 1 }]);
    store.getState().clear();
    expect(store.getState().items).toEqual([]);
  });

  it('counts units across lines', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 2 });
    store.getState().add({ ...B, quantity: 3 });
    expect(selectCount(store.getState())).toBe(5);
  });
});

describe('cart store persistence', () => {
  it('writes only ids and quantities, with schema version 1', () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 2 });
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null')).toEqual({
      state: { items: [{ ...A, quantity: 2 }] },
      version: 1,
    });
  });

  it('does not read storage until rehydrate is called (server and client render the same first paint)', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: [{ ...A, quantity: 4 }] }, version: 1 }));
    const store = createCartStore();
    expect(store.getState().items).toEqual([]);
  });

  it('restores a saved cart on rehydrate', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: [{ ...A, quantity: 4 }] }, version: 1 }));
    const store = createCartStore();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 4 }]);
  });

  it('strips a price that someone planted in storage', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ state: { items: [{ ...A, quantity: 1, price: 1 }] }, version: 1 }),
    );
    const store = createCartStore();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 1 }]);
    expect(Object.keys(store.getState().items[0] ?? {})).not.toContain('price');
  });
});

describe('cart store with corrupted storage', () => {
  const bad = [
    ['text that is not JSON', 'not json'],
    ['an empty object', '{}'],
    ['items that are not an array, from an old schema version', '{"state":{"items":"oops"},"version":0}'],
    ['null', 'null'],
    ['a string for state', '{"state":"x","version":1}'],
  ] as const;

  it.each(bad)('starts with an empty cart for %s', async (_label, raw) => {
    localStorage.setItem(CART_STORAGE_KEY, raw);
    const store = createCartStore();
    await expect(store.persist.rehydrate()).resolves.not.toThrow();
    expect(store.getState().items).toEqual([]);
  });

  it('keeps the valid lines and drops the broken ones', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ ...A, quantity: 2 }, { productId: '', variantId: 'v', quantity: 1 }, { ...B, quantity: 'many' }, 7] },
        version: 1,
      }),
    );
    const store = createCartStore();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 2 }]);
  });

  it('still works when storage throws on every access (private mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const store = createCartStore();
    expect(() => store.getState().add({ ...A, quantity: 1 })).not.toThrow();
    expect(store.getState().items).toHaveLength(1);
    vi.restoreAllMocks();
  });
});
