import type { Money } from '@/services/types';

/** Reasons a payment ended without success. Never the provider's raw message. */
export type PaymentFailureReason = 'declined' | 'network' | 'expired' | 'cancelled';

/**
 * Versioned event contracts. Payloads hold ids and counts only: no card data, passwords,
 * tokens, gift card codes or contact details.
 */
type Payloads = {
  product_viewed: { productId: string; categoryId?: string };
  search_performed: { query: string; resultCount: number };
  add_to_cart: { productId: string; variantId: string; quantity: number };
  checkout_started: { itemCount: number; value: Money };
  order_created: { orderId: string; itemCount: number; value: Money };
  payment_succeeded: { orderId: string; attemptId: string; value: Money };
  payment_failed: { orderId: string; attemptId: string; reason: PaymentFailureReason };
  refund_completed: { orderId: string; value: Money };
  inventory_updated: { productId: string; variantId: string; quantityAfter: number };
  gift_card_redeemed: { giftCardId: string; value: Money };
};

export type AnalyticsEventName = keyof Payloads;

/** What callers pass to `track`: one variant per event name. */
export type AnalyticsInput = { [N in AnalyticsEventName]: { name: N } & Payloads[N] }[AnalyticsEventName];

export type AnalyticsEnvelope = {
  eventId: string;
  timestamp: string;
  schemaVersion: 1;
  origin: 'browser' | 'backend';
  /** True while a backend-origin event is produced by the frontend mock. */
  simulated: boolean;
};

export type AnalyticsEvent = AnalyticsInput & AnalyticsEnvelope;

/**
 * Browser events measure behavior. Financial and stock events are authoritative backend facts;
 * the browser only simulates them in this phase, and reporting must never be built on them.
 */
export const EVENT_ORIGIN = {
  product_viewed: 'browser',
  search_performed: 'browser',
  add_to_cart: 'browser',
  checkout_started: 'browser',
  order_created: 'backend',
  payment_succeeded: 'backend',
  payment_failed: 'backend',
  refund_completed: 'backend',
  inventory_updated: 'backend',
  gift_card_redeemed: 'backend',
} as const satisfies Record<AnalyticsEventName, 'browser' | 'backend'>;

export const ANALYTICS_EVENT_NAMES = Object.keys(EVENT_ORIGIN) as AnalyticsEventName[];

export type AnalyticsAdapter = { send(event: AnalyticsEvent): void };

/** For local development: prints every event. */
export const consoleAnalyticsAdapter: AnalyticsAdapter = {
  send: (event) => console.debug(`[analytics] ${event.name}`, event),
};

/** Search text can contain anything a person types, so keep it short and tidy before tracking it. */
export function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, ' ').trim().slice(0, 100);
}
