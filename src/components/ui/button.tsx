import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

import { focusRing } from './focus-ring';

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,box-shadow,border-color] duration-150 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  {
    variants: {
      variant: {
        primary:
          'h-11 rounded-full bg-cyan px-6 text-sm font-bold text-on-cyan shadow-cta-glow hover:bg-cyan-hover hover:shadow-cta-glow-hover',
        ghost:
          'h-11 rounded-full border border-border bg-transparent px-5 text-sm text-text hover:border-rim-strong hover:bg-elevated',
        icon: 'size-11 rounded-full border border-border bg-card text-text hover:border-rim-strong hover:bg-elevated',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the single child (for example a link) with the button styling. */
    asChild?: boolean;
    /** Disables the button and announces it as busy; use while a submit is in flight. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  asChild = false,
  loading = false,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
        />
      ) : null}
      {children}
    </button>
  );
}
