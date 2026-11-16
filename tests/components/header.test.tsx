import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { cartStore } from '@/stores/cart-store';
import { uiStore } from '@/stores/ui-store';

import { renderWithIntl } from '../helpers/render';

vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));

// next/link needs the app router to navigate; here a click must only run its own handlers.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    onClick?: (event: React.MouseEvent) => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

function setCart(quantities: number[]) {
  cartStore.setState({
    items: quantities.map((quantity, i) => ({ productId: `p-${i}`, variantId: `v-${i}`, quantity })),
  });
}

beforeEach(() => {
  cartStore.setState({ items: [] });
  uiStore.setState({ mobileNavOpen: false });
});
afterEach(() => {
  cartStore.setState({ items: [] });
  uiStore.setState({ mobileNavOpen: false });
  vi.unstubAllGlobals();
});

describe('Header', () => {
  it('is the page banner with a logo that links home', () => {
    renderWithIntl(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Games Station home' })).toHaveAttribute('href', '/en');
  });

  it('lists the main navigation from the design', () => {
    renderWithIntl(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const labels = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(labels).toEqual(['Shop', 'Categories', 'Deals', 'About', 'Gift cards']);
    expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/en/products');
  });

  it('has a store search that works as a plain GET form', () => {
    renderWithIntl(<Header />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('action', '/en/products');
    expect(form).toHaveAttribute('method', 'get');
    const input = within(form).getByRole('searchbox');
    expect(input).toHaveAttribute('name', 'q');
    expect(input).toHaveAttribute('placeholder', 'Search hardware, games, accessories...');
  });

  it('links to the wishlist and the account', () => {
    renderWithIntl(<Header />);
    expect(screen.getByRole('link', { name: 'Wishlist' })).toHaveAttribute('href', '/en/wishlist');
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/en/account');
  });

  it('renders Arabic labels and Arabic-prefixed links', () => {
    renderWithIntl(<Header />, 'ar');
    const nav = screen.getByRole('navigation', { name: 'الرئيسي' });
    expect(within(nav).getByRole('link', { name: 'تسوّق' })).toHaveAttribute('href', '/ar/products');
    expect(screen.getByRole('link', { name: 'الحساب' })).toHaveAttribute('href', '/ar/account');
  });
});

describe('Header cart button', () => {
  it('shows the number of units in the cart from the store', () => {
    setCart([2, 1]);
    renderWithIntl(<Header />);
    const cart = screen.getByRole('link', { name: 'Cart, 3 items' });
    expect(cart).toHaveAttribute('href', '/en/cart');
    expect(within(cart).getByText('3')).toBeInTheDocument();
  });

  it('uses the singular for one unit', () => {
    setCart([1]);
    renderWithIntl(<Header />);
    expect(screen.getByRole('link', { name: 'Cart, 1 item' })).toBeInTheDocument();
  });

  it('hides the badge when the cart is empty', () => {
    renderWithIntl(<Header />);
    const cart = screen.getByRole('link', { name: 'Cart, empty' });
    expect(within(cart).queryByText('0')).not.toBeInTheDocument();
    expect(cart.textContent).toBe('');
  });

  it('caps the visible badge but keeps the exact count for assistive tech', () => {
    setCart([99, 50]);
    renderWithIntl(<Header />);
    const cart = screen.getByRole('link', { name: 'Cart, 149 items' });
    expect(within(cart).getByText('99+')).toBeInTheDocument();
  });

  it('updates when the cart changes', () => {
    renderWithIntl(<Header />);
    expect(screen.getByRole('link', { name: 'Cart, empty' })).toBeInTheDocument();
    act(() => setCart([4]));
    expect(screen.getByRole('link', { name: 'Cart, 4 items' })).toBeInTheDocument();
  });
});

describe('SkipLink', () => {
  it('is the first focusable element and jumps to the main landmark', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <>
        <SkipLink />
        <Header />
      </>,
    );
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
  });
});

describe('Mobile navigation', () => {
  it('opens from the menu button and reports its state', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Header />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(uiStore.getState().mobileNavOpen).toBe(true);
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(within(dialog).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/en/products');
  });

  it('opens when the UI store says so and moves focus inside', () => {
    renderWithIntl(<Header />);
    act(() => uiStore.getState().setMobileNavOpen(true));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('traps keyboard focus while open', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Header />);
    act(() => uiStore.getState().setMobileNavOpen(true));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });

    for (let i = 0; i < 14; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 14; i += 1) {
      await user.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('closes on Escape and returns focus to the menu button', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Header />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');

    expect(uiStore.getState().mobileNavOpen).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('closes when a link inside it is chosen', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Header />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Deals' }));

    expect(uiStore.getState().mobileNavOpen).toBe(false);
  });

  it('closes by itself when the window grows to the desktop layout', () => {
    const listeners = new Set<(event: { matches: boolean }) => void>();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) =>
          listeners.add(cb),
        removeEventListener: (_type: string, cb: (event: { matches: boolean }) => void) =>
          listeners.delete(cb),
      })),
    );
    renderWithIntl(<Header />);
    act(() => uiStore.getState().setMobileNavOpen(true));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => listeners.forEach((cb) => cb({ matches: true })));

    expect(uiStore.getState().mobileNavOpen).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
