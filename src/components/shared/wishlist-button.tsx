'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type WishlistButtonProps = {
  productId: string;
  productName: string;
  onToggle?: (productId: string, saved: boolean) => void;
  className?: string;
};

/**
 * One constant name plus aria-pressed. The saved state is local to the card for now: nothing is
 * persisted until the wishlist feature exists, so callers that need it pass `onToggle`.
 */
export function WishlistButton({
  productId,
  productName,
  onToggle,
  className,
}: WishlistButtonProps) {
  const t = useTranslations('components.productCard');
  const [saved, setSaved] = useState(false);

  function handleClick() {
    const next = !saved;
    setSaved(next);
    onToggle?.(productId, next);
  }

  return (
    <Button
      variant="icon"
      aria-label={t('wishlist', { name: productName })}
      aria-pressed={saved}
      onClick={handleClick}
      className={cn('relative z-10 size-10 bg-card/80', className)}
    >
      <Heart aria-hidden="true" className={cn('size-4', saved && 'fill-cyan text-cyan')} />
    </Button>
  );
}
