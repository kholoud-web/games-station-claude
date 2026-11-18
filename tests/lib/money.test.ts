import { describe, expect, it } from 'vitest';
import { addMoney, formatMoney, money, multiplyMoney } from '@/lib/money';
import type { Money } from '@/services/types';

describe('money', () => {
  it('stores integer piasters in EGP', () => {
    expect(money(1999)).toEqual({ amount: 1999, currency: 'EGP' });
    expect(money(0)).toEqual({ amount: 0, currency: 'EGP' });
  });

  it.each([10.5, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects %s',
    (bad) => {
      expect(() => money(bad)).toThrow(RangeError);
    },
  );
});

describe('formatMoney', () => {
  it('shows pounds and piasters with Western digits in English', () => {
    expect(formatMoney(money(199999), 'en')).toContain('1,999.99');
  });

  it('keeps Western digits in Arabic', () => {
    const text = formatMoney(money(199999), 'ar');
    expect(text).toContain('1,999.99');
    expect(text).not.toMatch(/[٠-٩]/);
  });

  it('formats zero and one piaster', () => {
    expect(formatMoney(money(0), 'en')).toContain('0.00');
    expect(formatMoney(money(1), 'en')).toContain('0.01');
  });

  it('formats a very large amount without losing digits', () => {
    expect(formatMoney(money(999_999_999), 'en')).toContain('9,999,999.99');
  });

  it.each([0, 1, 99, 100, 12_345, 999_999_999, Number.MAX_SAFE_INTEGER])(
    'prints a real two-decimal number for %s piasters in both languages',
    (amount) => {
      for (const locale of ['en', 'ar'] as const) {
        const text = formatMoney(money(amount), locale);
        expect(text).not.toMatch(/NaN|Infinity|undefined|null/);
        expect(text).toMatch(/\d[\d,]*\.\d{2}/);
      }
    },
  );
});

describe('formatMoney with a Money that did not come from money()', () => {
  // A backend response or a cast can hand over any shape; the type alone proves nothing at runtime.
  const raw = (amount: unknown, currency: unknown = 'EGP') => ({ amount, currency }) as Money;

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 10.5, Number.MAX_SAFE_INTEGER + 1, '1999', null, undefined])(
    'rejects an amount of %s instead of printing it',
    (bad) => {
      for (const locale of ['en', 'ar'] as const) {
        expect(() => formatMoney(raw(bad), locale)).toThrow(RangeError);
      }
    },
  );

  it('rejects a currency other than EGP', () => {
    expect(() => formatMoney(raw(1999, 'USD'), 'en')).toThrow(RangeError);
  });
});

describe('addMoney and multiplyMoney', () => {
  it('adds amounts', () => {
    expect(addMoney(money(150), money(275))).toEqual(money(425));
  });

  it('multiplies by a whole quantity', () => {
    expect(multiplyMoney(money(2500), 3)).toEqual(money(7500));
  });

  it('rejects a fractional or negative quantity', () => {
    expect(() => multiplyMoney(money(100), 1.5)).toThrow(RangeError);
    expect(() => multiplyMoney(money(100), -1)).toThrow(RangeError);
  });

  it('rejects a sum that leaves the safe integer range', () => {
    expect(() => addMoney(money(Number.MAX_SAFE_INTEGER), money(1))).toThrow(RangeError);
  });
});
