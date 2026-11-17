# Architecture decisions

Each entry records what was decided, why, and what it costs, so a later developer can change it knowingly.

## 1. One Next.js app, modular inside

One App Router app with feature and responsibility folders. No Turborepo, no separate admin app, no microservices. Admin lives in the same app under `/[locale]/admin` and can be extracted later because features do not import each other (they import only `components/`, `lib/` and `services/`).

## 2. Locale in the URL

`/en/...` and `/ar/...` via `next-intl`. The server sets `<html lang dir>`. Pages are static where possible, so a CDN can cache each language. An unknown locale such as `/fr` ends in a 404 (it redirects once to `/en/fr`, which is not a page).
Cost: every route sits under `[locale]`, and message files are required from the start.

## 3. Services are the only door to data

UI code never imports from `mocks/`. Components call TanStack Query hooks, hooks call `services` (`src/services/index.ts`), and `services` currently returns mock implementations. Replacing a mock with an HTTP client is a change in that one file plus the implementation. The interfaces are documented in [api-contracts.md](api-contracts.md).

## 4. Server state in Query, client state in Zustand

- TanStack Query owns anything that comes from a service (products, prices, orders). Stale times: catalog 5 minutes, cart and orders 15 seconds.
- Zustand owns only the guest cart (product id, variant id, quantity) and transient UI state. The cart store never holds a price; totals are always recomputed by the pricing service, so a stale price cannot be shown as fact.
- `localStorage` holds only the guest cart and UI preferences. It is never a source of truth for orders, payments or stock. The cart store reads it after mount (`skipHydration`) so the first server and client paint match, and a corrupted value yields an empty cart instead of an error.

## 5. Money is an integer

`Money = { amount, currency: 'EGP' }` with `amount` in piasters. `money()` rejects non-integers, negatives and non-finite numbers; additions and multiplications throw when they leave the safe integer range. Formatting happens only at display time with `Intl.NumberFormat`.

## 6. Payment is a server-confirmed state machine

States: `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUND_PENDING`, `REFUNDED`. The allowed moves are a table in `src/features/checkout/payment-machine.ts`. A browser redirect or the response to "create attempt" never means success: the hook downgrades a `SUCCEEDED` answer from `createAttempt` to `PROCESSING`, and only `getStatus` can confirm it. Double submits are blocked by a ref lock plus an idempotency key. A dropped request replays the same key (the outcome is unknown); a declined, cancelled or expired payment gets a new key. No card data ever enters the app: the future flow uses the provider's hosted fields or redirect.

## 7. Static Content-Security-Policy, not a nonce

A per-request nonce would force every page to render on demand, giving up static pages and CDN caching. The policy is static instead. Cost: scripts and styles allow `'unsafe-inline'` (Next.js writes inline bootstrap scripts), so the CSP restricts origins, framing, plugins and eval, but is a weaker XSS backstop than a nonce policy. Revisit if the business accepts dynamic rendering. Payment and video origins must be added to the policy when those integrations exist.

## 8. Zod runs without eval

Zod 4 probes `new Function("")` at startup. Under a CSP without `'unsafe-eval'` the probe throws (and is caught) but the browser still reports a violation on every page. `src/lib/zod.ts` sets `jitless` once, and it is the only module allowed to import `zod` (enforced by a test). Cost: Zod uses its interpreter, which is slower only for very large objects.

## 9. Fonts

Geist and IBM Plex Sans Arabic are self-hosted (the build sandbox cannot reach Google Fonts). `preload` is off because one layout serves both locales and preloading fetched both families on every page; each page now downloads only the files its text uses. Cost: fonts are discovered later than with preload. Revisit with real Lighthouse data once real pages exist.

## 10. RTL by construction

Components use logical utilities only (`ms-`, `pe-`, `text-start`, `start-0`). `pnpm check:rtl` fails the build on `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, border and rounding side variants. Directional icons carry `rtl:rotate-180`. Radix primitives that default to LTR (Tabs, Toaster) receive their direction from the locale.

## 11. Header collapses below 1024px

The full header (logo, five links, search, four actions) needs about 1,290px, so the planned 768px collapse point overflowed the screen. It now collapses below `lg` (1024px); tablets get the compact header with the menu button.
