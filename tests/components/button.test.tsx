import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders the primary variant as a pill with the cyan fill, glow and a visible focus ring', () => {
    render(<Button variant="primary">Add to cart</Button>);
    const button = screen.getByRole('button', { name: 'Add to cart' });
    expect(button).toHaveClass('rounded-full', 'bg-cyan', 'text-on-cyan', 'shadow-cta-glow');
    expect(button.className).toMatch(/focus-visible:ring-2/);
  });

  it('defaults to primary and to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('bg-cyan');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('lets a submit button opt in to submitting', () => {
    render(<Button type="submit">Pay</Button>);
    expect(screen.getByRole('button', { name: 'Pay' })).toHaveAttribute('type', 'submit');
  });

  it('renders the ghost variant without the cyan fill', () => {
    render(<Button variant="ghost">Cancel</Button>);
    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).not.toHaveClass('bg-cyan');
    expect(button).toHaveClass('border');
  });

  it('renders the icon variant as a 44px square target', () => {
    render(
      <Button variant="icon" aria-label="Wishlist">
        <svg aria-hidden="true" />
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Wishlist' })).toHaveClass('size-11');
  });

  it('ignores clicks and announces busy while loading, so a double click cannot submit twice', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Pay now
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Pay now' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when enabled and not when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('can render as a link with the same styling', () => {
    render(
      <Button asChild>
        <a href="#products">Shop now</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Shop now' });
    expect(link).toHaveAttribute('href', '#products');
    expect(link).toHaveClass('rounded-full', 'bg-cyan');
  });
});
