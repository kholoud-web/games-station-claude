import { useTranslations } from 'next-intl';

import { Logo } from './logo';
import { FOOTER_COLUMNS } from './nav-config';
import { FooterColumn } from './footer-column';
import { NewsletterForm } from './newsletter-form';
import { PaymentBadges } from './payment-badges';

export function Footer() {
  const t = useTranslations('footer');
  const demoNotice = useTranslations('common')('demoNotice');
  const year = String(new Date().getFullYear());

  return (
    <footer className="mt-16 border-t border-border bg-canvas">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex max-w-md flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-sm leading-relaxed text-muted">{t('blurb')}</p>
            <NewsletterForm />
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.id} {...column} />
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <PaymentBadges />
          <div className="flex flex-col gap-1 text-xs text-muted md:items-end">
            <p>{t('copyright', { year })}</p>
            <p>{demoNotice}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
