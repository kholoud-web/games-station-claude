'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';
import { track } from '@/lib/analytics/track';
import { cn } from '@/lib/cn';
import { localize } from '@/lib/localized';
import { purchasableVariant } from '@/lib/product';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/services/types';

type AddToCartButtonProps = { product: Product; locale: Locale; className?: string };

/** Quick add: one unit of the first in-stock variant. The cart stores ids only; prices come from the service. */
export function AddToCartButton({ product, locale, className }: AddToCartButtonProps) {
  const t = useTranslations('components.productCard');
  const add = useCartStore((state) => state.add);
  const variant = purchasableVariant(product);
  const name = localize(product.name, locale);

  function handleClick() {
    if (!variant) return;
    add({ productId: product.id, variantId: variant.id, quantity: 1 });
    track({ name: 'add_to_cart', productId: product.id, variantId: variant.id, quantity: 1 });
    toast.success(t('added', { name }));
  }

  return (
    <Button
      disabled={!variant}
      aria-label={t('addLabel', { name })}
      onClick={handleClick}
      className={cn('relative z-10 h-9 px-3.5 text-xs', className)}
    >
      <Plus aria-hidden="true" className="size-3.5" />
      {t('add')}
    </Button>
  );
}
