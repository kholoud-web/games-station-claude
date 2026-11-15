import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { QuantityStepper } from '@/components/shared/quantity-stepper';

import { renderWithIntl } from '../helpers/render';

describe('QuantityStepper', () => {
  it('fires onChange(3) when increasing from 2', async () => {
    const onChange = vi.fn();
    renderWithIntl(<QuantityStepper value={2} label="Quantity" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
  });

  it('fires onChange(1) when decreasing from 2', async () => {
    const onChange = vi.fn();
    renderWithIntl(<QuantityStepper value={2} label="Quantity" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('disables decrease at the minimum (default 1) and never reports a value below it', async () => {
    const onChange = vi.fn();
    renderWithIntl(<QuantityStepper value={1} label="Quantity" onChange={onChange} />);
    const decrease = screen.getByRole('button', { name: 'Decrease quantity' });
    expect(decrease).toBeDisabled();
    await userEvent.setup().click(decrease);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables increase at the maximum (default 99) and honours a custom max', () => {
    const { unmount } = renderWithIntl(
      <QuantityStepper value={99} label="Quantity" onChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    unmount();
    renderWithIntl(<QuantityStepper value={3} max={3} label="Quantity" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });

  it('groups the controls under the given label and exposes the value as a live status', () => {
    renderWithIntl(<QuantityStepper value={2} label="Quantity" onChange={vi.fn()} />);
    const group = screen.getByRole('group', { name: 'Quantity' });
    expect(within(group).getByRole('status')).toHaveTextContent('2');
  });

  it('shows the value it is given, so the parent stays in control', () => {
    const { rerender } = renderWithIntl(
      <QuantityStepper value={2} label="Quantity" onChange={vi.fn()} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('2');
    rerender(<QuantityStepper value={5} label="Quantity" onChange={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('clamps a corrupted value (NaN, 0, 500) into range for display and for the next step', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { unmount } = renderWithIntl(
      <QuantityStepper value={Number.NaN} label="Quantity" onChange={onChange} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
    unmount();
    renderWithIntl(<QuantityStepper value={500} label="Quantity" onChange={onChange} />);
    expect(screen.getByRole('status')).toHaveTextContent('99');
  });

  it('labels the buttons in Arabic', () => {
    renderWithIntl(<QuantityStepper value={2} label="الكمية" onChange={vi.fn()} />, 'ar');
    expect(screen.getByRole('button', { name: 'زيادة الكمية' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تقليل الكمية' })).toBeInTheDocument();
  });
});
