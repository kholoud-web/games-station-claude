'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

import { focusRing } from './focus-ring';

/** 24px, the WCAG 2.2 minimum target size. Give it a label or aria-label. */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer size-6 shrink-0 rounded-check border border-border bg-surface-2 transition-colors duration-150',
        'data-[state=checked]:border-cyan data-[state=checked]:bg-cyan data-[state=checked]:text-on-cyan',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRing,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check aria-hidden="true" className="size-4" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
