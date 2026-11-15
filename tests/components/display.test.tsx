import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PriceTag } from '@/components/shared/price-tag';
import { RatingPill } from '@/components/shared/rating-pill';
import { StockBadge } from '@/components/shared/stock-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { money } from '@/lib/money';

import { renderWithIntl } from '../helpers/render';

describe('Badge', () => {
  it('gives each tone its own token classes', () => {
    render(
      <>
        <Badge tone="cyan">New</Badge>
        <Badge tone="warning">Few left</Badge>
        <Badge tone="error">Sold out</Badge>
        <Badge>Plain</Badge>
      </>,
    );
    expect(screen.getByText('New')).toHaveClass('text-cyan');
    expect(screen.getByText('Few left')).toHaveClass('text-warning', 'bg-warning-container');
    expect(screen.getByText('Sold out')).toHaveClass(
      'bg-error-container',
      'text-on-error-container',
    );
    expect(screen.getByText('Plain')).toHaveClass('text-muted');
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech and stops pulsing under reduced motion', () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('animate-pulse', 'motion-reduce:animate-none', 'h-4', 'w-24');
  });
});

describe('StockBadge', () => {
  it('shows in stock with the cyan treatment', () => {
    renderWithIntl(<StockBadge stock="in_stock" />);
    expect(screen.getByText('In stock')).toHaveClass('text-cyan');
  });

  it('shows low stock with the warning token', () => {
    renderWithIntl(<StockBadge stock="low_stock" />);
    expect(screen.getByText('Low stock')).toHaveClass(
      'text-warning',
      'bg-warning-container',
      'border-warning-border',
    );
  });

  it('shows out of stock with the error tokens, not amber', () => {
    renderWithIntl(<StockBadge stock="out_of_stock" />);
    const badge = screen.getByText('Out of stock');
    expect(badge).toHaveClass('bg-error-container', 'text-on-error-container');
    expect(badge).not.toHaveClass('text-warning');
  });

  it('is translated into Arabic', () => {
    renderWithIntl(<StockBadge stock="out_of_stock" />, 'ar');
    expect(screen.getByText('غير متوفر')).toBeInTheDocument();
  });
});

describe('PriceTag', () => {
  it('shows the price in EGP', () => {
    renderWithIntl(<PriceTag price={money(199999)} />);
    expect(screen.getByText(/1,999\.99/)).toBeInTheDocument();
    expect(screen.getByText(/EGP/)).toBeInTheDocument();
  });

  it('keeps Western digits in Arabic', () => {
    renderWithIntl(<PriceTag price={money(199999)} />, 'ar');
    expect(screen.getByText(/1,999\.99/)).toBeInTheDocument();
  });

  it('shows a struck-through previous price with a spoken label when it is higher', () => {
    renderWithIntl(<PriceTag price={money(159999)} compareAt={money(199999)} />);
    const old = screen.getByText(/1,999\.99/);
    expect(old.closest('s')).not.toBeNull();
    expect(screen.getByText('Was')).toHaveClass('sr-only');
    expect(screen.getByText(/1,599\.99/)).toBeInTheDocument();
  });

  it('ignores a compare-at price that is not higher than the price', () => {
    renderWithIntl(<PriceTag price={money(199999)} compareAt={money(199999)} />);
    expect(screen.queryByText('Was')).not.toBeInTheDocument();
  });

  it('handles a free (0) price', () => {
    renderWithIntl(<PriceTag price={money(0)} />);
    expect(screen.getByText(/0\.00/)).toBeInTheDocument();
  });
});

describe('RatingPill', () => {
  it('shows the rating and count and speaks them as one sentence', () => {
    renderWithIntl(<RatingPill rating={4.5} count={1204} />);
    const pill = screen.getByRole('img', { name: 'Rated 4.5 out of 5 from 1,204 reviews' });
    expect(pill).toHaveTextContent('4.5');
    expect(pill).toHaveTextContent('(1,204)');
  });

  it('uses the singular for one review', () => {
    renderWithIntl(<RatingPill rating={5} count={1} />);
    expect(
      screen.getByRole('img', { name: 'Rated 5.0 out of 5 from 1 review' }),
    ).toBeInTheDocument();
  });

  it('says there are no reviews yet instead of showing a rating of zero', () => {
    renderWithIntl(<RatingPill rating={0} count={0} />);
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('clamps an out-of-range or invalid rating to 0 to 5', () => {
    const { unmount } = renderWithIntl(<RatingPill rating={7} count={3} />);
    expect(screen.getByRole('img')).toHaveTextContent('5.0');
    unmount();
    renderWithIntl(<RatingPill rating={Number.NaN} count={3} />);
    expect(screen.getByRole('img')).toHaveTextContent('0.0');
  });

  it('uses the Arabic dual form for two reviews, with Western digits', () => {
    renderWithIntl(<RatingPill rating={4} count={2} />, 'ar');
    expect(screen.getByRole('img', { name: /تقييمان/ })).toHaveTextContent('4.0');
  });
});
