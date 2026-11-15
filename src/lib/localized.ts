import type { Locale } from '@/i18n/routing';
import type { LocalizedString } from '@/services/types';

/** Text for the locale, falling back to English when a translation is missing or blank. */
export function localize(text: LocalizedString, locale: Locale): string {
  const value = text[locale];
  return value.trim().length > 0 ? value : text.en;
}
