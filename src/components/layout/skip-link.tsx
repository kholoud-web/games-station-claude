import { useTranslations } from 'next-intl';

import { focusRing } from '@/components/ui/focus-ring';
import { cn } from '@/lib/cn';

/** First focusable element on every storefront page. Visible only while it has keyboard focus. */
export function SkipLink() {
  const t = useTranslations('a11y');

  return (
    <a
      href="#main"
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100]',
        'rounded-full bg-cyan px-5 py-3 text-sm font-bold text-on-cyan shadow-cta-glow',
        focusRing,
      )}
    >
      {t('skipToContent')}
    </a>
  );
}
