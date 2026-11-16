import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ShowcaseSections } from '@/features/dev/showcase-sections';
import ar from '@/messages/ar.json';

import { makeCategory, makeProduct } from '../helpers/fixtures';
import { renderWithIntl } from '../helpers/render';

const products = [
  makeProduct(),
  makeProduct({ id: 'p-2', slug: 'second', name: { en: 'Second Product', ar: 'منتج ثان' } }),
];
const categories = [makeCategory()];

function renderShowcase(locale: 'en' | 'ar' = 'en') {
  return renderWithIntl(<ShowcaseSections products={products} categories={categories} />, locale);
}

describe('ShowcaseSections', () => {
  it('has one labelled section per group of components', () => {
    renderShowcase();
    for (const name of [
      'Buttons',
      'Form fields',
      'Status, price and rating',
      'Product cards and tiles',
      'Navigation and feedback',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('shows disabled and loading buttons next to the normal ones', () => {
    renderShowcase();
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    const loading = screen.getByRole('button', { name: 'Loading' });
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute('aria-busy', 'true');
  });

  it('shows a field in its error state with the message tied to it', () => {
    renderShowcase();
    const field = screen.getByRole('textbox', { name: 'Email with an error' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const message = screen.getByText('Enter a valid email address');
    expect(field).toHaveAttribute('aria-describedby', message.id);
    expect(screen.getByRole('textbox', { name: 'Disabled field' })).toBeDisabled();
  });

  it('shows all three stock states', () => {
    renderShowcase();
    const status = screen.getByRole('region', { name: 'Status, price and rating' });
    for (const text of ['In stock', 'Low stock', 'Out of stock']) {
      expect(within(status).getByText(text)).toBeInTheDocument();
    }
  });

  it('shows a loading skeleton and a sold-out card whose Add button is disabled', () => {
    renderShowcase();
    expect(screen.getByRole('status', { name: 'Loading example' })).toHaveAttribute('aria-busy', 'true');
    const soldOut = screen.getByRole('group', { name: 'Sold out example' });
    expect(within(soldOut).getByRole('button', { name: /^Add / })).toBeDisabled();
  });

  it('renders in Arabic with the Arabic names and labels', () => {
    renderShowcase('ar');
    expect(screen.getAllByText('يد تحكم تجريبية').length).toBeGreaterThan(0);
    expect(screen.getAllByText(ar.stock.out_of_stock).length).toBeGreaterThan(0);
  });
});
