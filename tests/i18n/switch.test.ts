import { describe, expect, it } from 'vitest';

import { getSwitchHref, localePath } from '@/i18n/switch';

describe('getSwitchHref', () => {
  it('swaps the leading locale and keeps the path and query string', () => {
    expect(getSwitchHref('/en/products/x', '?sort=price_asc', 'ar')).toBe(
      '/ar/products/x?sort=price_asc',
    );
  });

  it('works for a bare locale root', () => {
    expect(getSwitchHref('/ar', '', 'en')).toBe('/en');
    expect(getSwitchHref('/en', '', 'ar')).toBe('/ar');
  });

  it('keeps a trailing slash', () => {
    expect(getSwitchHref('/en/', '', 'ar')).toBe('/ar/');
  });

  it('accepts a query string with or without the leading question mark, and ignores an empty one', () => {
    expect(getSwitchHref('/en/p', 'a=1&b=2', 'ar')).toBe('/ar/p?a=1&b=2');
    expect(getSwitchHref('/en/p', '?', 'ar')).toBe('/ar/p');
  });

  it('does not mistake a path segment that merely starts with a locale for the locale', () => {
    expect(getSwitchHref('/english/page', '', 'ar')).toBe('/ar/english/page');
    expect(getSwitchHref('/arabic', '', 'en')).toBe('/en/arabic');
  });

  it('prefixes a path that has no locale at all', () => {
    expect(getSwitchHref('/products', '', 'ar')).toBe('/ar/products');
    expect(getSwitchHref('/fr/products', '', 'ar')).toBe('/ar/fr/products');
  });

  it('keeps an encoded query string untouched', () => {
    expect(getSwitchHref('/en/search', '?q=%D9%8A%D8%AF', 'ar')).toBe('/ar/search?q=%D9%8A%D8%AF');
  });
});

describe('localePath', () => {
  it('builds a locale-prefixed path', () => {
    expect(localePath('en', '/products')).toBe('/en/products');
    expect(localePath('ar', '/products')).toBe('/ar/products');
  });

  it('maps the site root to the bare locale', () => {
    expect(localePath('en', '/')).toBe('/en');
    expect(localePath('ar', '')).toBe('/ar');
  });

  it('tolerates a missing leading slash', () => {
    expect(localePath('en', 'products')).toBe('/en/products');
  });
});
