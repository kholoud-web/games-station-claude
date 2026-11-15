'use client';

import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Spoken name of the whole control, for example "Quantity". */
  label: string;
  min?: number;
  max?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min;
}

const stepButton = 'size-9 border-transparent bg-transparent';

/** Controlled: shows `value` (clamped into range) and reports the next value; the parent owns state. */
export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 99,
  className,
}: QuantityStepperProps) {
  const t = useTranslations('components.quantity');
  const current = clamp(value, min, max);

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex h-11 items-center rounded-full border border-border bg-surface-2 p-1',
        className,
      )}
    >
      <Button
        variant="icon"
        className={stepButton}
        aria-label={t('decrease')}
        disabled={current <= min}
        onClick={() => onChange(current - 1)}
      >
        <Minus aria-hidden="true" className="size-4" />
      </Button>
      <output className="min-w-10 text-center text-base font-semibold tabular-nums text-text">
        {current}
      </output>
      <Button
        variant="icon"
        className={stepButton}
        aria-label={t('increase')}
        disabled={current >= max}
        onClick={() => onChange(current + 1)}
      >
        <Plus aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
