'use client';

import { useTranslations } from 'next-intl';
import { useId, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lazyZodResolver } from '@/lib/validation/lazy-resolver';
import type { NewsletterService } from '@/services/newsletter-service';

type Subscribe = NewsletterService['subscribe'];
type Values = { email: string };

/** Zod loads on the first submit, not with the page: the footer is on every route. */
const resolver = lazyZodResolver<Values>(async () => (await import('@/lib/validation/schemas')).newsletterSchema);
type Outcome = { kind: 'success'; simulated: boolean } | { kind: 'error' } | null;

/**
 * Loaded on first submit, not with the page: the footer is on every route and `@/services`
 * pulls in all the mock seed data.
 */
const defaultSubscribe: Subscribe = async (email) =>
  (await import('@/services')).services.newsletter.subscribe(email);

export function NewsletterForm({ subscribe = defaultSubscribe }: { subscribe?: Subscribe }) {
  const t = useTranslations('footer');
  const tv = useTranslations('validation');
  const inputId = useId();
  const errorId = useId();
  const inFlight = useRef(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver, defaultValues: { email: '' } });

  const submit = handleSubmit(async ({ email }) => {
    setOutcome(null);
    try {
      const result = await subscribe(email);
      reset();
      setOutcome({ kind: 'success', simulated: result.simulated });
    } catch {
      setOutcome({ kind: 'error' });
    }
  });

  // The ref blocks a second submit that arrives before React re-renders the disabled button.
  // It is only read here, in the event handler, never while rendering.
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await submit(event);
    } finally {
      inFlight.current = false;
    }
  }

  const fieldError = errors.email?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-cyan rtl:tracking-normal">
        {t('newsletterTitle')}
      </h2>
      <div className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t('emailLabel')}
        </label>
        <Input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? errorId : undefined}
          className="min-w-0 flex-1"
          {...register('email')}
        />
        <Button type="submit" loading={isSubmitting}>
          {t('join')}
        </Button>
      </div>
      {fieldError ? (
        <p id={errorId} role="alert" className="text-sm text-error">
          {tv(fieldError)}
        </p>
      ) : null}
      {outcome?.kind === 'error' ? (
        <p role="alert" className="text-sm text-error">
          {t('newsletterError')}
        </p>
      ) : null}
      {/* Always in the page so assistive tech announces the text when it appears. */}
      <p role="status" className="min-h-5 text-sm text-cyan">
        {outcome?.kind === 'success'
          ? t(outcome.simulated ? 'newsletterSuccessDemo' : 'newsletterSuccess')
          : null}
      </p>
    </form>
  );
}
