import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <section className="bg-hero-aura flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-extrabold">{t('brand')}</h1>
      <p className="text-muted">{t('demoNotice')}</p>
    </section>
  );
}
