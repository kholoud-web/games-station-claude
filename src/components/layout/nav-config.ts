/**
 * Navigation data, kept apart from the components that render it. Paths are locale-free;
 * `localePath` adds the prefix. Routes without a page yet (categories, deals, about, gift cards,
 * orders, account, wishlist, login, signup, returns) are built in later sub-projects.
 */
export const MAIN_NAV = [
  { key: 'shop', path: '/products' },
  { key: 'categories', path: '/categories' },
  { key: 'deals', path: '/deals' },
  { key: 'about', path: '/about' },
  { key: 'giftCards', path: '/gift-cards' },
] as const;

export type MainNavKey = (typeof MAIN_NAV)[number]['key'];

export type FooterLink = { key: string; path: string };
export type FooterColumnData = { id: 'categories' | 'support' | 'account'; links: readonly FooterLink[] };

export const FOOTER_COLUMNS: readonly FooterColumnData[] = [
  {
    id: 'categories',
    links: [
      { key: 'consoles', path: '/products?category=console-systems' },
      { key: 'controllers', path: '/products?category=controllers-input' },
      { key: 'vr', path: '/products?category=vr-simulation' },
      { key: 'digital', path: '/products?category=digital-games' },
      { key: 'giftCards', path: '/gift-cards' },
    ],
  },
  {
    id: 'support',
    links: [
      { key: 'track', path: '/orders' },
      { key: 'warranty', path: '/warranty' },
      { key: 'repairs', path: '/repairs' },
      { key: 'returns', path: '/returns' },
      { key: 'diagnostics', path: '/diagnostics' },
    ],
  },
  {
    id: 'account',
    links: [
      { key: 'dashboard', path: '/account' },
      { key: 'orders', path: '/orders' },
      { key: 'wishlist', path: '/wishlist' },
      { key: 'signIn', path: '/login' },
      { key: 'createAccount', path: '/signup' },
    ],
  },
];

export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay'] as const;
