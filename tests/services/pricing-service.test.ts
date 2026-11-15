import { describe, expect, it } from 'vitest';
import { money } from '@/lib/money';
import { MOCK_FREE_SHIPPING_THRESHOLD, MOCK_SHIPPING_FEE } from '@/services/mock/pricing-service';
import { createMockServices } from '@/services/mock';

const { pricing, products } = createMockServices({ latencyMs: 0, failureRate: 0 });

async function firstVariant(slug: string) {
  const product = await products.getBySlug(slug);
  if (!product) throw new Error(`missing seed product ${slug}`);
  const variant = product.variants[0];
  if (!variant) throw new Error(`seed product ${slug} has no variant`);
  return { product, variant };
}

describe('PricingService.price', () => {
  it('prices a valid line at unit price times quantity', async () => {
    const { product, variant } = await firstVariant('dualsense-charging-station');
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity: 2 }]);
    const line = cart.lines[0];
    expect(line?.status).toBe('ok');
    expect(line?.unitPrice).toEqual(product.price);
    expect(line?.lineTotal).toEqual(money(product.price.amount * 2));
    expect(cart.subtotal).toEqual(money(product.price.amount * 2));
  });

  it('flags a deleted product as unavailable and leaves it out of the totals', async () => {
    const { product, variant } = await firstVariant('dualsense-charging-station');
    const cart = await pricing.price([
      { productId: 'gone', variantId: 'gone-1', quantity: 1 },
      { productId: product.id, variantId: variant.id, quantity: 1 },
    ]);
    const gone = cart.lines[0];
    expect(gone?.status).toBe('unavailable');
    expect(gone?.unitPrice).toBeNull();
    expect(gone?.lineTotal).toBeNull();
    expect(cart.subtotal).toEqual(product.price);
  });

  it('flags an unknown variant of a real product as unavailable', async () => {
    const { product } = await firstVariant('dualsense-charging-station');
    const cart = await pricing.price([{ productId: product.id, variantId: 'nope', quantity: 1 }]);
    expect(cart.lines[0]?.status).toBe('unavailable');
    expect(cart.subtotal).toEqual(money(0));
  });

  it('flags an out-of-stock variant and leaves it out of the totals', async () => {
    const { product, variant } = await firstVariant('playstation-5-digital');
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity: 1 }]);
    const line = cart.lines[0];
    expect(line?.status).toBe('out_of_stock');
    expect(line?.lineTotal).toBeNull();
    expect(line?.available).toBe(0);
    expect(cart.subtotal).toEqual(money(0));
  });

  it('reports how many units are available when the cart asks for more', async () => {
    const { product, variant } = await firstVariant('playstation-5-slim-disc');
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity: 99 }]);
    expect(cart.lines[0]?.available).toBe(variant.quantity);
    expect(cart.lines[0]?.available).toBeLessThan(99);
  });

  it('charges the flat mock shipping fee below the free-shipping threshold', async () => {
    const { product, variant } = await firstVariant('dualsense-charging-station');
    expect(product.price.amount).toBeLessThan(MOCK_FREE_SHIPPING_THRESHOLD);
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity: 1 }]);
    expect(cart.shipping).toEqual(money(MOCK_SHIPPING_FEE));
    expect(cart.total).toEqual(money(product.price.amount + MOCK_SHIPPING_FEE));
  });

  it('ships free at or above the threshold', async () => {
    const { product, variant } = await firstVariant('playstation-5-slim-disc');
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity: 1 }]);
    expect(cart.shipping).toEqual(money(0));
    expect(cart.total).toEqual(cart.subtotal);
  });

  it('charges no shipping for an empty cart', async () => {
    const cart = await pricing.price([]);
    expect(cart.lines).toEqual([]);
    expect(cart.total).toEqual(money(0));
  });
});

describe('PricingService.price with corrupt quantities', () => {
  it.each([0, -2, 1.5, Number.NaN])('treats quantity %s as unavailable instead of throwing', async (quantity) => {
    const { product, variant } = await firstVariant('dualsense-charging-station');
    const cart = await pricing.price([{ productId: product.id, variantId: variant.id, quantity }]);
    expect(cart.lines[0]?.status).toBe('unavailable');
    expect(cart.lines[0]?.lineTotal).toBeNull();
    expect(cart.subtotal).toEqual(money(0));
  });
});
