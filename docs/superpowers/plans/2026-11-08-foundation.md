# Games Station Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Games Station frontend Foundation: tooling, design tokens, Arabic/English with RTL, layout shell, first component set, and a typed mock data layer with cart, payment-state and analytics logic.

**Architecture:** One Next.js App Router app with the locale in the URL (`next-intl`). UI reads data only through TanStack Query hooks that call typed service interfaces; mock implementations sit behind `services/index.ts`. Zustand holds only the guest cart and UI state. Server state is never duplicated in client stores.

**Tech Stack:** Next.js (App Router), strict TypeScript, pnpm, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, `next-intl`, Zod, React Hook Form, Vitest + Testing Library, ESLint (`jsx-a11y`), Prettier. Current docs for each are checked (Context7) before it is installed; versions are pinned in `package.json`.

**Spec:** `docs/superpowers/specs/2026-11-08-foundation-design.md`

## Global Constraints

- Project root is `/home/claude/games-station`. Package manager is pnpm. Install a dependency only when a task needs it.
- TypeScript `strict` and `noUncheckedIndexedAccess` on. No `any` without a comment explaining why.
- Components target 50 to 100 lines; split anything over 100. Page files only compose components.
- Feature folders import only from `components/`, `lib/`, `services/`, never from each other.
- UI never imports from `mocks/`; only `services/` does.
- Tokens: canvas `#050D19`, secondary `#0A1728`, card `#0D1D32`, elevated `#122640`, border `#1D3550`, cyan `#47D6FF`, cobalt `#168BFF`, violet `#825BFF`, text `#F5F8FF`, muted `#A5B4C7`, warning `#FFB020`. No hardcoded hex in components.
- Radii: 16px cards, 10 to 12px inputs, full pill for primary CTAs, 6px checkboxes. App is dark only.
- Fonts: Geist (weights 400, 600, 700, 800) for Latin including SKUs; IBM Plex Sans Arabic for Arabic. No Space Grotesk, Inter or JetBrains Mono.
- Logical CSS utilities only (`ms-`, `pe-`, `text-start`, `start-0`); `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` are lint errors.
- Locales: `en`, `ar`. Locale in URL (`/en/...`, `/ar/...`); admin is localized (`/en/admin`, `/ar/admin`).
- Currency EGP, stored as integer piasters, formatted with Western digits in both languages.
- Payment states: `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUND_PENDING`, `REFUNDED`. A redirect or success URL never sets `SUCCEEDED`.
- `localStorage` only for the guest cart (ids and quantities) and UI preferences. No `dangerouslySetInnerHTML`. No card data stored anywhere. No secrets in client code.
- Simulated payment UI is labeled as a demo.
- Never claim a check passed without running it; report unrun checks as unverified.
- Commit messages end with the two trailer lines `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01RSbrnkoW3TsUo9z1q9V77U`.

## Review Focus

1. Unknown locale in the URL (`/fr/...`): returns 404, does not crash or fall back silently. Pinned in Task 3.
2. Corrupted, empty or old-version cart JSON in `localStorage`: the store starts with an empty cart instead of throwing. Pinned in Task 8.
3. Cart line whose product no longer exists or is out of stock: pricing flags it as unavailable instead of pricing it at zero. Pinned in Task 6.
4. Money edge values (0, 1 piaster, 999,999,999 piasters, non-integer or negative input): formatted correctly or rejected, never `NaN`. Pinned in Task 5.
5. Double-click or rapid re-submit of a payment attempt: exactly one attempt is created and a retry gets a new idempotency key. Pinned in Task 9.

---

### Task 1: Scaffold and tooling

**Files:**
- Create: project root files (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `.env.example`, `.gitignore`), `src/app/` minimal, `tests/setup.ts`, `tests/smoke.test.ts`
- Existing: `docs/superpowers/` (keep, commit as is)

