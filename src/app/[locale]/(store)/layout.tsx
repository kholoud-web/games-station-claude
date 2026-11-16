import { setRequestLocale } from 'next-intl/server';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';

/** Storefront shell. The `(store)` group adds no URL segment; auth and admin get their own layouts. */
export default async function StoreLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SkipLink />
      <Header />
      {/* tabIndex -1 lets the skip link move focus here without adding a tab stop. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
