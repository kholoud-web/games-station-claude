import type { Category, Product } from '@/services/types';

/** A self-contained product, so UI tests do not depend on the mock seed data. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-test',
    slug: 'test-controller',
    sku: 'GS-TEST-001',
    brand: 'Sony',
    name: { en: 'Test Controller', ar: 'يد تحكم تجريبية' },
    description: { en: 'A controller for tests.', ar: 'يد تحكم للاختبار.' },
    categoryId: 'controllers-input',
    price: { amount: 329900, currency: 'EGP' },
    rating: 4.5,
    reviewCount: 120,
    images: ['/products/controllers-input.svg'],
    variants: [
      { id: 'v-1', sku: 'GS-TEST-001-A', label: { en: 'Black', ar: 'أسود' }, quantity: 10 },
      { id: 'v-2', sku: 'GS-TEST-001-B', label: { en: 'White', ar: 'أبيض' }, quantity: 10 },
    ],
    createdAt: '2026-01-01',
    salesRank: 1,
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'controllers-input',
    slug: 'controllers-input',
    name: { en: 'Controllers & Input', ar: 'أجهزة التحكم والإدخال' },
    image: '/products/controllers-input.svg',
    ...overrides,
  };
}
