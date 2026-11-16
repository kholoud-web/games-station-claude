import { routing, type Locale } from './routing';

function isLocale(segment: string): segment is Locale {
  return (routing.locales as readonly string[]).includes(segment);
}

/** `/products` becomes `/en/products`; the site root maps to the bare locale. */
export function localePath(locale: Locale, path: string): string {
  if (path === '' || path === '/') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * The same page in another language. Only a whole leading segment counts as the locale, so
 * `/english/page` is not mistaken for `/en/...`. The query string is kept as given.
 */
export function getSwitchHref(pathname: string, search: string, target: Locale): string {
  const segments = pathname.split('/');
  const rest = isLocale(segments[1] ?? '') ? segments.slice(2) : segments.slice(1);
  const base = `/${target}${rest.length > 0 ? `/${rest.join('/')}` : ''}`;
  const query = search.startsWith('?') ? search.slice(1) : search;
  return query ? `${base}?${query}` : base;
}