**Interfaces:**
- Produces: scripts `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `format`; path alias `@/` for `src/`.

- [ ] **Step 1: Look up current setup docs** for Next.js, Tailwind, shadcn/ui and Vitest via Context7; scaffold Next.js into the existing directory with TypeScript, Tailwind, ESLint, App Router, `src/` dir and pnpm. Do not overwrite `docs/`.
- [ ] **Step 2: Enable strictness.** In `tsconfig.json` set `"strict": true` and `"noUncheckedIndexedAccess": true`. Add `eslint-plugin-jsx-a11y` with its recommended rules, Prettier, and `pnpm` scripts listed above.
- [ ] **Step 3: Write the failing smoke test** `tests/smoke.test.ts`: `expect(1 + 1).toBe(2)` under Vitest with jsdom and Testing Library setup in `tests/setup.ts`.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS once Vitest is configured (a config failure first is the red step).
- [ ] **Step 5: Run** `pnpm typecheck && pnpm lint && pnpm build`. Expected: all exit 0.
- [ ] **Step 6: Commit** `chore: scaffold Next.js app with strict TS, lint and test tooling`.

### Task 2: Design tokens and contrast check

**Files:**
- Create: `src/styles/tokens.css`, `scripts/check-contrast.ts`, `tests/lib/contrast.test.ts`, `src/lib/contrast.ts`
- Modify: `src/app/globals.css`, Tailwind theme config (map to CSS variables)

**Interfaces:**
- Produces: `contrastRatio(fg: string, bg: string): number` in `src/lib/contrast.ts` (hex inputs, WCAG relative luminance); script `pnpm check:contrast` exits non-zero if any required pair is below 4.5 (body text) or 3 (large text and UI borders).
- Produces: CSS variables `--canvas --surface-2 --card --elevated --border --cyan --cobalt --violet --text --muted --warning` and Tailwind colors of the same names; utilities `shadow-cta-glow`, `shadow-card-hover`, `bg-hero-aura`.

- [ ] **Step 1: Write failing tests** in `tests/lib/contrast.test.ts`: `contrastRatio('#000000','#FFFFFF')` is 21; `contrastRatio('#FFFFFF','#FFFFFF')` is 1; `contrastRatio('#F5F8FF','#0D1D32')` is at least 4.5.
- [ ] **Step 2: Run** `pnpm test tests/lib/contrast.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement `contrastRatio`** in `src/lib/contrast.ts` using the WCAG formula.
- [ ] **Step 4: Define tokens** in `tokens.css` with the Global Constraints values and the glow shadows from `design.md` (CTA `0 0 20px rgba(71,214,255,0.45), 0 2px 6px rgba(0,0,0,0.4)`; card hover `0 12px 32px rgba(2,6,12,0.6)`; hero aura radial gradient). Map them in the Tailwind theme.
- [ ] **Step 5: Implement `scripts/check-contrast.ts`** checking text, muted, cyan and warning text against canvas, secondary, card and elevated. If `#FFB020` fails on any surface, adjust the warning token and note it in `docs/requirements.md` later.
- [ ] **Step 6: Run** `pnpm test && pnpm check:contrast`. Expected: PASS, with the full pair table printed.
- [ ] **Step 7: Commit** `feat: add design tokens and contrast check`.

### Task 3: i18n, fonts and RTL

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts`, `src/messages/en.json`, `src/messages/ar.json`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/lib/fonts.ts`, `tests/i18n/routing.test.ts`
- Modify: `next.config.ts` (next-intl plugin), move default `src/app/page.tsx` and layout under `[locale]`

**Interfaces:**
- Produces: `routing` with `locales: ['en','ar'] as const`, `defaultLocale: 'en'`; `type Locale = 'en' | 'ar'`; `getDirection(locale: Locale): 'ltr' | 'rtl'` in `src/i18n/direction.ts`; `fonts.ts` exports `getFontClass(locale: Locale): string`.

- [ ] **Step 1: Look up current `next-intl` App Router setup** via Context7 and follow it for routing, middleware and request config.
- [ ] **Step 2: Write failing tests** in `tests/i18n/routing.test.ts`: `getDirection('ar')` is `'rtl'`, `getDirection('en')` is `'ltr'`; `en.json` and `ar.json` have identical key sets (walk keys recursively).
- [ ] **Step 3: Run** the test. Expected: FAIL.
- [ ] **Step 4: Implement** `direction.ts` and the message files with initial keys (`nav`, `footer`, `common`, `a11y.skipToContent`).
- [ ] **Step 5: Implement the locale layout:** set `<html lang dir>` from the locale, apply `getFontClass(locale)`, call `notFound()` for any locale not in `routing.locales`. Load Geist and IBM Plex Sans Arabic with `next/font` so each locale loads only its own font; in Arabic remove positive letter-spacing and use a looser line-height via a locale class.
- [ ] **Step 6: Verify by running** `pnpm build` then requesting `/en`, `/ar` (expect `dir="rtl"` for `/ar`) and `/fr` (expect 404). Expected: matches.
- [ ] **Step 7: Commit** `feat: add locale routing, fonts and RTL direction`.

