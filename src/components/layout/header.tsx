import { HeaderActions } from './header-actions';
import { HeaderSearch } from './header-search';
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';

/**
 * One row on desktop. Below 768px the search drops to its own row (`order-last w-full`) and the
 * navigation moves into MobileNav. Sticky, with a blurred surface so content scrolls beneath it.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-2/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 md:flex-nowrap md:gap-x-8 md:px-6 md:py-4">
        <MobileNav />
        <Logo />
        <MainNav className="hidden md:block" />
        <HeaderSearch className="order-last w-full md:order-none md:max-w-md md:flex-1" />
        <HeaderActions />
      </div>
    </header>
  );
}
