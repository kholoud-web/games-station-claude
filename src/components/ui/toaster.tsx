'use client';

import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';

import { getDirection } from '@/i18n/direction';
import { useAppLocale } from '@/i18n/use-app-locale';

const toastTheme = {
  '--normal-bg': 'var(--elevated)',
  '--normal-text': 'var(--text)',
  '--normal-border': 'var(--border)',
  '--border-radius': 'var(--radius-card)',
} as CSSProperties;

/** Mount once in the locale layout. Messages should be translated by the caller before `toast()`. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      dir={getDirection(useAppLocale())}
      style={toastTheme}
    />
  );
}
