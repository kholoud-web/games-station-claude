import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config', () => {
  it('runs Tailwind over every CSS file through the Turbopack loader', () => {
    const rule = nextConfig.turbopack?.rules?.['*.css'];
    expect(rule).toBeDefined();
    expect(JSON.stringify(rule)).toContain('@tailwindcss/turbopack');
  });

  it('sends the security headers on every route, including the root', async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    expect(rules).toHaveLength(1);
    const [rule] = rules;
    expect(rule?.source).toBe('/:path*');
    const keys = rule?.headers.map((h) => h.key) ?? [];
    for (const key of [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      expect(keys).toContain(key);
    }
  });
});
