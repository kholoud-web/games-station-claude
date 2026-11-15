import { PRODUCTS } from '@/mocks/products';
import type { ProductService } from '../product-service';
import type { MockConfig } from './config';
import { simulate } from './latency';
import { queryProducts } from './product-query';

export function createMockProductService(config: MockConfig): ProductService {
  return {
    list: (filters) => simulate(config, () => queryProducts(PRODUCTS, filters)),
    getBySlug: (slug) => simulate(config, () => PRODUCTS.find((p) => p.slug === slug) ?? null),
  };
}
