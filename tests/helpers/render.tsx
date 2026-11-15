import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import type { Locale } from '@/i18n/routing';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';

const messages = { en, ar } as const;

/**
 * Renders a client component inside the same intl context the locale layout provides.
 * The provider is a `wrapper`, so it also survives `rerender`.
 */
export function renderWithIntl(ui: ReactElement, locale: Locale = 'en') {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
