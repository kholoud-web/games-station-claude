'use client';

import { Headset, ShieldCheck, Truck } from 'lucide-react';

import { CategoryTile } from '@/components/shared/category-tile';
import { ProductCard } from '@/components/shared/product-card';
import { ProductCardSkeleton } from '@/components/shared/product-card-skeleton';
import { TrustBar } from '@/components/shared/trust-bar';
import { useAppLocale } from '@/i18n/use-app-locale';
import type { Category, Product } from '@/services/types';

import { Example, ShowcaseSection } from './section';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Protected purchase', description: 'Warranty on every console' },
  { icon: Truck, title: 'Tracked delivery', description: 'Follow your order to the door' },
  { icon: Headset, title: 'Real support', description: 'Help in Arabic and English' },
];

/** Same product with every variant set to one stock level, to show each card state. */
function withStock(product: Product, quantity: number): Product {
  return { ...product, variants: product.variants.map((v) => ({ ...v, quantity })) };
}

export function CommerceSection({ products, categories }: { products: Product[]; categories: Category[] }) {
  const locale = useAppLocale();
  const [first, second] = products;
  const category = categories[0];

  return (
    <ShowcaseSection title="Product cards and tiles">
      {first ? (
        <Example label="Product card, in stock">
          <ProductCard product={withStock(first, 20)} locale={locale} />
        </Example>
      ) : null}
      {first ? (
        <Example label="Product card, low stock">
          <ProductCard product={withStock(second ?? first, 3)} locale={locale} />
        </Example>
      ) : null}
      {first ? (
        <Example label="Product card, sold out (Add is disabled)">
          <div role="group" aria-label="Sold out example">
            <ProductCard product={withStock(first, 0)} locale={locale} />
          </div>
        </Example>
      ) : null}
      <Example label="Product card, loading">
        <div role="status" aria-busy="true" aria-label="Loading example">
          <ProductCardSkeleton />
        </div>
      </Example>
      {category ? (
        <Example label="Category tile">
          <CategoryTile category={category} locale={locale} />
        </Example>
      ) : null}
      <Example label="Trust bar">
        <TrustBar items={TRUST_ITEMS} />
      </Example>
    </ShowcaseSection>
  );
}
