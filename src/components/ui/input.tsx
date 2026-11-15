import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

export type InputProps = ComponentProps<'input'> & {
  /** Sets aria-invalid and the error border. Pair it with a visible message. */
  invalid?: boolean;
};

export function Input({ className, invalid, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-input border border-border bg-surface-2 px-3.5 text-sm text-text transition-[border-color,box-shadow] duration-150 placeholder:text-muted',
        'focus-visible:border-cyan focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-cyan/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-error',
        className,
      )}
      {...props}
    />
  );
}
