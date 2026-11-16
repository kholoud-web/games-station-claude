import { useId } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { focusRing } from '@/components/ui/focus-ring';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';

import type { FooterColumnData } from './nav-config';

export function FooterColumn({ id, links }: FooterColumnData) {
  const t = useTranslations('footer');
  const locale = useAppLocale();
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xs font-bold uppercase tracking-wider text-text rtl:tracking-normal">
        {t(`${id}.title`)}
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.key}>
            <Link
              href={localePath(locale, link.path)}
              className={cn('rounded-sm text-sm text-muted transition-colors hover:text-text', focusRing)}
            >
              {t(`${id}.${link.key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
