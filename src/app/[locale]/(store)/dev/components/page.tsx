import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { isDevRouteEnabled } from '@/features/dev/dev-route';
import { ShowcaseSections } from '@/features/dev/showcase-sections';
import { services } from '@/services';

export const metadata: Metadata = { title: 'Component showcase', robots: { index: false, follow: false } };

/** Developer-only. A production build answers 404 here; see `isDevRouteEnabled`. */
export default async function ComponentShowcasePage({ params }: PageProps<'/[locale]/dev/components'>) {
  if (!isDevRouteEnabled(process.env.NODE_ENV)) notFound();

  const { locale } = await params;
  setRequestLocale(locale);

  const [{ items: products }, categories] = await Promise.all([
    services.products.list({ limit: 3 }),
    services.categories.list(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-10 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-text">Component showcase</h1>
        <p className="max-w-prose text-muted">
          Every shared component in each state. Switch the language in the header to check the
          Arabic layout. This page is not part of the production site.
        </p>
      </header>
      <ShowcaseSections products={products} categories={categories} />
    </div>
  );
}
