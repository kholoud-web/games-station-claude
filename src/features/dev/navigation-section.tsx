'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/shared/breadcrumb';
import { QuantityStepper } from '@/components/shared/quantity-stepper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppLocale } from '@/i18n/use-app-locale';

import { Example, ShowcaseSection } from './section';

export function NavigationSection() {
  const locale = useAppLocale();
  const [quantity, setQuantity] = useState(2);

  return (
    <ShowcaseSection title="Navigation and feedback">
      <Example label="Breadcrumb (the separator flips in Arabic)">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${locale}` },
            { label: 'Controllers', href: `/${locale}` },
            { label: 'Wireless controller' },
          ]}
        />
      </Example>
      <Example label="Tabs (arrow keys follow the page direction)">
        <Tabs defaultValue="specs">
          <TabsList aria-label="Product details">
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">Connectivity, battery and input details.</TabsContent>
          <TabsContent value="shipping">Delivery options and tracking.</TabsContent>
          <TabsContent value="warranty">What the warranty covers.</TabsContent>
        </Tabs>
      </Example>
      <Example label="Quantity stepper">
        <QuantityStepper value={quantity} onChange={setQuantity} label="Quantity" min={1} max={99} />
      </Example>
      <Example label="Toast">
        <Button variant="ghost" onClick={() => toast('Saved to your wishlist')}>
          Show toast
        </Button>
      </Example>
    </ShowcaseSection>
  );
}
