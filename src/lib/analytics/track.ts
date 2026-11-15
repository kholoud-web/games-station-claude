import { newUuid } from '@/lib/uuid';
import { EVENT_ORIGIN, type AnalyticsAdapter, type AnalyticsInput } from './events';
import { findSensitiveKey } from './guard';

let adapter: AnalyticsAdapter | null = null;

/** Plug a provider in here later. With no adapter, tracking does nothing. */
export function setAnalyticsAdapter(next: AnalyticsAdapter | null): void {
  adapter = next;
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
      ...input,
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
