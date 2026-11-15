import type { Locale } from '@/i18n/routing';
import type { Money } from '@/services/types';

function assertPiasters(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`Money must be a non-negative whole number of piasters, got ${amount}`);
  }
}

export function money(amount: number): Money {
  assertPiasters(amount);
  return { amount, currency: 'EGP' };
}

export function addMoney(a: Money, b: Money): Money {
  return money(a.amount + b.amount);
}

export function multiplyMoney(m: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new RangeError(`Quantity must be a non-negative whole number, got ${quantity}`);
  }
  return money(m.amount * quantity);
}

const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-EG',
  // The -nu-latn extension keeps Western digits (0-9) in Arabic text.
  ar: 'ar-EG-u-nu-latn',
};

/** Piasters become pounds only here, at display time. */
export function formatMoney(m: Money, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { style: 'currency', currency: m.currency }).format(m.amount / 100);
}
