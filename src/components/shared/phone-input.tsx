'use client';

import { useId } from 'react';

import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/cn';

/** Egyptian mobile field: fixed +20 prefix, national number typed left to right in both languages. */
export function PhoneInput({
  className,
  'aria-describedby': describedBy,
  ...props
}: Omit<InputProps, 'type'>) {
  const prefixId = useId();

  return (
    <div className="flex gap-2">
      <span
        id={prefixId}
        dir="ltr"
        className="inline-flex h-11 shrink-0 items-center rounded-input border border-border bg-surface-2 px-3.5 text-sm font-semibold text-muted"
      >
        +20
      </span>
      <Input
        {...props}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        dir="ltr"
        aria-describedby={[describedBy, prefixId].filter(Boolean).join(' ')}
        className={cn('flex-1', className)}
      />
    </div>
  );
}
