import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { focusRing } from '@/components/ui/focus-ring';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';

import { MAIN_NAV } from './nav-config';

/** Desktop navigation. Below 768px the same links live in MobileNav. */
export function MainNav({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const label = useTranslations('header')('mainNavigation');
  const locale = useAppLocale();

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-6">
        {MAIN_NAV.map((item) => (
          <li key={item.key}>
            <Link
              href={localePath(locale, item.path)}
              className={cn(
                'rounded-input py-2 text-sm font-semibold text-muted transition-colors hover:text-text',
                focusRing,
              )}
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
