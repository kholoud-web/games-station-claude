'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import { focusRing } from '@/components/ui/focus-ring';
import { getSwitchHref } from '@/i18n/switch';
import type { Locale } from '@/i18n/routing';
import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';

/** Each language is named in itself, so someone who cannot read the current one can still find it. */
const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', ar: 'العربية' };

type SwitchLinkProps = { search: string; className?: string };

function SwitchLink({ search, className }: SwitchLinkProps) {
  const target: Locale = useAppLocale() === 'en' ? 'ar' : 'en';
  const href = getSwitchHref(usePathname(), search, target);

  return (
    <Link
      href={href}
      hrefLang={target}
      prefetch={false}
      className={cn(
        'inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-semibold text-text hover:border-rim-strong hover:bg-elevated',
        focusRing,
        className,
      )}
    >
      <span lang={target}>{LANGUAGE_NAMES[target]}</span>
    </Link>
  );
}

function SwitchLinkWithSearch({ className }: { className?: string }) {
  return <SwitchLink search={useSearchParams().toString()} className={className} />;
}

/** Switches language on the same page. The query string needs a Suspense boundary in Next.js. */
export function LocaleSwitcher({ className }: { className?: string }) {
  return (
    <Suspense fallback={<SwitchLink search="" className={className} />}>
      <SwitchLinkWithSearch className={className} />
    </Suspense>
  );
}
