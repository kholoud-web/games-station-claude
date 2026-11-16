import { describe, expect, it } from 'vitest';

import { buildSecurityHeaders } from '@/lib/security-headers';

type Header = { key: string; value: string };

function headerValue(headers: Header[], key: string): string | undefined {
  return headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
}

/** `script-src 'self' 'unsafe-inline'` becomes { 'script-src': ["'self'", "'unsafe-inline'"] }. */
function parseCsp(policy: string): Record<string, string[]> {
  const directives: Record<string, string[]> = {};
  for (const part of policy.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name) directives[name] = sources;
  }
  return directives;
}

const prod = buildSecurityHeaders(false);
const dev = buildSecurityHeaders(true);
const prodCsp = parseCsp(headerValue(prod, 'Content-Security-Policy') ?? '');
const devCsp = parseCsp(headerValue(dev, 'Content-Security-Policy') ?? '');

describe('buildSecurityHeaders: production', () => {
  it('sends a Content-Security-Policy', () => {
    expect(headerValue(prod, 'Content-Security-Policy')).toBeTruthy();
  });

  it('does not allow eval anywhere', () => {
    expect(headerValue(prod, 'Content-Security-Policy')).not.toContain("'unsafe-eval'");
  });

  it('only loads content from this site by default', () => {
    expect(prodCsp['default-src']).toEqual(["'self'"]);
    expect(prodCsp['script-src']).toContain("'self'");
    expect(prodCsp['font-src']).toContain("'self'");
    expect(prodCsp['connect-src']).toEqual(["'self'"]);
  });

  it('blocks plugins, framing, base-tag and form-target tricks', () => {
    expect(prodCsp['object-src']).toEqual(["'none'"]);
    expect(prodCsp['frame-ancestors']).toEqual(["'none'"]);
    expect(prodCsp['base-uri']).toEqual(["'self'"]);
    expect(prodCsp['form-action']).toEqual(["'self'"]);
  });

  it('asks the browser to upgrade insecure requests', () => {
    expect(prodCsp).toHaveProperty('upgrade-insecure-requests');
  });

  it('never opens a directive to every origin or to a whole scheme for scripts', () => {
    for (const [name, sources] of Object.entries(prodCsp)) {
      expect(sources, `${name} must not use a wildcard`).not.toContain('*');
    }
    const scripts = prodCsp['script-src'] ?? [];
    for (const bad of ['http:', 'https:', 'data:', 'blob:']) expect(scripts).not.toContain(bad);
  });

  it('keeps Strict-Transport-Security for at least a year', () => {
    const hsts = headerValue(prod, 'Strict-Transport-Security') ?? '';
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1]);
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });
});

describe('buildSecurityHeaders: development', () => {
  it('allows eval for React Refresh and nothing else', () => {
    expect(devCsp['script-src']).toContain("'unsafe-eval'");
    expect(devCsp['object-src']).toEqual(["'none'"]);
    expect(devCsp['frame-ancestors']).toEqual(["'none'"]);
  });

  it('allows the dev server websocket', () => {
    expect(devCsp['connect-src']).toContain('ws:');
  });

  it('does not force HTTPS or send HSTS on localhost', () => {
    expect(devCsp).not.toHaveProperty('upgrade-insecure-requests');
    expect(headerValue(dev, 'Strict-Transport-Security')).toBeUndefined();
  });
});

describe.each([
  ['production', prod],
  ['development', dev],
])('buildSecurityHeaders: %s common headers', (_name, headers) => {
  it('stops MIME sniffing and framing', () => {
    expect(headerValue(headers, 'X-Content-Type-Options')).toBe('nosniff');
    expect(headerValue(headers, 'X-Frame-Options')).toBe('DENY');
  });

  it('limits the Referer header to the origin on cross-site requests', () => {
    expect(headerValue(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('turns off camera, microphone and location', () => {
    const policy = headerValue(headers, 'Permissions-Policy') ?? '';
    for (const feature of ['camera', 'microphone', 'geolocation']) {
      expect(policy).toContain(`${feature}=()`);
    }
  });

  it('keeps the payment feature available to this site for the future gateway', () => {
    expect(headerValue(headers, 'Permissions-Policy')).toContain('payment=(self)');
  });

  it('has no duplicate keys and no line breaks in any value', () => {
    const keys = headers.map((h) => h.key.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
    for (const h of headers) expect(h.value).not.toMatch(/[\r\n]/);
  });
});
