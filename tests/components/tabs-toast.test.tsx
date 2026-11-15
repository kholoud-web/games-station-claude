import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';

import { renderWithIntl } from '../helpers/render';

function Demo() {
  return (
    <Tabs defaultValue="specs">
      <TabsList aria-label="Product details">
        <TabsTrigger value="specs">Specs</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="support">Support</TabsTrigger>
      </TabsList>
      <TabsContent value="specs">Spec table</TabsContent>
      <TabsContent value="reviews">Review list</TabsContent>
      <TabsContent value="support">Support info</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the selected panel and switches on click', async () => {
    renderWithIntl(<Demo />);
    expect(screen.getByRole('tab', { name: 'Specs' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Spec table')).toBeVisible();
    expect(screen.queryByText('Review list')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(screen.getByText('Review list')).toBeVisible();
  });

  it('moves with ArrowRight in English', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Demo />, 'en');
    await user.click(screen.getByRole('tab', { name: 'Specs' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Specs' })).toHaveFocus();
  });

  it('moves with ArrowLeft in Arabic, because the next tab is on the left', async () => {
    const user = userEvent.setup();
    renderWithIntl(<Demo />, 'ar');
    await user.click(screen.getByRole('tab', { name: 'Specs' }));
    // With three tabs, "next" (Reviews) is distinguishable from "wrapped to the last" (Support).
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Specs' })).toHaveFocus();
  });
});

describe('Toaster', () => {
  it('shows a toast message', async () => {
    renderWithIntl(<Toaster />);
    toast('Added to cart');
    expect(await screen.findByText('Added to cart')).toBeInTheDocument();
  });
});
