import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ComingSoon } from '@/components/shared/coming-soon';

import { renderWithIntl } from '../helpers/render';

describe('ComingSoon', () => {
  it('shows the page title as the single h1 and a way back home', () => {
    renderWithIntl(<ComingSoon page="warranty" />, 'en');

    expect(screen.getByRole('heading', { level: 1, name: 'Warranty policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
  });

  it('is available in Arabic with Arabic home link', () => {
    renderWithIntl(<ComingSoon page="repairs" />, 'ar');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('إصلاح الأجهزة');
    expect(screen.getByRole('link', { name: 'العودة إلى الرئيسية' })).toHaveAttribute('href', '/ar');
  });

  it('says the page is not built yet, in plain words, without claiming real content', () => {
    renderWithIntl(<ComingSoon page="diagnostics" />, 'en');
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
