'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Heart, Menu, UserRound, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { focusRing } from '@/components/ui/focus-ring';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui-store';

import { LocaleSwitcher } from './locale-switcher';
import { MAIN_NAV } from './nav-config';
import { useCloseOnDesktop } from './use-close-on-desktop';

const itemClass = cn(
  'flex h-12 items-center gap-3 rounded-input px-3 text-base font-semibold text-text hover:bg-elevated',
  focusRing,
);

/**
 * Slide-over menu for widths below 768px. Radix Dialog supplies the modal behavior: focus moves in,
 * stays trapped, Escape closes, and focus returns to the menu button. Open state lives in the UI
 * store so other parts of the page can open it.
 */
export function MobileNav() {
  const t = useTranslations('header');
  const tNav = useTranslations('nav');
  const locale = useAppLocale();
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);
  useCloseOnDesktop(open, setOpen);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="icon" aria-label={t('menu')} className="size-10 border-transparent bg-transparent md:hidden">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm md:hidden" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 start-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-6 overflow-y-auto border-e border-border bg-card p-5 shadow-card-hover md:hidden',
            'transition-transform duration-200 motion-reduce:transition-none ltr:starting:-translate-x-full rtl:starting:translate-x-full',
          )}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-text">{t('menuTitle')}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="icon" aria-label={t('closeMenu')} className="size-10">
                <X aria-hidden="true" className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{t('menuDescription')}</Dialog.Description>
          <nav aria-label={t('mainNavigation')}>
            <ul className="flex flex-col gap-1">
              {MAIN_NAV.map((item) => (
                <li key={item.key}>
                  <Dialog.Close asChild>
                    <Link href={localePath(locale, item.path)} className={itemClass}>
                      {tNav(item.key)}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
            <Dialog.Close asChild>
              <Link href={localePath(locale, '/wishlist')} className={itemClass}>
                <Heart aria-hidden="true" className="size-5" />
                {t('wishlist')}
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href={localePath(locale, '/account')} className={itemClass}>
                <UserRound aria-hidden="true" className="size-5" />
                {t('account')}
              </Link>
            </Dialog.Close>
            <LocaleSwitcher className="mt-2 w-fit" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
