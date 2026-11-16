'use client';

import { useEffect } from 'react';

import { rehydrateCart } from '@/stores/cart-store';

/**
 * Restores the saved guest cart after the first paint. The store skips hydration on purpose, so
 * server and client render the same empty cart first and the header badge cannot mismatch.
 */
export function CartHydrator() {
  useEffect(() => {
    void rehydrateCart();
  }, []);

  return null;
}
