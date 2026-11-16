import { useEffect } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * The slide-over menu is hidden at desktop width, but a modal still traps focus and hides the page
 * from screen readers while its state is open. Close it when the window grows to the desktop layout.
 */
export function useCloseOnDesktop(open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (!open || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(DESKTOP_QUERY);
    if (query.matches) setOpen(false);

    const onChange = (event: { matches: boolean }) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open, setOpen]);
}
