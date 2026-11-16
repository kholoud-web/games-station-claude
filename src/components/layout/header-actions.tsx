import { Heart, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';

import { CartButton } from './cart-button';
import { LocaleSwitcher } from './locale-switcher';

const iconButton = 'size-10 border-transparent bg-transparent';
const desktopOnly = 'hidden lg:inline-flex';

/**
 * Wishlist, cart, account and language. Only the cart stays in the bar on small screens; the rest
 * move into the slide-over menu so a 375px header does not overflow.
 */
export function HeaderActions() {
  const t = useTranslations('header');
  const locale = useAppLocale();

  return (
    <div className="ms-auto flex items-center gap-1 lg:ms-0">
      <Button asChild variant="icon" className={`${iconButton} ${desktopOnly}`}>
        <Link href={localePath(locale, '/wishlist')} aria-label={t('wishlist')}>
          <Heart aria-hidden="true" className="size-5" />
        </Link>
      </Button>
      <CartButton />
      <Button asChild variant="icon" className={`${iconButton} ${desktopOnly}`}>
        <Link href={localePath(locale, '/account')} aria-label={t('account')}>
          <UserRound aria-hidden="true" className="size-5" />
        </Link>
      </Button>
      <LocaleSwitcher className={`ms-2 ${desktopOnly}`} />
    </div>
  );
}
