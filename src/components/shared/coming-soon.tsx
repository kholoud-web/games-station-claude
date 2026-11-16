import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';

export type ComingSoonPage = 'warranty' | 'repairs' | 'diagnostics';

/** Stand-in for pages that are linked from the footer but not built yet. It claims no real content. */
export function ComingSoon({ page }: { page: ComingSoonPage }) {
  const t = useTranslations('comingSoon');
  const locale = useAppLocale();

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-text">{t(`pages.${page}`)}</h1>
      <p className="text-muted">{t('message')}</p>
      <Button asChild>
        <Link href={localePath(locale, '/')}>{t('backHome')}</Link>
      </Button>
    </section>
  );
}
