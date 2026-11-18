import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_EVENT_NAMES,
  consoleAnalyticsAdapter,
  normalizeSearchQuery,
  type AnalyticsEvent,
} from '@/lib/analytics/events';
import { setAnalyticsAdapter, track } from '@/lib/analytics/track';

const egp = (amount: number) => ({ amount, currency: 'EGP' as const });

function capture() {
  const sent: AnalyticsEvent[] = [];
  setAnalyticsAdapter({ send: (e) => sent.push(e) });
  return sent;
}

afterEach(() => {
  setAnalyticsAdapter(null);
  vi.restoreAllMocks();
});

describe('track', () => {
  it('sends the event with an id, an ISO timestamp and the schema version', () => {
    const sent = capture();
    track({ name: 'add_to_cart', productId: 'p-1', variantId: 'v-1', quantity: 2 });
    const event = sent[0];
    expect(event).toMatchObject({ name: 'add_to_cart', productId: 'p-1', quantity: 2, schemaVersion: 1 });
    expect(event?.eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(event?.timestamp ?? '').toISOString()).toBe(event?.timestamp);
  });

  it('gives every event its own id so consumers can drop duplicates', () => {
    const sent = capture();
    track({ name: 'product_viewed', productId: 'p-1' });
    track({ name: 'product_viewed', productId: 'p-1' });
    expect(sent[0]?.eventId).not.toBe(sent[1]?.eventId);
  });

  it('never throws, even when the adapter does', () => {
    setAnalyticsAdapter({
      send: () => {
        throw new Error('provider down');
      },
    });
    expect(() => track({ name: 'product_viewed', productId: 'p-1' })).not.toThrow();
  });

  it('does nothing without an adapter, and stops after the adapter is removed', () => {
    expect(() => track({ name: 'product_viewed', productId: 'p-1' })).not.toThrow();
    const sent = capture();
    setAnalyticsAdapter(null);
    track({ name: 'product_viewed', productId: 'p-1' });
    expect(sent).toEqual([]);
  });

  it('marks browser events as browser and financial events as simulated backend events', () => {
    const sent = capture();
    track({ name: 'search_performed', query: 'dualsense', resultCount: 3 });
    track({ name: 'payment_succeeded', orderId: 'o-1', attemptId: 'a-1', value: egp(1000) });
    expect(sent[0]).toMatchObject({ origin: 'browser', simulated: false });
    expect(sent[1]).toMatchObject({ origin: 'backend', simulated: true });
  });

  it('does not change the object it was given', () => {
    capture();
    const input = { name: 'product_viewed', productId: 'p-1' } as const;
    track(input);
    expect(input).toEqual({ name: 'product_viewed', productId: 'p-1' });
  });
});

describe('events never carry secrets', () => {
  const forbidden = [
    ['cardNumber', '4111111111111111'],
    ['cvv', '123'],
    ['password', 'hunter2'],
    ['token', 'abc'],
    ['giftCardCode', 'GS-AAAA-BBBB'],
    ['Authorization', 'Bearer x'],
  ] as const;

  it.each(forbidden)('drops an event that has a %s field', (key, value) => {
    const sent = capture();
    track({ name: 'add_to_cart', productId: 'p-1', variantId: 'v-1', quantity: 1, [key]: value } as never);
    expect(sent).toEqual([]);
  });

  it('drops an event with a secret hidden in a nested object', () => {
    const sent = capture();
    track({ name: 'product_viewed', productId: 'p-1', extra: { deep: { password: 'x' } } } as never);
    expect(sent).toEqual([]);
  });

  it('still sends the gift card id, which is not the code', () => {
    const sent = capture();
    track({ name: 'gift_card_redeemed', giftCardId: 'gc-1', value: egp(50_000) });
    expect(sent).toHaveLength(1);
  });

  it('rejects card data at compile time', () => {
    capture();
    // @ts-expect-error add_to_cart has no cardNumber field
    track({ name: 'add_to_cart', productId: 'p-1', variantId: 'v-1', quantity: 1, cardNumber: '4111' });
    // @ts-expect-error unknown event names are not allowed
    track({ name: 'card_entered' });
    expect(true).toBe(true);
  });
});

describe('event catalogue', () => {
  it('has exactly the ten events from the spec', () => {
    expect([...ANALYTICS_EVENT_NAMES].sort()).toEqual(
      [
        'add_to_cart',
        'checkout_started',
        'gift_card_redeemed',
        'inventory_updated',
        'order_created',
        'payment_failed',
        'payment_succeeded',
        'product_viewed',
        'refund_completed',
        'search_performed',
      ].sort(),
    );
  });
});

describe('normalizeSearchQuery', () => {
  it('trims, collapses whitespace and caps the length', () => {
    expect(normalizeSearchQuery('  dual   sense \n edge ')).toBe('dual sense edge');
    expect(normalizeSearchQuery('x'.repeat(300))).toHaveLength(100);
  });
});

describe('consoleAnalyticsAdapter', () => {
  it('logs the event for local development', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    setAnalyticsAdapter(consoleAnalyticsAdapter);
    track({ name: 'product_viewed', productId: 'p-1' });
    expect(debug).toHaveBeenCalledTimes(1);
    expect(String(debug.mock.calls[0]?.[0])).toContain('product_viewed');
  });
});

describe('search queries never carry card numbers', () => {
  function sentQuery(query: string) {
    const sent = capture();
    track({ name: 'search_performed', query, resultCount: 7 });
    return sent;
  }

  it.each([
    ['plain digits', '4111111111111111'],
    ['spaced groups', '4111 1111 1111 1111'],
    ['dashed groups', '4111-1111-1111-1111'],
    ['a 13-digit number', '4222222222222'],
    ['a 19-digit number', '6011000990139424123'],
  ])('replaces %s with a placeholder and still records the search', (_label, query) => {
    const sent = sentQuery(query);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ name: 'search_performed', query: '[redacted]', resultCount: 7 });
  });

  it('keeps the words around a card number', () => {
    const sent = sentQuery('ps5 4111 1111 1111 1111 controller');
    expect(sent[0]).toMatchObject({ query: 'ps5 [redacted] controller' });
  });

  it.each([
    ['a number glued to a letter', 'x4111111111111111', 'x[redacted]'],
    ['a run longer than 19 digits', '41111111111111112024', '[redacted]'],
  ])('still redacts %s', (_label, query, expected) => {
    expect(sentQuery(query)[0]).toMatchObject({ query: expected });
  });

  it('redacts every card-like number in one query', () => {
    const sent = sentQuery('4111111111111111 or 5500-0000-0000-0004');
    expect(sent[0]).toMatchObject({ query: '[redacted] or [redacted]' });
  });

  it.each(['dualsense', 'ps5 825', 'GS-CTRL-0042', '123456789012', '2024 2025', '4111 1111'])(
    'leaves %s untouched',
    (query) => {
      expect(sentQuery(query)[0]).toMatchObject({ query });
    },
  );

  it('does not change the object it was given', () => {
    capture();
    const input = { name: 'search_performed', query: '4111111111111111', resultCount: 1 } as const;
    track(input);
    expect(input.query).toBe('4111111111111111');
  });

  it('leaves other events alone', () => {
    const sent = capture();
    track({ name: 'product_viewed', productId: '4111111111111111' });
    expect(sent[0]).toMatchObject({ productId: '4111111111111111' });
  });
});
