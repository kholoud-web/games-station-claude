'use client';

import { useTranslations } from 'next-intl';

import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/money';
import type { Money } from '@/services/types';

type PriceTagProps = {
  price: Money;
  /** The previous price. Only shown, struck through, when it is higher than `price`. */
  compareAt?: Money;
  className?: string;
};

export function PriceTag({ price, compareAt, className }: PriceTagProps) {
  const t = useTranslations('components.price');
  const locale = useAppLocale();
  const showCompare = compareAt !== undefined && compareAt.amount > price.amount;

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className="text-xl font-bold text-text">{formatMoney(price, locale)}</span>
      {showCompare ? (
        <>
          <span className="sr-only">{t('was')}</span>
          <s className="text-sm text-muted">{formatMoney(compareAt, locale)}</s>
        </>
      ) : null}
    </span>
  );
}
