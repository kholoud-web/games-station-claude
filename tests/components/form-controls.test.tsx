import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PasswordInput } from '@/components/shared/password-input';
import { PhoneInput } from '@/components/shared/phone-input';
import { SearchInput } from '@/components/shared/search-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import { renderWithIntl } from '../helpers/render';

describe('Input', () => {
  it('uses the input radius and recessed surface tokens', () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass(
      'rounded-input',
      'bg-surface-2',
      'border-border',
    );
  });

  it('marks itself invalid for assistive tech only when invalid', () => {
    const { rerender } = render(<Input aria-label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid');
    rerender(<Input aria-label="Email" invalid />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-error');
  });
});

describe('Checkbox', () => {
  it('toggles and reports the new state', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Remember me" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Remember me' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    await userEvent.setup().click(box);
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles with the keyboard and uses the checkbox radius token', async () => {
    render(<Checkbox aria-label="Terms" />);
    const box = screen.getByRole('checkbox', { name: 'Terms' });
    expect(box).toHaveClass('rounded-check');
    box.focus();
    await userEvent.setup().keyboard(' ');
    expect(box).toHaveAttribute('aria-checked', 'true');
  });
});

describe('PasswordInput', () => {
  it('toggles between password and text, keeping the typed value', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <>
        <label htmlFor="pw">Password</label>
        <PasswordInput id="pw" />
      </>,
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.type(input, 'NeonValkyrie99!');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('NeonValkyrie99!');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('keeps one constant name on the toggle and reports its state with aria-pressed', async () => {
    renderWithIntl(<PasswordInput aria-label="Password" />);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.setup().click(toggle);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the toggle out of the form-submit path', () => {
    renderWithIntl(<PasswordInput aria-label="Password" />);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('type', 'button');
  });

  it('names the toggle in Arabic', () => {
    renderWithIntl(<PasswordInput aria-label="كلمة المرور" />, 'ar');
    expect(screen.getByRole('button', { name: 'إظهار كلمة المرور' })).toBeInTheDocument();
  });
});

describe('PhoneInput', () => {
  it('shows the +20 country prefix and takes a national number left to right', async () => {
    const onChange = vi.fn();
    renderWithIntl(<PhoneInput aria-label="Mobile number" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Mobile number' });
    expect(screen.getByText('+20')).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('inputmode', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel-national');
    expect(input).toHaveAttribute('dir', 'ltr');
    await userEvent.setup().type(input, '01012345678');
    expect(input).toHaveValue('01012345678');
    expect(onChange).toHaveBeenCalled();
  });

  it('describes the field by its country code for screen readers', () => {
    renderWithIntl(<PhoneInput aria-label="Mobile number" />);
    const input = screen.getByRole('textbox', { name: 'Mobile number' });
    expect(input).toHaveAccessibleDescription('+20');
  });
});

describe('SearchInput', () => {
  it('is a labelled search field', () => {
    renderWithIntl(<SearchInput />);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveClass('rounded-full');
  });

  it('lets the caller supply its own label', () => {
    renderWithIntl(<SearchInput aria-label="Search hardware, games, accessories" />);
    expect(
      screen.getByRole('searchbox', { name: 'Search hardware, games, accessories' }),
    ).toBeInTheDocument();
  });

  it('labels itself in Arabic', () => {
    renderWithIntl(<SearchInput />, 'ar');
    expect(screen.getByRole('searchbox', { name: 'بحث' })).toBeInTheDocument();
  });
});
