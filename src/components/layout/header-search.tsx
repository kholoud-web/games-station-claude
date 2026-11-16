import { useTranslations } from 'next-intl';

import { SearchInput } from '@/components/shared/search-input';
import { localePath } from '@/i18n/switch';
import { useAppLocale } from '@/i18n/use-app-locale';

/** The search length cap matches `normalizeSearchQuery`. */
const MAX_QUERY_LENGTH = 100;

/**
 * A plain GET form, so search works before any JavaScript loads and the result URL can be shared.
 * The `search_performed` event is sent by the results page, which knows the result count.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const t = useTranslations('header');
  const locale = useAppLocale();

  return (
    <form role="search" action={localePath(locale, '/products')} method="get" className={className}>
      <SearchInput
        name="q"
        aria-label={t('searchLabel')}
        placeholder={t('searchPlaceholder')}
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
      />
    </form>
  );
}
