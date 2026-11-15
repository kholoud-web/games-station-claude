import localFont from 'next/font/local';

// next/font needs literal paths, so the file names are written out in full.

/** Arabic glyphs. IBM Plex Sans Arabic ships 400, 600 and 700 (no 800). */
const plexArabic = localFont({
  src: [
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: false,
});

/** Digits and brand names on Arabic pages, so Geist is never fetched there. */
const plexLatin = localFont({
  src: [
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-plex-latin',
  display: 'swap',
  preload: false,
});

export const arabicFontClass = `${plexArabic.variable} ${plexLatin.variable} font-arabic`;
