import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Example, ShowcaseSection } from './section';

export function ButtonsSection() {
  return (
    <ShowcaseSection
      title="Buttons"
      hint="Press Tab to move through the page and see the cyan focus ring on every control."
    >
      <Example label="Primary">
        <Button>Add to cart</Button>
      </Example>
      <Example label="Ghost">
        <Button variant="ghost">View details</Button>
      </Example>
      <Example label="Icon">
        <Button variant="icon" aria-label="Save to wishlist">
          <Heart aria-hidden="true" className="size-5" />
        </Button>
      </Example>
      <Example label="Disabled">
        <Button disabled>Disabled</Button>
      </Example>
      <Example label="Loading (disabled and busy, so it cannot be submitted twice)">
        <Button loading>Loading</Button>
      </Example>
    </ShowcaseSection>
  );
}
