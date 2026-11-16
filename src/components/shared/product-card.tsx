import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/i18n/routing';
import { localize } from '@/lib/localized';
import { stockOfProduct } from '@/lib/stock';
import type { Product } from '@/services/types';

import { AddToCartButton } from './add-to-cart-button';
import { PriceTag } from './price-tag';
import { RatingPill } from './rating-pill';
import { StockBadge } from './stock-badge';
import { WishlistButton } from './wishlist-button';

type ProductCardProps = {
  product: Product;
  locale: Locale;
  onToggleWishlist?: (productId: string, saved: boolean) => void;
  /** Set on the first row of a grid so the browser fetches those images early. */
  priority?: boolean;
};

const CARD =
  'group relative flex flex-col overflow-hidden rounded-card border border-border bg-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-rim-strong hover:shadow-card-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-cyan motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/** One tab stop for the card (the name link, stretched over the card) plus its two buttons. */
export function ProductCard({
  product,
  locale,
  onToggleWishlist,
  priority = false,
}: ProductCardProps) {
  const name = localize(product.name, locale);
  const image = product.images[0];

  return (
    <article className={CARD}>
      <div className="relative aspect-square bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1200px) 290px, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-6"
          />
        ) : null}
        <WishlistButton
          productId={product.id}
          productName={name}
          onToggle={onToggleWishlist}
          className="absolute end-3 top-3"
        />
        {product.protection ? (
          <Badge tone="cyan" className="absolute start-3 bottom-3">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            {localize(product.protection, locale)}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs tracking-wider text-muted uppercase">{product.brand}</p>
        <h3 className="text-base leading-snug font-semibold text-text">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <RatingPill rating={product.rating} count={product.reviewCount} />
          <StockBadge stock={stockOfProduct(product.variants)} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <PriceTag price={product.price} compareAt={product.compareAtPrice} />
          <AddToCartButton product={product} locale={locale} />
        </div>
      </div>
    </article>
  );
}