### Task 4: Logical-utility lint rule

**Files:**
- Create: `scripts/check-logical-utilities.ts`, `tests/lib/logical-utilities.test.ts`
- Modify: `package.json` (script `check:rtl`), `eslint.config.mjs` if a rule fits better

**Interfaces:**
- Produces: `findPhysicalUtilities(source: string): string[]` returning offending class tokens among `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `border-l`, `border-r`, `rounded-l`, `rounded-r`.

- [ ] **Step 1: Write failing tests:** `findPhysicalUtilities('<div className="ml-4 ps-2">')` equals `['ml-4']`; `'text-start ms-2'` equals `[]`; a string like `"normal-case"` is not flagged.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the function with a token-boundary regex, and the script that scans `src/**/*.{ts,tsx}` and exits non-zero on any hit.
- [ ] **Step 4: Run** `pnpm test && pnpm check:rtl`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add RTL logical-utility check`.

### Task 5: Domain types and money

**Files:**
- Create: `src/services/types/index.ts`, `src/lib/money.ts`, `src/lib/localized.ts`, `tests/lib/money.test.ts`, `tests/lib/localized.test.ts`

**Interfaces:**
- Produces in `types`: `LocalizedString = { en: string; ar: string }`; `Money = { amount: number; currency: 'EGP' }` (integer piasters); `Product`, `Variant`, `Category`, `CartItem = { productId: string; variantId: string; quantity: number }`, `Address`, `Customer`, `Order`, `Review`, `GiftCard`; `Page<T> = { items: T[]; nextCursor: string | null; total: number }`; `Stock = 'in_stock' | 'low_stock' | 'out_of_stock'`.
- Produces: `money(amount: number): Money` (throws `RangeError` on non-integer, negative or non-finite); `formatMoney(m: Money, locale: Locale): string`; `addMoney(a: Money, b: Money): Money`; `localize(s: LocalizedString, locale: Locale): string`.

- [ ] **Step 1: Write failing tests:** `money(1999)` yields `{ amount: 1999, currency: 'EGP' }`; `money(10.5)`, `money(-1)`, `money(NaN)` throw `RangeError`; `formatMoney(money(199999), 'en')` contains `1,999.99`; `formatMoney(money(199999), 'ar')` contains `1,999.99` (Western digits); `formatMoney(money(0), 'en')` contains `0.00`; `formatMoney(money(999_999_999), 'en')` contains `9,999,999.99`; `localize({en:'A',ar:'ب'}, 'ar')` equals `'ب'`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the types and functions. `formatMoney` uses `Intl.NumberFormat` with locale `ar-EG-u-nu-latn` for `ar` and `en-EG` for `en`, style currency EGP, dividing piasters by 100 only at this point.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS. If the Node ICU build formats differently, adjust assertions to the numeric substring, not the symbol.
- [ ] **Step 5: Commit** `feat: add domain types, money and localized text helpers`.

### Task 6: Mock seed data and services

**Files:**
- Create: `src/mocks/products.ts`, `src/mocks/categories.ts`, `src/mocks/orders.ts`, `src/services/product-service.ts`, `src/services/category-service.ts`, `src/services/pricing-service.ts`, `src/services/order-service.ts`, `src/services/mock/*.ts` (one mock per service), `src/services/index.ts`, `src/services/mock/latency.ts`, `tests/services/*.test.ts`

**Interfaces:**
- Produces: `ProductFilters = { query?: string; categoryId?: string; brands?: string[]; minPrice?: number; maxPrice?: number; inStockOnly?: boolean; sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling'; cursor?: string; limit?: number }`; `ProductService { list(f: ProductFilters): Promise<Page<Product>>; getBySlug(slug: string): Promise<Product | null> }`; `CategoryService { list(): Promise<Category[]> }`; `PricingService { price(items: CartItem[]): Promise<PricedCart> }` where `PricedCart = { lines: PricedLine[]; subtotal: Money; shipping: Money; total: Money }` and `PricedLine = { item: CartItem; unitPrice: Money | null; lineTotal: Money | null; status: 'ok' | 'unavailable' | 'out_of_stock' }`; `OrderService { list(): Promise<Order[]>; get(id: string): Promise<Order | null> }`; `services` object in `index.ts` exposing all four; `MockConfig = { latencyMs: number; failureRate: number }` read from `NEXT_PUBLIC_MOCK_*` flags, default `latencyMs: 150`, `failureRate: 0`.
- Mock data is clearly marked: every mock file starts with a `// MOCK DATA: simulated, not real` comment and customer names are fictional.

