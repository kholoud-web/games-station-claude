import localFont from 'next/font/local';

/**
 * Latin interface font: the variable Geist file from the `geist` package (weights 100 to 900,
 * which covers 400, 600, 700 and 800). It is loaded through localFont, not `geist/font/sans`,
 * so preload can be switched off: the layout cannot tell Next which locale needs which font,
 * so preloading would fetch both families on every page.
 */
const geist = localFont({
  src: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  weight: '100 900',
  variable: '--font-geist-sans',
  display: 'swap',
  preload: false,
});

export const latinFontClass = `${geist.variable} font-latin`;
