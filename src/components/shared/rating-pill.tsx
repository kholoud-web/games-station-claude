'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatCount } from '@/lib/number';

const pill =
  'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs';

function clampRating(rating: number): number {
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
}

export function RatingPill({ rating, count }: { rating: number; count: number }) {
  const t = useTranslations('components.rating');

  if (!(count > 0)) {
    return (
      <span className={`${pill} text-muted`}>
        <Star aria-hidden="true" className="size-3.5" />
        {t('none')}
      </span>
    );
  }

  const shown = clampRating(rating).toFixed(1);
  const countText = formatCount(count);

  return (
    <span
      role="img"
      aria-label={t('summary', { rating: shown, count, countText })}
      className={pill}
    >
      <Star aria-hidden="true" className="size-3.5 fill-cyan text-cyan" />
      <span className="font-semibold text-text">{shown}</span>
      <span className="text-muted">({countText})</span>
    </span>
  );
}
