'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';

import { getDirection } from '@/i18n/direction';
import { useAppLocale } from '@/i18n/use-app-locale';
import { cn } from '@/lib/cn';

import { focusRing } from './focus-ring';

/** Radix defaults to LTR; passing the locale direction makes arrow keys follow the visual order in Arabic. */
export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root dir={getDirection(useAppLocale())} {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex flex-wrap gap-2', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-muted transition-colors duration-150 hover:text-text',
        'data-[state=active]:border-cyan data-[state=active]:bg-cyan data-[state=active]:text-on-cyan',
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content className={cn('mt-6 rounded-card', focusRing, className)} {...props} />
  );
}
