# API contracts

These are the contracts a backend must satisfy so the frontend can swap its mock services for real ones without a UI rewrite. They are the TypeScript interfaces in `src/services/` (types in `src/services/types/index.ts`). Today every interface is implemented by a mock in `src/services/mock/`, selected in one place: `src/services/index.ts`.

Nothing here is a deployed API. HTTP paths, authentication, error envelopes and versioning are **not defined yet** and are decisions for the backend phase.

## Principles the frontend already depends on

- **The server is authoritative** for prices, totals, discounts, stock, payment status and gift card balances. The browser never computes or stores them. The cart holds only `{ productId, variantId, quantity }`.
- **Money is an integer** in piasters (`{ amount: 1999, currency: 'EGP' }`). No floats.
- **Customer-facing text is bilingual** (`LocalizedString = { en, ar }`). The server returns both; the browser picks one.
- **Operations that change state are idempotent** (see `PaymentService`). The client sends an idempotency key and may replay it.
- **Failure is a rejected promise.** The UI shows an error state and a retry. No error envelope is defined yet (codes, field errors, retry hints).

## Implemented interfaces

### ProductService

```ts
list(filters: ProductFilters): Promise<Page<Product>>
getBySlug(slug: string): Promise<Product | null>
```

`ProductFilters`: `query`, `categoryId`, `brands[]`, `minPrice`, `maxPrice` (piasters), `inStockOnly`, `sort` (`newest | price_asc | price_desc | best_selling`), `cursor`, `limit`. `Page<T>` is `{ items, nextCursor, total }`: cursor pagination, not offsets.

Behavior the mock has (the frontend relies on it; a backend should match or tell us):
- `query` matches product name (English or Arabic), brand, and SKU (the product's or any variant's).
- Default sort is `best_selling`. `limit` is clamped to 1 to 48. An unrecognized cursor restarts at page one.
- `getBySlug` returns `null` for an unknown slug (not an error).

### CategoryService

```ts
list(): Promise<Category[]>
```

### PricingService

```ts
price(items: CartItem[]): Promise<PricedCart>
```

Returns `{ lines, subtotal, shipping, total }`. Each line has `unitPrice`, `lineTotal`, `available` (units in stock) and a `status`:

| status | Meaning | `unitPrice` / `lineTotal` | In subtotal |
| --- | --- | --- | --- |
| `ok` | Purchasable | both set | yes |
| `out_of_stock` | Known product, no stock | unit price set, line total `null` | no |
| `unavailable` | Unknown product or variant, or an invalid quantity | both `null` | no |

A line is never priced at zero to hide a problem. When `quantity` exceeds `available` the status is still `ok`; the cart screen must warn. The mock charges a flat EGP 75 shipping, free from EGP 2,500 and for an empty cart. **Those numbers are placeholders**, not policy (open question in [requirements.md](requirements.md)).

### OrderService

```ts
list(): Promise<Order[]>
get(id: string): Promise<Order | null>
```

`Order` carries `status` (`processing | shipped | delivered | cancelled`), `paymentState`, lines (with the unit price at purchase), `subtotal`, `shipping`, `total`, the delivery `address` and an optional `trackingNumber`. Creating, cancelling and refunding orders are not in the interface yet.

### PaymentService

```ts
createAttempt({ orderRef, idempotencyKey }): Promise<{ attemptId, state }>
getStatus(attemptId): Promise<PaymentState>
```

States and legal moves (enforced in `src/features/checkout/payment-machine.ts`):

| From | To |
| --- | --- |
| `PENDING` | `PROCESSING`, `CANCELLED`, `EXPIRED` |
| `PROCESSING` | `SUCCEEDED`, `FAILED`, `CANCELLED` |
| `SUCCEEDED` | `REFUND_PENDING` |
| `REFUND_PENDING` | `REFUNDED`, `SUCCEEDED` |
| `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED` | none (terminal) |

Rules the backend must keep:
1. `createAttempt` is idempotent per `idempotencyKey`: the same key returns the same attempt. The client replays the same key when a request drops and the outcome is unknown, and uses a new key only after a declined, cancelled or expired payment.
2. Success is confirmed server-side (verified provider webhook) and surfaced only through `getStatus`. The frontend treats a `SUCCEEDED` answer from `createAttempt` as `PROCESSING`, and a browser redirect is never proof of payment.
3. The frontend polls `getStatus` (default every 1 s, up to 30 times) and ignores a status that would move the payment backwards.
4. Card data never reaches this app. The real flow uses the provider's hosted fields or redirect.

### NewsletterService

```ts
subscribe(email: string): Promise<{ status: 'subscribed', simulated: boolean }>
```

The mock returns `simulated: true`, and the footer says "demo" while it does.

## Not defined yet

These have domain types only, or nothing, and need contracts before their screens (sub-projects 2 to 5):

| Area | Today |
| --- | --- |
| Authentication, sessions, Google and Facebook sign-in | Nothing |
| Customer profile, two phone numbers, saved address | `Customer` and `Address` types only |
| Wishlist | Nothing (the heart button saves nothing) |
| Reviews | `Review` type only |
| Gift cards: purchase, redemption, balance, partial redemption | `GiftCard` type only; full codes must never reach the browser (`codeSuffix` only) |
| Inventory: reservation, deduction, movements, alerts | Nothing; stock is a `quantity` on each variant |
| Discounts and cashback | Nothing |
| Shipping and Aramex (shipment, tracking, status) | Nothing; `trackingNumber` on `Order` only |
| Admin (products, orders, customers, payments, audit log, roles) | Nothing; authorization must be enforced by the backend, not by hiding routes |
| Analytics ingestion | Event contract only (see [data-engineering.md](data-engineering.md)) |

## Changing a contract

Change the interface and its mock together, update this file, and keep the contract tests in `tests/services/` passing. A mock that behaves differently from the real service hides bugs until integration.
