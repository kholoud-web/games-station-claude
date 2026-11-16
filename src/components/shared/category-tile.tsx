import Image from 'next/image';
import Link from 'next/link';

import type { Locale } from '@/i18n/routing';
import { localize } from '@/lib/localized';
import type { Category } from '@/services/types';

type CategoryTileProps = {
  category: Category;
  locale: Locale;
  /** Defaults to the catalog filtered by this category. */
  href?: string;
};

export function CategoryTile({ category, locale, href }: CategoryTileProps) {
  const target = href ?? `/${locale}/products?category=${encodeURIComponent(category.slug)}`;

  return (
    <Link
      href={target}
      className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-tile border border-border bg-surface-2 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-rim-strong hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <Image
        src={category.image}
        alt=""
        fill
        sizes="(min-width: 1200px) 230px, 45vw"
        className="object-contain p-6 pb-12 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="relative w-full bg-linear-to-t from-canvas/90 to-transparent p-4 text-sm font-semibold text-text">
        {localize(category.name, locale)}
      </span>
    </Link>
  );
}
