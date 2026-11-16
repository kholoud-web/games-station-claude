import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from '@/components/layout/footer';
import { NewsletterForm } from '@/components/layout/newsletter-form';

import { renderWithIntl } from '../helpers/render';

const subscribed = { status: 'subscribed' as const, simulated: true };

function setup(subscribe = vi.fn().mockResolvedValue(subscribed), locale: 'en' | 'ar' = 'en') {
  const user = userEvent.setup();
  renderWithIntl(<NewsletterForm subscribe={subscribe} />, locale);
  return {
    user,
    subscribe,
    input: screen.getByRole('textbox', { name: locale === 'en' ? 'Email address' : 'البريد الإلكتروني' }),
    button: screen.getByRole('button', { name: locale === 'en' ? 'Join' : 'انضم' }),
  };
}

describe('Footer', () => {
  it('is the contentinfo landmark with the three link columns from the design', () => {
    renderWithIntl(<Footer />);
    const footer = screen.getByRole('contentinfo');
    for (const title of ['Categories', 'Support & trust', 'Account']) {
      expect(within(footer).getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('routes the three placeholder pages and keeps every link locale-prefixed', () => {
    renderWithIntl(<Footer />, 'en');
    expect(screen.getByRole('link', { name: 'Warranty policy' })).toHaveAttribute('href', '/en/warranty');
    expect(screen.getByRole('link', { name: 'Hardware repairs' })).toHaveAttribute('href', '/en/repairs');
    expect(screen.getByRole('link', { name: 'System diagnostics' })).toHaveAttribute(
      'href',
      '/en/diagnostics',
    );
    for (const link of within(screen.getByRole('contentinfo')).getAllByRole('link')) {
      expect(link.getAttribute('href')).toMatch(/^\/en(\/|$|\?)/);
    }
  });

  it('uses Arabic links and text in Arabic', () => {
    renderWithIntl(<Footer />, 'ar');
    expect(screen.getByRole('link', { name: 'سياسة الضمان' })).toHaveAttribute('href', '/ar/warranty');
  });

  it('lists the payment methods and says this is a demo', () => {
    renderWithIntl(<Footer />);
    const list = screen.getByRole('list', { name: 'Payment methods' });
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Visa',
      'Mastercard',
      'PayPal',
      'Apple Pay',
    ]);
    expect(screen.getByText(/demo only/i)).toBeInTheDocument();
  });

  it('shows the current year in the copyright line', () => {
    renderWithIntl(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Games Station`))).toBeInTheDocument();
  });
});

describe('NewsletterForm', () => {
  it('rejects an invalid email with an accessible message and sends nothing', async () => {
    const { user, subscribe, input, button } = setup();
    await user.type(input, 'nope');
    await user.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Enter a valid email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
    expect(input).toHaveFocus();
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('asks for an email when the field is empty', async () => {
    const { user, subscribe, button } = setup();
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('This field is required');
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('subscribes once with the normalized email and says the result was simulated', async () => {
    const { user, subscribe, input, button } = setup();
    await user.type(input, '  Gamer@Example.COM ');
    await user.click(button);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/demo/i));
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith('gamer@example.com');
    expect(input).toHaveValue('');
  });

  it('cannot be submitted twice while the request is in flight', async () => {
    let finish: (value: typeof subscribed) => void = () => {};
    const pending = new Promise<typeof subscribed>((resolve) => {
      finish = resolve;
    });
    const { user, subscribe, input, button } = setup(vi.fn().mockReturnValue(pending));
    await user.type(input, 'gamer@example.com');
    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    await user.type(input, '{Enter}');
    // Raw submit events skip the disabled button, as a fast double Enter or a script could.
    const form = input.closest('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(subscribe).toHaveBeenCalledTimes(1);

    finish(subscribed);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/demo/i));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('keeps the email and offers a retry when the request fails', async () => {
    const subscribe = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(subscribed);
    const { user, input, button } = setup(subscribe);
    await user.type(input, 'gamer@example.com');
    await user.click(button);

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't subscribe you. Try again.");
    expect(input).toHaveValue('gamer@example.com');
    expect(button).toBeEnabled();

    await user.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/demo/i));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(subscribe).toHaveBeenCalledTimes(2);
  });

  it('works in Arabic', async () => {
    const { user, input, button } = setup(undefined, 'ar');
    await user.type(input, 'nope');
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('أدخل بريدًا إلكترونيًا صحيحًا');
  });
});
