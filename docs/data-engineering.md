# Data engineering and analytics readiness

This phase builds the **contracts and tracking points**, not a pipeline. There is no analytics provider, event collector, warehouse or report. Everything below describes what the frontend emits and what the data team must supply.

## Data model

All shared types live in `src/services/types/index.ts` and double as the schema a backend and warehouse should model: `Product`, `Variant`, `Category`, `Money`, `CartItem`, `Customer`, `Address`, `Order`, `OrderLine`, `Review`, `GiftCard`, `PaymentState`. Conventions worth carrying into a database:

- Money is an integer in piasters with an explicit currency.
- Bilingual text is `{ en, ar }`, not two columns invented later.
- Stock is a `quantity` per variant (SKU-level). Reservation, deduction and movement history are not modeled yet.
- An `OrderLine` stores the unit price **at purchase**, so reports do not depend on the current catalog price.
- A gift card exposes only `codeSuffix`; full codes stay server-side.

## Event contract

`src/lib/analytics/events.ts` defines a typed union. `track()` is the only entry point; it fills the envelope, never throws, and sends to an adapter set with `setAnalyticsAdapter()`. No adapter is set, so with none `track()` does nothing; in development it only warns when it drops an event for carrying a secret-looking field.

Envelope on every event: `eventId` (UUID), `timestamp` (ISO 8601), `schemaVersion` (1), `origin` (`browser` or `backend`), `simulated` (true while the frontend mock produces a backend-origin event).

| Event | Origin | Emitted today |
| --- | --- | --- |
| `product_viewed` | browser | Contract only; product page not built |
| `search_performed` | browser | Contract only; search page not built. `track()` replaces card-like numbers in `query` with `[redacted]` before the event reaches a provider |
| `add_to_cart` | browser | Yes, from the product card |
| `checkout_started` | browser | Contract only; checkout not built |
| `order_created` | backend | Contract only |
| `payment_succeeded` | backend | Contract only |
| `payment_failed` | backend | Contract only |
| `refund_completed` | backend | Contract only |
| `inventory_updated` | backend | Contract only |
| `gift_card_redeemed` | backend | Contract only |

Rules baked into the code:
- **Browser events measure behavior; they are not financial records.** Sales, revenue, refunds, stock and gift card balances must come from backend events or the order database, never from browser events. Any backend-origin event the frontend emits is marked `simulated` and must not be reported on.
- **Consumers must tolerate duplicates** (retries, double fires). De-duplicate on `eventId`.
- **No secrets or unnecessary personal data.** The event types have no field for card data, passwords or tokens, and `track()` drops an event that contains a secret-looking field at any depth. Cost: a legitimate field named `code` would also be dropped (outside development, silently).
- **Analytics must never break checkout.** Adapter errors are swallowed.

## What the Master Prompt asks for, and where it stands

| Report | Needs | Status |
| --- | --- | --- |
| Sales, revenue, order counts, average order value | Backend order and payment records | Not built |
| Best-selling products and categories | Orders joined to catalog | `salesRank` exists on mock products only |
| Product views, search activity | `product_viewed`, `search_performed` plus a collector | Events defined, not emitted |
| Abandoned checkout | `checkout_started` without `payment_succeeded` | Events defined; needs a collector and a session or customer key |
| Stock levels, low-stock alerts | Inventory records | Not built |
| Payment success and failure rates | Backend payment events | Not built |

## Decisions the data team needs to make

1. Collector and provider (self-hosted, a CDP, or a warehouse stream) and how `setAnalyticsAdapter` reaches it.
2. How to identify an anonymous visitor and link them to a customer after sign-in, and what consent Egyptian and applicable privacy rules require before tracking.
3. Event versioning: `schemaVersion` is 1; define how it is bumped and how old versions are read.
4. The system of record for money (the order and payment database), with analytics as a derived copy.
