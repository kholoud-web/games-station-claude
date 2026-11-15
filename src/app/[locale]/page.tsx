import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <main id="main" className="bg-hero-aura flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-extrabold">{t('brand')}</h1>
      <p className="text-muted">{t('demoNotice')}</p>
    </main>
  );
}