- [ ] **Step 1: Write failing tests** for the product mock: `list({ query: 'dualsense' })` returns only matching items; search matches SKU too; `sort: 'price_asc'` is ascending; `limit: 2` returns a `nextCursor` and the next call continues without repeats; `getBySlug('does-not-exist')` is `null`.
- [ ] **Step 2: Write failing tests** for pricing: a valid line prices at `unitPrice × quantity`; a line with an unknown `productId` returns `status: 'unavailable'` with null prices and is excluded from `subtotal`; an out-of-stock variant returns `'out_of_stock'`.
- [ ] **Step 3: Write failing test** for failure injection: with `failureRate: 1` any service call rejects with an `Error`; with `0` it never does.
- [ ] **Step 4: Run.** Expected: FAIL.
- [ ] **Step 5: Implement** types, seed data (at least 12 products across the Figma categories: Console Systems, Controllers & Input, VR & Simulation, Digital Games, Gift Cards, with bilingual names, SKUs, stock and prices in piasters), mock services and `services/index.ts`. The mock selection lives only in `index.ts`.
- [ ] **Step 6: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 7: Commit** `feat: add mock data and typed service layer`.

### Task 7: Query layer

**Files:**
- Create: `src/lib/query/keys.ts`, `src/lib/query/client.ts`, `src/components/providers/query-provider.tsx`, `src/features/catalog/hooks/use-products.ts`, `src/features/catalog/hooks/use-categories.ts`, `src/lib/query/prefetch.ts`, `tests/lib/query-keys.test.ts`, `tests/features/use-products.test.tsx`

**Interfaces:**
- Consumes: `services` from Task 6.
- Produces: `queryKeys = { products: { list(f: ProductFilters): readonly unknown[]; detail(slug: string): readonly unknown[] }, categories: { all: readonly unknown[] }, cart: { priced(items: CartItem[]): readonly unknown[] } }`; `makeQueryClient(): QueryClient` with stale times (catalog 5 min, cart/orders 15 s); `useProducts(f: ProductFilters)`, `useCategories()`; `prefetchProducts(qc: QueryClient, f: ProductFilters): Promise<void>`.

- [ ] **Step 1: Write failing tests:** two equal filter objects produce equal keys, different ones differ; `useProducts` renders loading then data using a mocked `services`, and surfaces an error state when the service rejects.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** keys, client factory, provider (client component, one client per browser session), hooks and prefetch helper.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add TanStack Query layer`.

### Task 8: Cart and UI stores

**Files:**
- Create: `src/stores/cart-store.ts`, `src/stores/ui-store.ts`, `tests/stores/cart-store.test.ts`

**Interfaces:**
- Consumes: `CartItem` from Task 5.
- Produces: `useCartStore` with state `{ items: CartItem[] }` and actions `add(item: CartItem)`, `setQuantity(productId: string, variantId: string, quantity: number)`, `remove(productId: string, variantId: string)`, `clear()`; selector `selectCount(s): number`. Persist key `gs-cart`, schema version `1`. `useUiStore` with `{ mobileNavOpen: boolean; filterSheetOpen: boolean }` and setters.

- [ ] **Step 1: Write failing tests:** adding the same product and variant twice merges to quantity 2; `setQuantity(..., 0)` removes the line; quantity above 99 is clamped to 99; the store never holds a `price` field; persisted JSON equals `{ state: { items }, version: 1 }`.
- [ ] **Step 2: Write failing tests (Review Focus 2):** hydrating from `'not json'`, from `'{}'`, and from `{"state":{"items":"oops"},"version":0}` all yield `items: []` without throwing.
- [ ] **Step 3: Run.** Expected: FAIL.
- [ ] **Step 4: Implement** with Zustand `persist`, a `version` of 1, a `migrate` and a defensive `merge` that validates with a Zod schema and falls back to empty on any failure.
- [ ] **Step 5: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: add cart and UI stores`.

