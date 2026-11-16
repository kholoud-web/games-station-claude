import { render, screen, within } from '@testing-library/react';
import { CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { Breadcrumb } from '@/components/shared/breadcrumb';
import { CategoryTile } from '@/components/shared/category-tile';
import { ProductCardSkeleton } from '@/components/shared/product-card-skeleton';
import { TrustBar } from '@/components/shared/trust-bar';

import { makeCategory } from '../helpers/fixtures';
import { renderWithIntl } from '../helpers/render';

const trail = [
  { label: 'Home', href: '/en' },
  { label: 'Controllers', href: '/en/products?category=controllers-input' },
  { label: 'DualSense Edge' },
];

describe('Breadcrumb', () => {
  it('is a navigation landmark with an ordered list of the trail', () => {
    renderWithIntl(<Breadcrumb items={trail} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
  });

  it('links the earlier steps and marks the last one as the current page', () => {
    renderWithIntl(<Breadcrumb items={trail} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en');
    const current = screen.getByText('DualSense Edge');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'DualSense Edge' })).not.toBeInTheDocument();
  });

  it('does not link the last step even when it is given an href', () => {
    renderWithIntl(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/en' },
          { label: 'Here', href: '/en/here' },
        ]}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Here' })).not.toBeInTheDocument();
    expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page');
  });

  it('hides its separators from assistive tech and flips them in right-to-left', () => {
    const { container } = renderWithIntl(<Breadcrumb items={trail} />);
    const separators = container.querySelectorAll('svg');
    expect(separators).toHaveLength(2);
    separators.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveClass('rtl:rotate-180');
    });
  });

  it('shows no separator for a single step', () => {
    const { container } = renderWithIntl(<Breadcrumb items={[{ label: 'Home' }]} />);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
  });

  it('is labelled in Arabic', () => {
    renderWithIntl(<Breadcrumb items={trail} />, 'ar');
    expect(screen.getByRole('navigation', { name: 'مسار التنقل' })).toBeInTheDocument();
  });
});

describe('TrustBar', () => {
  const items = [
    { icon: ShieldCheck, title: 'Official warranty', description: '1 year, Egypt-wide' },
    { icon: Truck, title: 'Fast delivery', description: '2 to 4 working days' },
    { icon: CreditCard, title: 'Secure payment', description: 'Card details never touch our site' },
  ];

  it('lists every item with its title and description', () => {
    render(<TrustBar items={items} />);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Fast delivery')).toBeInTheDocument();
    expect(screen.getByText('2 to 4 working days')).toBeInTheDocument();
  });

  it('hides the decorative icons from assistive tech', () => {
    const { container } = render(<TrustBar items={items} />);
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(3);
    icons.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<TrustBar items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('CategoryTile', () => {
  it('links to the catalog filtered by the category, named in the current locale', () => {
    render(<CategoryTile category={makeCategory()} locale="en" />);
    expect(screen.getByRole('link', { name: 'Controllers & Input' })).toHaveAttribute(
      'href',
      '/en/products?category=controllers-input',
    );
  });

  it('uses the Arabic name and path in Arabic', () => {
    render(<CategoryTile category={makeCategory()} locale="ar" />);
    expect(screen.getByRole('link', { name: 'أجهزة التحكم والإدخال' })).toHaveAttribute(
      'href',
      '/ar/products?category=controllers-input',
    );
  });

  it('accepts an explicit href and keeps the image decorative', () => {
    const { container } = render(
      <CategoryTile category={makeCategory()} locale="en" href="/en/custom" />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/custom');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('ProductCardSkeleton', () => {
  it('is hidden from assistive tech and has nothing to tab to', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('matches the product card shell so the grid does not shift when data arrives', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstElementChild).toHaveClass('rounded-card', 'border', 'bg-card');
  });
});
