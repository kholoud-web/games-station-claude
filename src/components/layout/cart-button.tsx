'use client';

import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/i18n/use-app-locale';
import { localePath } from '@/i18n/switch';
import { formatCount } from '@/lib/number';
import { selectCount, useCartStore } from '@/stores/cart-store';

const MAX_BADGE = 99;

/**
 * Cart link with a unit-count badge. The link's name carries the exact count; the badge is
 * decoration and caps at 99+. The cart store is restored after mount, so the first paint is empty.
 */
export function CartButton() {
  const t = useTranslations('header');
  const locale = useAppLocale();
  const count = useCartStore(selectCount);

  return (
    <Button asChild variant="icon" className="relative size-10 border-transparent bg-transparent">
      <Link
        href={localePath(locale, '/cart')}
        aria-label={t('cart', { count, countText: formatCount(count) })}
      >
        <ShoppingBag aria-hidden="true" className="size-5" />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cyan px-1 text-[11px] font-bold leading-none text-on-cyan"
          >
            {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
