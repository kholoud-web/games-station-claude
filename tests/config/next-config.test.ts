import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config', () => {
  it('runs Tailwind over every CSS file through the Turbopack loader', () => {
    const rule = nextConfig.turbopack?.rules?.['*.css'];
    expect(rule).toBeDefined();
    expect(JSON.stringify(rule)).toContain('@tailwindcss/turbopack');
  });
});
