import { describe, expect, it } from 'vitest';
import { localize } from '@/lib/localized';

describe('localize', () => {
  const name = { en: 'Controller', ar: 'يد تحكم' };

  it('returns the text for the requested locale', () => {
    expect(localize(name, 'ar')).toBe('يد تحكم');
    expect(localize(name, 'en')).toBe('Controller');
  });

  it('falls back to English when the Arabic text is blank', () => {
    expect(localize({ en: 'Controller', ar: '  ' }, 'ar')).toBe('Controller');
  });
});
