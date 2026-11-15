'use client';

import { CircleCheck, CircleX, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { Stock } from '@/services/types';

const STOCK_STYLE: Record<Stock, { tone: BadgeTone; Icon: LucideIcon }> = {
  in_stock: { tone: 'cyan', Icon: CircleCheck },
  low_stock: { tone: 'warning', Icon: TriangleAlert },
  out_of_stock: { tone: 'error', Icon: CircleX },
};

/** Colour is never the only cue: every state also has its own icon and text. */
export function StockBadge({ stock }: { stock: Stock }) {
  const t = useTranslations('stock');
  const { tone, Icon } = STOCK_STYLE[stock];

  return (
    <Badge tone={tone}>
      <Icon aria-hidden="true" className="size-3.5" />
      {t(stock)}
    </Badge>
  );
}
