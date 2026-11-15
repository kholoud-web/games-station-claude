import type { CategoryService } from '../category-service';
import type { OrderService } from '../order-service';
import type { PaymentService } from '../payment-service';
import type { PricingService } from '../pricing-service';
import type { ProductService } from '../product-service';
import { createMockCategoryService } from './category-service';
import type { MockConfig } from './config';
import { createMockOrderService } from './order-service';
import { createMockPaymentService } from './payment-service';
import { createMockPricingService } from './pricing-service';
import { createMockProductService } from './product-service';

export type Services = {
  products: ProductService;
  categories: CategoryService;
  pricing: PricingService;
  orders: OrderService;
  payments: PaymentService;
};

export function createMockServices(config: MockConfig): Services {
  return {
    products: createMockProductService(config),
    categories: createMockCategoryService(config),
    pricing: createMockPricingService(config),
    orders: createMockOrderService(config),
    payments: createMockPaymentService(config),
  };
}
