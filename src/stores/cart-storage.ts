import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { z } from '@/lib/zod';
import type { CartItem } from '@/services/types';

export const CART_STORAGE_KEY = 'gs-cart';
export const CART_SCHEMA_VERSION = 1;
export const MAX_LINE_QUANTITY = 99;

/** Strips unknown keys (such as a planted `price`) because zod objects drop them by default. */
const lineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number(),
});

/** Whole units between 1 and 99, or null when the value cannot be a quantity. */
export function normalizeQuantity(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const whole = Math.trunc(value);
  if (whole < 1) return null;
  return Math.min(whole, MAX_LINE_QUANTITY);
}

/** Keeps the valid lines of whatever was found in storage and drops everything else. */
export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const items: CartItem[] = [];
  for (const entry of raw) {
    const parsed = lineSchema.safeParse(entry);
    if (!parsed.success) continue;
    const quantity = normalizeQuantity(parsed.data.quantity);
    if (quantity !== null) items.push({ ...parsed.data, quantity });
  }
  return items;
}

/**
 * Combines the saved cart with lines already in memory (added before storage was read, or because
 * storage is empty or blocked). Nothing is dropped. For the same line the larger quantity wins
 * rather than the sum, so running this twice (React strict mode does) never inflates the cart.
 */
export function mergeLines(saved: CartItem[], inMemory: CartItem[]): CartItem[] {
  const lines = new Map<string, CartItem>();
  const keyOf = (l: CartItem) => `${l.productId}\u0000${l.variantId}`;
  for (const line of [...saved, ...inMemory]) {
    const existing = lines.get(keyOf(line));
    lines.set(keyOf(line), existing ? { ...existing, quantity: Math.max(existing.quantity, line.quantity) } : line);
  }
  return [...lines.values()];
}

type CartPersisted = { items: CartItem[] };

/**
 * localStorage wrapper that never throws: private mode, blocked storage,
 * server rendering and corrupted JSON all behave like an empty cart.
 */
export const safeCartStorage: PersistStorage<CartPersisted> = {
  getItem(name) {
    try {
      const raw = window.localStorage.getItem(name);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) return null;
      return parsed as StorageValue<CartPersisted>;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Storage is a convenience; the cart keeps working in memory.
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Nothing to clean up when storage is unavailable.
    }
  },
};

/**
 * Storage that ignores writes until `canWrite()` says the saved cart has been read and merged.
 * Without this, a change made before rehydrate would overwrite the saved cart with the in-memory
 * one, and the lines saved in an earlier visit would be gone before they were ever read.
 */
export function createGatedCartStorage(canWrite: () => boolean): PersistStorage<CartPersisted> {
  return {
    ...safeCartStorage,
    setItem(name, value) {
      if (canWrite()) safeCartStorage.setItem(name, value);
    },
  };
}
