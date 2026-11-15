import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

/** Loading placeholder. Hidden from assistive tech; the loading region carries aria-busy. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-input bg-elevated motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
