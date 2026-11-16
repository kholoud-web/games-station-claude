import { Gamepad2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { focusRing } from '@/components/ui/focus-ring';
import { useAppLocale } from '@/i18n/use-app-locale';
import { localePath } from '@/i18n/switch';
import { cn } from '@/lib/cn';

/** Brand mark and two-tone wordmark. The first word is white, the rest is cyan, as in the design. */
export function Logo({ className }: { className?: string }) {
  const locale = useAppLocale();
  const brand = useTranslations('common')('brand');
  const label = useTranslations('header')('logoLabel');
  const [first, ...rest] = brand.split(' ');

  return (
    <Link
      href={localePath(locale, '/')}
      aria-label={label}
      className={cn('inline-flex items-center gap-3 rounded-input', focusRing, className)}
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-input border border-border bg-elevated text-cyan"
      >
        <Gamepad2 className="size-5" />
      </span>
      <span aria-hidden="true" className="text-xl font-extrabold tracking-tight text-text">
        {first} <span className="text-cyan">{rest.join(' ')}</span>
      </span>
    </Link>
  );
}