### Task 9: Payment state machine

**Files:**
- Create: `src/features/checkout/payment-machine.ts`, `src/features/checkout/idempotency.ts`, `src/features/checkout/use-payment-attempt.ts`, `src/services/payment-service.ts`, `src/services/mock/payment-service.ts`, `tests/features/payment-machine.test.ts`, `tests/features/use-payment-attempt.test.tsx`

**Interfaces:**
- Produces: `type PaymentState` (the eight states in Global Constraints); `allowedTransitions: Record<PaymentState, PaymentState[]>` with `PENDING → PROCESSING | CANCELLED | EXPIRED`, `PROCESSING → SUCCEEDED | FAILED | CANCELLED`, `SUCCEEDED → REFUND_PENDING`, `REFUND_PENDING → REFUNDED | SUCCEEDED`, and no outgoing transitions from `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED`; `transition(from: PaymentState, to: PaymentState): PaymentState` (throws `Error` on a disallowed move); `newIdempotencyKey(): string`; `PaymentService { createAttempt(input: { orderRef: string; idempotencyKey: string }): Promise<{ attemptId: string; state: PaymentState }>; getStatus(attemptId: string): Promise<PaymentState> }`; `usePaymentAttempt(orderRef: string)` returning `{ state: PaymentState | 'idle'; submit(): void; retry(): void; isSubmitting: boolean }`.
- The mock sets `SUCCEEDED` only from `getStatus`, never from `createAttempt`, and every mock payment UI carries a demo label supplied by the checkout screens later.

- [ ] **Step 1: Write failing tests:** every pair in `allowedTransitions` passes `transition`; `transition('SUCCEEDED','PENDING')` and `transition('FAILED','PROCESSING')` throw; `createAttempt` never returns `SUCCEEDED`.
- [ ] **Step 2: Write failing tests (Review Focus 5):** calling `submit()` twice synchronously produces exactly one `createAttempt` call; after a `FAILED` result `retry()` calls `createAttempt` with a different idempotency key than the first; while `isSubmitting` is true further `submit()` calls are ignored.
- [ ] **Step 3: Run.** Expected: FAIL.
- [ ] **Step 4: Implement** the machine, key generator (`crypto.randomUUID`), service and hook. The hook locks with a ref (not only state) so synchronous double calls are blocked.
- [ ] **Step 5: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: add payment state machine and duplicate-submit protection`.

### Task 10: Analytics, validation and sanitizing

**Files:**
- Create: `src/lib/analytics/events.ts`, `src/lib/analytics/track.ts`, `src/lib/validation/schemas.ts`, `src/lib/sanitize.ts`, `tests/lib/analytics.test.ts`, `tests/lib/validation.test.ts`, `tests/lib/sanitize.test.ts`

**Interfaces:**
- Produces: `AnalyticsEvent` discriminated union over `name` for the ten events in the spec, each with `eventId: string`, `timestamp: string` (ISO), `schemaVersion: 1`; `track(event: Omit<AnalyticsEvent, 'eventId' | 'timestamp' | 'schemaVersion'>): void` that never throws (adapter errors are swallowed); `setAnalyticsAdapter(a: { send(e: AnalyticsEvent): void } | null)`; Zod schemas `emailSchema`, `egyptPhoneSchema`, `passwordSchema` (min 8, one letter, one digit), `addressSchema`, `newsletterSchema`; `escapeText(input: string): string` and `stripTags(input: string): string`.

- [ ] **Step 1: Write failing tests:** `track` calls the adapter with an `eventId`, an ISO `timestamp` and `schemaVersion: 1`; an adapter that throws does not make `track` throw; two calls produce different `eventId`s; `passwordSchema` rejects `'abc'` and accepts `'NeonValkyrie99!'`; `egyptPhoneSchema` accepts `01012345678` and rejects `12345`; `stripTags('<img src=x onerror=alert(1)>hi')` equals `'hi'`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the modules. No analytics event type has a field for card data, password or token.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add analytics contracts, validation schemas and sanitizer`.

### Task 11: Primitive components

**Files:**
- Create: `src/components/ui/` shadcn-based `button.tsx`, `input.tsx`, `checkbox.tsx`, `badge.tsx`, `tabs.tsx`, `skeleton.tsx`, `toast` (sonner or shadcn toast); `src/components/shared/quantity-stepper.tsx`, `rating-pill.tsx`, `price-tag.tsx`, `stock-badge.tsx`, `password-input.tsx`, `phone-input.tsx`, `search-input.tsx`; `tests/components/*.test.tsx`

