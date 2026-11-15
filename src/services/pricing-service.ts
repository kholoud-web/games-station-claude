import type { CartItem, Money } from './types';

export type PricedLineStatus = 'ok' | 'unavailable' | 'out_of_stock';

export type PricedLine = {
  item: CartItem;
  unitPrice: Money | null;
  lineTotal: Money | null;
  status: PricedLineStatus;
  /** Units in stock, so the UI can warn when the cart asks for more. 0 when unavailable. */
  available: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
};

/** The server is the only source of prices and totals. The cart stores ids and quantities only. */
export interface PricingService {
  price(items: CartItem[]): Promise<PricedCart>;
}
