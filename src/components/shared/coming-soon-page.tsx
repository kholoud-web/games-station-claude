import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';

import { ComingSoon, type ComingSoonPage } from './coming-soon';

type Props = { params: Promise<{ locale: string }> };

/** Builds the page and metadata exports for a footer page that is not built yet. */
export function createComingSoonPage(page: ComingSoonPage) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) return {};
    const t = await getTranslations({ locale, namespace: 'comingSoon.pages' });
    const brand = await getTranslations({ locale, namespace: 'common' });
    return { title: `${t(page)} | ${brand('brand')}` };
  }

  async function Page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <ComingSoon page={page} />;
  }

  return { generateMetadata, Page };
}
