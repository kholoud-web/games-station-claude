import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  it('writes only ids and quantities, with schema version 1 (once the saved cart has been read)', async () => {
    const store = createCartStore();
    await store.persist.rehydrate();
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

  // The line parser is hand-written (Zod is too heavy for every page); these pin what it accepts.
  const lineCases: Array<[string, unknown, ReturnType<() => object | null>]> = [
    ['an empty variantId', { ...A, variantId: '', quantity: 1 }, null],
    ['a missing variantId', { productId: 'p-1', quantity: 1 }, null],
    ['a null entry', null, null],
    ['an array entry', [A], null],
    ['a null quantity', { ...A, quantity: null }, null],
    ['a zero quantity', { ...A, quantity: 0 }, null],
    ['a negative quantity', { ...A, quantity: -3 }, null],
    ['a numeric productId', { productId: 7, variantId: 'v-1', quantity: 1 }, null],
    ['a fractional quantity (whole units kept)', { ...A, quantity: 2.9 }, { ...A, quantity: 2 }],
    ['an oversized quantity (clamped to 99)', { ...A, quantity: 500 }, { ...A, quantity: 99 }],
    ['extra fields (only the three known ones survive)', { ...A, quantity: 1, price: 1, note: 'x' }, { ...A, quantity: 1 }],
  ];

  it.each(lineCases)('a saved line with %s', async (_label, line, expected) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: [line] }, version: 1 }));
    const store = createCartStore();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual(expected ? [expected] : []);
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

describe('cart store rehydration keeps what is already in memory', () => {
  afterEach(() => vi.restoreAllMocks());

  const saved = (items: object[]) =>
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items }, version: 1 }));

  it('does not wipe an item added before rehydrate when storage is empty', async () => {
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 2 });
    localStorage.clear();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 2 }]);
  });

  it('does not wipe the cart when storage is blocked (private mode) and rehydrate runs', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const store = createCartStore();
    store.getState().add({ ...A, quantity: 1 });
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 1 }]);
  });

  it('keeps both the saved lines and a line added before rehydrate', async () => {
    saved([{ ...A, quantity: 2 }]);
    const store = createCartStore();
    store.getState().add({ ...B, quantity: 1 });
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual(expect.arrayContaining([{ ...A, quantity: 2 }, { ...B, quantity: 1 }]));
    expect(store.getState().items).toHaveLength(2);
  });

  it('does not write storage before it has been read, so a saved cart is never overwritten', () => {
    saved([{ ...A, quantity: 2 }]);
    const store = createCartStore();
    store.getState().add({ ...B, quantity: 1 });
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
    expect(stored.state.items).toEqual([{ ...A, quantity: 2 }]);
  });

  it('writes the merged cart to storage once rehydrated', async () => {
    saved([{ ...A, quantity: 2 }]);
    const store = createCartStore();
    store.getState().add({ ...B, quantity: 1 });
    await store.persist.rehydrate();
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
    expect(stored.state.items).toHaveLength(2);
    expect(stored.version).toBe(1);
  });

  it('keeps writes off when reading the saved cart failed, so the unread cart is not replaced', async () => {
    saved([{ ...A, quantity: 2 }]);
    const store = createCartStore();
    store.persist.setOptions({
      merge: () => {
        throw new Error('cannot merge');
      },
    });
    await store.persist.rehydrate();
    store.getState().add({ ...B, quantity: 1 });
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
    expect(stored.state.items).toEqual([{ ...A, quantity: 2 }]);
  });

  it('is safe to run twice (React strict mode runs effects twice in development)', async () => {
    saved([{ ...A, quantity: 2 }]);
    const store = createCartStore();
    await store.persist.rehydrate();
    await store.persist.rehydrate();
    expect(store.getState().items).toEqual([{ ...A, quantity: 2 }]);
  });
});
