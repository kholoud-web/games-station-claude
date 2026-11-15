'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/cn';

/**
 * The toggle keeps one name ("Show password") and reports its state with aria-pressed;
 * changing the name as well would make screen readers announce the state twice.
 */
export function PasswordInput({ className, ...props }: Omit<InputProps, 'type'>) {
  const t = useTranslations('components.password');
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-muted"
      />
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('ps-10 pe-12', className)}
      />
      <Button
        variant="icon"
        aria-label={t('show')}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute end-1.5 top-1/2 size-9 -translate-y-1/2 border-transparent bg-transparent"
      >
        <ToggleIcon aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
