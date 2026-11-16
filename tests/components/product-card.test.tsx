import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductCard } from '@/components/shared/product-card';
import { setAnalyticsAdapter } from '@/lib/analytics/track';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import { cartStore } from '@/stores/cart-store';

import { makeProduct } from '../helpers/fixtures';
import { renderWithIntl } from '../helpers/render';

const variant = (id: string, quantity: number) => ({
  id,
  sku: id,
  label: { en: id, ar: id },
  quantity,
});

let events: AnalyticsEvent[] = [];

beforeEach(() => {
  cartStore.setState({ items: [] });
  events = [];
  setAnalyticsAdapter({ send: (event) => events.push(event) });
});

afterEach(() => {
  setAnalyticsAdapter(null);
});

describe('ProductCard: adding to the cart', () => {
  it('adds one line for the first variant and fires one add_to_cart event', async () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Add Test Controller to cart' }));

    expect(cartStore.getState().items).toEqual([
      { productId: 'p-test', variantId: 'v-1', quantity: 1 },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      name: 'add_to_cart',
      productId: 'p-test',
      variantId: 'v-1',
      quantity: 1,
    });
  });

  it('adds the first variant that has stock when the first one is sold out', async () => {
    const product = makeProduct({ variants: [variant('v-1', 0), variant('v-2', 4)] });
    renderWithIntl(<ProductCard product={product} locale="en" />);
    await userEvent.setup().click(screen.getByRole('button', { name: /^Add/ }));

    expect(cartStore.getState().items).toEqual([
      { productId: 'p-test', variantId: 'v-2', quantity: 1 },
    ]);
    expect(events[0]).toMatchObject({ variantId: 'v-2' });
  });

  it('adds one more unit and fires one more event on each click', async () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    const user = userEvent.setup();
    const add = screen.getByRole('button', { name: /^Add/ });
    await user.click(add);
    await user.click(add);

    expect(cartStore.getState().items).toEqual([
      { productId: 'p-test', variantId: 'v-1', quantity: 2 },
    ]);
    expect(events).toHaveLength(2);
  });

  it('disables the button, shows the out-of-stock badge and adds nothing when sold out', async () => {
    const product = makeProduct({ variants: [variant('v-1', 0), variant('v-2', 0)] });
    renderWithIntl(<ProductCard product={product} locale="en" />);
    const add = screen.getByRole('button', { name: /^Add/ });

    expect(add).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    await userEvent.setup().click(add);
    expect(cartStore.getState().items).toEqual([]);
    expect(events).toEqual([]);
  });

  it('treats a product with no variants as unavailable', () => {
    renderWithIntl(<ProductCard product={makeProduct({ variants: [] })} locale="en" />);
    expect(screen.getByRole('button', { name: /^Add/ })).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows low stock when only a few units remain', () => {
    const product = makeProduct({ variants: [variant('v-1', 3)] });
    renderWithIntl(<ProductCard product={product} locale="en" />);
    expect(screen.getByText('Low stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Add/ })).toBeEnabled();
  });
});

describe('ProductCard: content and locale', () => {
  it('links to the product page in the current locale, named by the product', () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    expect(screen.getByRole('link', { name: 'Test Controller' })).toHaveAttribute(
      'href',
      '/en/products/test-controller',
    );
  });

  it('shows the Arabic name, link and button text in Arabic', () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="ar" />, 'ar');
    expect(screen.getByRole('link', { name: 'يد تحكم تجريبية' })).toHaveAttribute(
      'href',
      '/ar/products/test-controller',
    );
    expect(
      screen.getByRole('button', { name: 'أضف يد تحكم تجريبية إلى السلة' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Test Controller')).not.toBeInTheDocument();
  });

  it('shows the price and a struck-through compare-at price', () => {
    const product = makeProduct({ compareAtPrice: { amount: 399900, currency: 'EGP' } });
    renderWithIntl(<ProductCard product={product} locale="en" />);
    expect(screen.getByText(/3,299\.00/)).toBeInTheDocument();
    expect(screen.getByText(/3,999\.00/).closest('s')).not.toBeNull();
  });

  it('shows the rating and the brand', () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    expect(
      screen.getByRole('img', { name: 'Rated 4.5 out of 5 from 120 reviews' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sony')).toBeInTheDocument();
  });

  it('shows the protection badge in the current locale, and none when absent', () => {
    const protection = { en: '1-year warranty', ar: 'ضمان لمدة سنة' };
    const { unmount } = renderWithIntl(
      <ProductCard product={makeProduct({ protection })} locale="en" />,
    );
    expect(screen.getByText('1-year warranty')).toBeInTheDocument();
    unmount();
    renderWithIntl(<ProductCard product={makeProduct({ protection })} locale="ar" />, 'ar');
    expect(screen.getByText('ضمان لمدة سنة')).toBeInTheDocument();
    unmount();
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    expect(screen.queryByText(/warranty/i)).not.toBeInTheDocument();
  });

  it('keeps the card image decorative, because the link already carries the name', () => {
    const { container } = renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('is a single article with one link, so the whole card is one tab stop plus its buttons', () => {
    renderWithIntl(<ProductCard product={makeProduct()} locale="en" />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});

describe('ProductCard: wishlist button', () => {
  it('toggles its pressed state and reports the change', async () => {
    const onToggleWishlist = vi.fn();
    renderWithIntl(
      <ProductCard product={makeProduct()} locale="en" onToggleWishlist={onToggleWishlist} />,
    );
    const save = screen.getByRole('button', { name: 'Save Test Controller to wishlist' });
    expect(save).toHaveAttribute('aria-pressed', 'false');

    const user = userEvent.setup();
    await user.click(save);
    expect(save).toHaveAttribute('aria-pressed', 'true');
    expect(onToggleWishlist).toHaveBeenLastCalledWith('p-test', true);

    await user.click(save);
    expect(save).toHaveAttribute('aria-pressed', 'false');
    expect(onToggleWishlist).toHaveBeenLastCalledWith('p-test', false);
  });
});
