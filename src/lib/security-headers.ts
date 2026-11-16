// This file is imported by next.config.ts, which cannot use the `@/` alias: keep its imports relative.

export type SecurityHeader = { key: string; value: string };

/**
 * A static policy, not a per-request nonce: a nonce forces every page to render on demand, which
 * would give up static pages and CDN caching. The cost is `'unsafe-inline'` for scripts (Next.js
 * writes inline bootstrap scripts) and for styles. Everything else is closed to this site only.
 * Product videos and the payment gateway will need their origins added here when they exist.
 */
function contentSecurityPolicy(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // React Refresh evaluates code in development; production never gets 'unsafe-eval'.
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    // Local development runs over plain HTTP, where upgrading would break every request.
    ...(isDev ? {} : { 'upgrade-insecure-requests': [] }),
  };

  return Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(' '))
    .join('; ');
}

/** Headers sent on every response. `isDev` is true only for `next dev`; anything else is strict. */
export function buildSecurityHeaders(isDev: boolean): SecurityHeader[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(isDev) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // payment stays available to this site so the future gateway can use the Payment Request API.
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
    // Browsers ignore HSTS over HTTP, but it must not be sent from a local dev server at all.
    ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
  ];
}
