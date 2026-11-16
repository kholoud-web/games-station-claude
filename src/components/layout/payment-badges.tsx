import { useTranslations } from 'next-intl';

import { PAYMENT_METHODS } from './nav-config';

/**
 * Text badges as in the design. These are placeholders: the accepted methods depend on the payment
 * provider, which is still a business decision. Brand names are not translated.
 */
export function PaymentBadges() {
  const t = useTranslations('footer');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold text-muted">{t('paymentsLabel')}</span>
      <ul aria-label={t('paymentsLabel')} className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((method) => (
          <li
            key={method}
            className="rounded-md bg-elevated px-2.5 py-1 text-[11px] font-bold text-text"
          >
            {method}
          </li>
        ))}
      </ul>
    </div>
  );
}