**Interfaces:**
- Consumes: `Money`, `Locale`, `Stock`, `formatMoney`.
- Produces: `Button` with `variant: 'primary' | 'ghost' | 'icon'`; `PriceTag({ price: Money; compareAt?: Money })`; `StockBadge({ stock: Stock })` (low stock uses the warning token, out of stock the error token); `QuantityStepper({ value: number; min?: number; max?: number; onChange(v: number): void; label: string })`; `RatingPill({ rating: number; count: number })`; `PasswordInput` with a visibility toggle button that has an accessible name.

- [ ] **Step 1: Write failing tests** per component: primary `Button` renders as `button` with the pill and cyan classes and shows a visible focus ring class; `QuantityStepper` fires `onChange(3)` on increment from 2, disables decrement at `min`, and exposes the value to assistive tech; `PasswordInput` toggles `type` between `password` and `text` and its toggle has an accessible name; `StockBadge` renders different text and token classes for each `Stock`; `PriceTag` shows the formatted EGP value.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Install shadcn primitives** with its CLI, restyle them to the tokens (no hardcoded hex), and implement the shared components. Directional icons carry `rtl:rotate-180`; keep each file under about 100 lines.
- [ ] **Step 4: Run** `pnpm test && pnpm check:rtl && pnpm lint`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add primitive and shared components`.

### Task 12: Card and catalog components

**Files:**
- Create: `src/components/shared/product-card.tsx`, `category-tile.tsx`, `trust-bar.tsx`, `breadcrumb.tsx`, `src/components/shared/product-card-skeleton.tsx`, `tests/components/product-card.test.tsx`

**Interfaces:**
- Consumes: `Product`, `PriceTag`, `RatingPill`, `StockBadge`, `useCartStore`, `track`.
- Produces: `ProductCard({ product: Product; locale: Locale })` with a link to the product, a wishlist button, and an Add to Cart pill that calls `useCartStore.add` and `track({ name: 'add_to_cart', ... })`; the Add button is disabled for out-of-stock products; `CategoryTile`, `TrustBar({ items })`, `Breadcrumb({ items: { label: string; href?: string }[] })` with a flipping separator in RTL.

- [ ] **Step 1: Write failing tests:** clicking Add to Cart adds one line with the product's first variant and fires one `add_to_cart` event; an out-of-stock product disables the button and shows the out-of-stock badge; the product name shown follows the locale; `Breadcrumb` marks the last item `aria-current="page"`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the components to the `design.md` card spec (16px radius, 1px border, product stage on `#0A1728`, 20 to 24px padding, hover lift of 2px with the card-hover shadow, reduced-motion respected).
- [ ] **Step 4: Run** `pnpm test && pnpm check:rtl`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add product card, category tile, trust bar and breadcrumb`.

### Task 13: Layout shell

**Files:**
- Create: `src/components/layout/header.tsx`, `footer.tsx`, `mobile-nav.tsx`, `locale-switcher.tsx`, `skip-link.tsx`, `cart-button.tsx`, `src/app/[locale]/(store)/layout.tsx`, placeholder pages `src/app/[locale]/(store)/{warranty,repairs,diagnostics}/page.tsx`, `tests/components/locale-switcher.test.tsx`, `tests/components/header.test.tsx`

**Interfaces:**
- Consumes: `useCartStore` selector `selectCount`, `useUiStore`, `routing`, `Locale`.
- Produces: `getSwitchHref(pathname: string, search: string, target: Locale): string` in `src/i18n/switch.ts`, which swaps the leading locale segment and keeps the rest of the path and query string.

- [ ] **Step 1: Write failing tests:** `getSwitchHref('/en/products/x', '?sort=price_asc', 'ar')` equals `'/ar/products/x?sort=price_asc'`; `getSwitchHref('/ar', '', 'en')` equals `'/en'`; the header shows the cart count from the store and hides the badge at zero; the skip link is the first focusable element and targets `#main`; below 768px the nav sits in `MobileNav` which opens via the UI store and traps focus.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the header (logo, nav, pill search, wishlist, cart with badge, account, locale switcher), footer (brand blurb, newsletter form built with React Hook Form and validated with `newsletterSchema` (inline accessible error message, submit disabled while pending), three link columns, payment badges), the store layout with a `<main id="main">` landmark, and the three placeholder pages. All visible text comes from message files in both languages.
- [ ] **Step 4: Run** `pnpm test && pnpm check:rtl && pnpm lint`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add header, footer, mobile nav and locale switcher`.

### Task 14: Component showcase page

**Files:**
- Create: `src/app/[locale]/dev/components/page.tsx`, `src/features/dev/showcase-sections.tsx`
- Modify: `src/middleware.ts` or the page itself so the route returns 404 when `NODE_ENV === 'production'`

**Interfaces:**
- Consumes: every component from Tasks 11 to 13.

- [ ] **Step 1: Write failing test:** the page module's guard function `isDevRouteEnabled(env: string | undefined): boolean` returns `true` for `'development'` and `'test'` and `false` for `'production'`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the guard and the page showing each component in every state (default, hover-equivalent static, focus, disabled, loading skeleton, error), in the active locale.
- [ ] **Step 4: Run** `pnpm test`, then `pnpm build` and confirm `/en/dev/components` returns 404 in the production server. Expected: tests PASS, 404 confirmed.
- [ ] **Step 5: Commit** `feat: add dev-only component showcase`.

### Task 15: Security headers and environment validation

**Files:**
- Create: `src/lib/env.ts`, `src/lib/security-headers.ts`, `tests/lib/env.test.ts`, `tests/lib/security-headers.test.ts`
- Modify: `next.config.ts` (headers), `.env.example`

**Interfaces:**
- Produces: `parseEnv(raw: Record<string, string | undefined>): Env` (Zod) with `NEXT_PUBLIC_MOCK_LATENCY_MS`, `NEXT_PUBLIC_MOCK_FAILURE_RATE` (0 to 1); it throws on a malformed value; `buildSecurityHeaders(isDev: boolean): { key: string; value: string }[]` including `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`.

- [ ] **Step 1: Write failing tests:** `parseEnv({ NEXT_PUBLIC_MOCK_FAILURE_RATE: '2' })` throws; defaults apply when unset; `buildSecurityHeaders(false)` contains a CSP without `'unsafe-eval'`; the env example lists no secret values.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** both modules and wire headers in `next.config.ts`. Keep the CSP as strict as Next.js and `next-intl` allow without breaking the build.
- [ ] **Step 4: Run** `pnpm test && pnpm build`, then start the production server and confirm the headers with `curl -sI`. Expected: headers present, app still loads.
- [ ] **Step 5: Commit** `feat: add security headers and env validation`.

### Task 16: Documentation and final verification

**Files:**
- Create: `README.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/frontend-architecture.md`, `docs/api-contracts.md`, `docs/security.md`, `docs/performance.md`, `docs/testing.md`, `docs/data-engineering.md`, `docs/deployment.md`, `docs/phase-1-report.md`

**Interfaces:**
- Consumes: everything above. Docs describe only what exists.

- [ ] **Step 1: Write the docs** per the spec section 13 list. `requirements.md` carries the open Phase 3 business questions; `architecture.md` records the single-app decision, locale-in-URL decision and the service boundary; `api-contracts.md` lists the service interfaces as the contract a backend must satisfy; `deployment.md` states that deployment is not yet verified.
- [ ] **Step 2: Run the full gate:** `pnpm typecheck && pnpm lint && pnpm check:rtl && pnpm check:contrast && pnpm test && pnpm build`. Expected: all exit 0; record each result.
- [ ] **Step 3: Capture screenshots** of `/en/dev/components` and `/ar/dev/components` at 375, 768 and 1280px with Playwright (install it for this task only) and compare against the Figma frames for header, product card, trust bar and footer. Record differences found.
- [ ] **Step 4: Run Lighthouse** against the production build of `/en` and `/ar`; record measured Performance, Accessibility, LCP, INP-proxy (TBT) and CLS. If Lighthouse is unavailable, record it as not run.
- [ ] **Step 5: Write `docs/phase-1-report.md`** with the report items required by the brief: files created and modified, features implemented, checks actually run with results, performance and accessibility issues, remaining bugs and risks, mock functionality still present, and outstanding integration requirements. Unrun checks are listed as unverified. Make no production-readiness or capacity claim.
- [ ] **Step 6: Commit** `docs: add Phase 1 documentation and report`.
