import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { parseEnv } from './src/lib/env';
import { buildSecurityHeaders } from './src/lib/security-headers';

// Stop the build or dev server on a malformed environment value instead of falling back silently.
parseEnv(process.env);

const nextConfig: NextConfig = {
  async headers() {
    // Only `next dev` is treated as development; any other value gets the strict production policy.
    return [{ source: '/:path*', headers: buildSecurityHeaders(process.env.NODE_ENV === 'development') }];
  },
  turbopack: {
    rules: {
      // Tailwind v4 has no PostCSS step here; the Turbopack loader compiles @theme, @utility and utilities.
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
