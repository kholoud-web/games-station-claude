import { createStore, type Mutate, type StoreApi, useStore } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/services/types';
import {
  CART_SCHEMA_VERSION,
  CART_STORAGE_KEY,
  createGatedCartStorage,
  MAX_LINE_QUANTITY,
  mergeLines,
  normalizeQuantity,
  sanitizeItems,
} from './cart-storage';

export { CART_STORAGE_KEY } from './cart-storage';

export type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  remove: (productId: string, variantId: string) => void;
  clear: () => void;
};

type CartStore = Mutate<StoreApi<CartState>, [['zustand/persist', { items: CartItem[] }]]>;

const sameLine = (a: CartItem, productId: string, variantId: string) =>
  a.productId === productId && a.variantId === variantId;

/**
 * The cart holds ids and quantities only. Prices and totals always come from
 * the pricing service, so a stale or tampered price can never be displayed.
 * Storage is read only on `rehydrate()` so server and client render the same first paint, and it
 * is written only after that read, so nothing done before it can overwrite the saved cart.
 */
export function createCartStore() {
  let hydrated = false;
  const store: CartStore = createStore<CartState>()(
    persist(
      (set) => ({
        items: [],
        add: (item) => {
          const quantity = normalizeQuantity(item.quantity);
          if (quantity === null) return;
          set((state) => {
            const existing = state.items.find((l) => sameLine(l, item.productId, item.variantId));
            if (!existing) return { items: [...state.items, { ...item, quantity }] };
            const merged = Math.min(existing.quantity + quantity, MAX_LINE_QUANTITY);
            return { items: state.items.map((l) => (l === existing ? { ...l, quantity: merged } : l)) };
          });
        },
        setQuantity: (productId, variantId, quantity) => {
          if (Number.isNaN(quantity)) return;
          const next = normalizeQuantity(quantity);
          set((state) => ({
            items:
              next === null
                ? state.items.filter((l) => !sameLine(l, productId, variantId))
                : state.items.map((l) => (sameLine(l, productId, variantId) ? { ...l, quantity: next } : l)),
          }));
        },
        remove: (productId, variantId) =>
          set((state) => ({ items: state.items.filter((l) => !sameLine(l, productId, variantId)) })),
        clear: () => set({ items: [] }),
      }),
      {
        name: CART_STORAGE_KEY,
        version: CART_SCHEMA_VERSION,
        storage: createGatedCartStorage(() => hydrated),
        skipHydration: true,
        onRehydrateStorage: () => (_state, error) => {
          // A failed read keeps writes off: the saved cart is still unread and must not be replaced.
          if (error) return;
          hydrated = true;
          // Save what the merge produced (for example lines added before the read).
          store.setState((s) => ({ items: s.items }));
        },
        partialize: (state) => ({ items: state.items }),
        migrate: (persisted) => ({ items: sanitizeItems((persisted as { items?: unknown } | null)?.items) }),
        merge: (persisted, current) => ({
          ...current,
          items: mergeLines(sanitizeItems((persisted as { items?: unknown } | null)?.items), current.items),
        }),
      },
    ),
  );
  return store;
}

export const cartStore = createCartStore();

export function useCartStore<T>(selector: (state: CartState) => T): T {
  return useStore(cartStore, selector);
}

export const selectCount = (state: Pick<CartState, 'items'>): number =>
  state.items.reduce((sum, line) => sum + line.quantity, 0);

/** Call once on the client after mount to restore the saved cart. */
export const rehydrateCart = () => cartStore.persist.rehydrate();
