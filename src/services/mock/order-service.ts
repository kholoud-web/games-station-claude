import { ORDERS } from '@/mocks/orders';
import type { OrderService } from '../order-service';
import type { MockConfig } from './config';
import { simulate } from './latency';

export function createMockOrderService(config: MockConfig): OrderService {
  return {
    list: () => simulate(config, () => [...ORDERS].sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1))),
    get: (id) => simulate(config, () => ORDERS.find((o) => o.id === id) ?? null),
  };
}
