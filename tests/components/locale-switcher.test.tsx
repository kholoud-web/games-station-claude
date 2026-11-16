import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';

import { renderWithIntl } from '../helpers/render';

const nav = vi.hoisted(() => ({ pathname: '/en', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    nav.pathname = '/en';
    nav.search = '';
  });

  it('links to the same page in Arabic, keeping the path and query', () => {
    nav.pathname = '/en/products/x';
    nav.search = 'sort=price_asc';
    renderWithIntl(<LocaleSwitcher />, 'en');

    const link = screen.getByRole('link', { name: 'العربية' });
    expect(link).toHaveAttribute('href', '/ar/products/x?sort=price_asc');
    expect(link).toHaveAttribute('hreflang', 'ar');
  });

  it('links back to English from Arabic', () => {
    nav.pathname = '/ar/products/x';
    renderWithIntl(<LocaleSwitcher />, 'ar');

    const link = screen.getByRole('link', { name: 'English' });
    expect(link).toHaveAttribute('href', '/en/products/x');
    expect(link).toHaveAttribute('hreflang', 'en');
  });

  it('marks the language of its own text so screen readers pronounce it correctly', () => {
    renderWithIntl(<LocaleSwitcher />, 'en');
    expect(screen.getByText('العربية')).toHaveAttribute('lang', 'ar');
  });

  it('omits the question mark when there is no query string', () => {
    renderWithIntl(<LocaleSwitcher />, 'en');
    expect(screen.getByRole('link', { name: 'العربية' })).toHaveAttribute('href', '/ar');
  });
});
