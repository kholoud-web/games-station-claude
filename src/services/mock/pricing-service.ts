import { PRODUCTS } from '@/mocks/products';
import type { PricingService } from '../pricing-service';
import type { MockConfig } from './config';
import { simulate } from './latency';
import { priceCart } from './price-cart';

export { MOCK_FREE_SHIPPING_THRESHOLD, MOCK_SHIPPING_FEE } from './price-cart';

export function createMockPricingService(config: MockConfig): PricingService {
  return { price: (items) => simulate(config, () => priceCart(items, PRODUCTS)) };
}
