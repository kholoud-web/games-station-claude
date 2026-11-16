import { Badge } from '@/components/ui/badge';
import { PriceTag } from '@/components/shared/price-tag';
import { RatingPill } from '@/components/shared/rating-pill';
import { StockBadge } from '@/components/shared/stock-badge';
import { money } from '@/lib/money';

import { Example, ShowcaseSection } from './section';

export function StatusSection() {
  return (
    <ShowcaseSection title="Status, price and rating">
      <Example label="Badge tones">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="cyan">Cyan</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="error">Error</Badge>
        </div>
      </Example>
      <Example label="Stock states (low stock uses the amber warning token)">
        <div className="flex flex-wrap gap-2">
          <StockBadge stock="in_stock" />
          <StockBadge stock="low_stock" />
          <StockBadge stock="out_of_stock" />
        </div>
      </Example>
      <Example label="Price, and price with a previous price">
        <div className="space-y-3">
          <PriceTag price={money(329900)} />
          <PriceTag price={money(329900)} compareAt={money(399900)} />
        </div>
      </Example>
      <Example label="Rating, and no reviews yet">
        <div className="space-y-3">
          <RatingPill rating={4.5} count={120} />
          <RatingPill rating={0} count={0} />
        </div>
      </Example>
    </ShowcaseSection>
  );
}
