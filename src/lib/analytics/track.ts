import { newUuid } from '@/lib/uuid';
import { EVENT_ORIGIN, type AnalyticsAdapter, type AnalyticsInput } from './events';
import { findSensitiveKey, redactCardLikeNumbers } from './guard';

let adapter: AnalyticsAdapter | null = null;

/** Plug a provider in here later. With no adapter, tracking does nothing. */
export function setAnalyticsAdapter(next: AnalyticsAdapter | null): void {
  adapter = next;
}

/** Search text is typed by people, so it is the one free-text field: card numbers are removed from it. */
function scrubFreeText(input: AnalyticsInput): AnalyticsInput {
  return input.name === 'search_performed' ? { ...input, query: redactCardLikeNumbers(input.query) } : input;
}

/**
 * Records one event. It never throws and never blocks: a broken provider or a blocked
 * request must not break browsing or checkout. Events that carry a secret-looking field are dropped.
 */
export function track(input: AnalyticsInput): void {
  try {
    if (!adapter) return;
    const sensitive = findSensitiveKey(input);
    if (sensitive !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[analytics] dropped ${input.name}: field "${sensitive}" must never be tracked`);
      }
      return;
    }
    const origin = EVENT_ORIGIN[input.name];
    adapter.send({
      ...scrubFreeText(input),
      eventId: newUuid(),
      timestamp: new Date().toISOString(),
      schemaVersion: 1,
      origin,
      simulated: origin === 'backend',
    });
  } catch {
    // Analytics is optional; swallow every failure.
  }
}
