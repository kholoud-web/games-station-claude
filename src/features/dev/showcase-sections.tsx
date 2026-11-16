import type { Category, Product } from '@/services/types';

import { ButtonsSection } from './buttons-section';
import { CommerceSection } from './commerce-section';
import { FormsSection } from './forms-section';
import { NavigationSection } from './navigation-section';
import { StatusSection } from './status-section';

/**
 * Every shared component in each of its states. Data arrives as props so the page can load it
 * through the service layer and tests can pass fixtures.
 */
export function ShowcaseSections({ products, categories }: { products: Product[]; categories: Category[] }) {
  return (
    <div className="space-y-14">
      <ButtonsSection />
      <FormsSection />
      <StatusSection />
      <CommerceSection products={products} categories={categories} />
      <NavigationSection />
    </div>
  );
}
