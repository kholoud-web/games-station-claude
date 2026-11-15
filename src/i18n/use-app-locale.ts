import { hasLocale, useLocale } from 'next-intl';

import { routing, type Locale } from './routing';

/** next-intl's `useLocale` returns a plain string; this narrows it to our `Locale`. */
export function useAppLocale(): Locale {
  const locale = useLocale();
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
