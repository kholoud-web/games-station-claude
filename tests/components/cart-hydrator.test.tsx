import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CartHydrator } from '@/components/providers/cart-hydrator';
import { CART_STORAGE_KEY, cartStore } from '@/stores/cart-store';

describe('CartHydrator', () => {
  beforeEach(() => {
    cartStore.setState({ items: [] });
    localStorage.clear();
  });
  afterEach(() => {
    cartStore.setState({ items: [] });
    localStorage.clear();
  });

  it('restores the saved guest cart after mount and renders nothing', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ productId: 'p-1', variantId: 'v-1', quantity: 2 }] },
        version: 1,
      }),
    );

    const { container } = render(<CartHydrator />);

    await waitFor(() => expect(cartStore.getState().items).toHaveLength(1));
    expect(cartStore.getState().items[0]).toEqual({ productId: 'p-1', variantId: 'v-1', quantity: 2 });
    expect(container).toBeEmptyDOMElement();
  });

  it('leaves an empty cart empty when nothing was saved', async () => {
    render(<CartHydrator />);
    await waitFor(() => expect(cartStore.persist.hasHydrated()).toBe(true));
    expect(cartStore.getState().items).toEqual([]);
  });
});
