import { addMoney, money, multiplyMoney } from '@/lib/money';
import type { PricedCart, PricedLine } from '../pricing-service';
import type { CartItem, Product } from '../types';

/** MOCK business rules: the real shipping fee and free-shipping threshold are still undecided. */
export const MOCK_SHIPPING_FEE = 7_500; // EGP 75
export const MOCK_FREE_SHIPPING_THRESHOLD = 250_000; // EGP 2,500

function priceLine(item: CartItem, products: Map<string, Product>): PricedLine {
  const product = products.get(item.productId);
  const variant = product?.variants.find((v) => v.id === item.variantId);
  const validQuantity = Number.isSafeInteger(item.quantity) && item.quantity >= 1;
  if (!product || !variant || !validQuantity) {
    return { item, unitPrice: null, lineTotal: null, status: 'unavailable', available: 0 };
  }
  const unitPrice = variant.price ?? product.price;
  if (variant.quantity <= 0) {
    return { item, unitPrice, lineTotal: null, status: 'out_of_stock', available: 0 };
  }
  return { item, unitPrice, lineTotal: multiplyMoney(unitPrice, item.quantity), status: 'ok', available: variant.quantity };
}

export function priceCart(items: CartItem[], catalog: Product[]): PricedCart {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const lines = items.map((item) => priceLine(item, byId));
  const subtotal = lines.reduce((sum, line) => (line.lineTotal ? addMoney(sum, line.lineTotal) : sum), money(0));
  const free = subtotal.amount === 0 || subtotal.amount >= MOCK_FREE_SHIPPING_THRESHOLD;
  const shipping = money(free ? 0 : MOCK_SHIPPING_FEE);
  return { lines, subtotal, shipping, total: addMoney(subtotal, shipping) };
}
