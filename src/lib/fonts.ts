import type { Locale } from '@/i18n/routing';

/**
 * Fonts are self-hosted (npm packages), so builds never depend on Google Fonts.
 * Each locale imports only its own font module, so /en never preloads Arabic files and
 * /ar never preloads Geist.
 */
export async function getFontClass(locale: Locale): Promise<string> {
  if (locale === 'ar') {
    return (await import('./fonts-arabic')).arabicFontClass;
  }
  return (await import('./fonts-latin')).latinFontClass;
}
