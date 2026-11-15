'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/cn';

/** Pill search field. Pass `aria-label` for a more specific name than the default "Search". */
export function SearchInput({
  className,
  'aria-label': ariaLabel,
  ...props
}: Omit<InputProps, 'type'>) {
  const t = useTranslations('components.search');

  return (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-muted"
      />
      <Input
        {...props}
        type="search"
        aria-label={ariaLabel ?? t('label')}
        className={cn('rounded-full ps-11 pe-4', className)}
      />
    </div>
  );
}
