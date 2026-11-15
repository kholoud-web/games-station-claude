import { describe, expect, it } from 'vitest';
import { addMoney, formatMoney, money, multiplyMoney } from '@/lib/money';

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

  it('never prints NaN', () => {
    for (const locale of ['en', 'ar'] as const) {
      expect(formatMoney(money(12345), locale)).not.toContain('NaN');
    }
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
