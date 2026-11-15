import type { Order } from './types';

export interface OrderService {
  /** Newest first. */
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
}
