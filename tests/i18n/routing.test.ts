import { describe, expect, it } from 'vitest';
import { getDirection } from '@/i18n/direction';
import { routing } from '@/i18n/routing';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('routing', () => {
  it('supports exactly en and ar, with en as default', () => {
    expect([...routing.locales]).toEqual(['en', 'ar']);
    expect(routing.defaultLocale).toBe('en');
  });

  it('always prefixes the locale in the URL', () => {
    expect(routing.localePrefix).toBe('always');
  });
});

describe('getDirection', () => {
  it('is rtl for Arabic', () => {
    expect(getDirection('ar')).toBe('rtl');
  });

  it('is ltr for English', () => {
    expect(getDirection('en')).toBe('ltr');
  });
});

describe('message files', () => {
  it('have identical key sets in en and ar', () => {
    expect(keyPaths(ar).sort()).toEqual(keyPaths(en).sort());
  });

  it('have no empty strings', () => {
    for (const messages of [en, ar]) {
      for (const path of keyPaths(messages)) {
        const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
        expect(typeof value === 'string' && value.trim().length > 0, path).toBe(true);
      }
    }
  });
});
