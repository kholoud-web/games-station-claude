# Games Station: Foundation Design

Date: 2026-11-08
Status: Approved by user
Sub-project: 1 of 5 (Foundation, Storefront, Cart and Checkout, Accounts, Admin)

## 1. Purpose and scope

Games Station is an Egyptian gaming e-commerce platform. This phase builds the frontend only, with mock data and no backend. The Foundation sub-project provides everything the later sub-projects build on: tooling, design tokens, i18n and RTL, the layout shell, the first component set, and the mock data layer.

**In scope:** project scaffold, design tokens, Arabic/English with RTL/LTR, header/footer shell, first component set, typed domain model, service interfaces with mock implementations, TanStack Query setup, Zustand cart and UI stores, analytics interface, checkout state machine (logic only), test and verification tooling, `docs/architecture.md`.

**Out of scope:** real pages beyond the shell and placeholders; cart, checkout, account and admin screens; any backend, database, real authentication, real payment or Aramex integration.

**Inputs:** the Figma file (10 desktop screens at 1280px: login, register, home, catalog, product, cart, checkout, account dashboard, order history, wishlist, gift cards), `design.md`, the user's master brief, and the Games Station E-Commerce Master Prompt (PDF, 10 pages). The Master Prompt defines the business requirements (storefront, accounts, admin, inventory, orders and payments, delivery, gift cards, analytics), security, performance budgets, documentation and phased workflow. Where it conflicts with this spec, section 12 records the resolution or the open decision.

**Phase mapping:** the Master Prompt's phases are 0 Audit, 1 Foundation, 2 Core UI, 3 Customer Experience, 4 Admin and Integrations, 5 Analytics, 6 Hardening. This spec is Phase 1. The sub-projects map as: Storefront = Phase 2, Cart/Checkout/Accounts = Phase 3, Admin = Phase 4. Real payment and Aramex integrations (Phase 4) and load testing (Phase 6) stay out of this frontend-only effort.

## 2. Stack

- Next.js (App Router), strict TypeScript (`strict`, `noUncheckedIndexedAccess`), pnpm
- Tailwind CSS, shadcn/ui, TanStack Query, Zustand, `next-intl`, Zod, React Hook Form (forms only)
- Server Components by default; Client Components only where interaction needs them. Dependencies are added only with a clear need.
- Single Next.js app. No Turborepo, multiple frontends or microservices; this decision is recorded in `docs/architecture.md`.
- Vitest + Testing Library, Playwright (later phases), ESLint (with `jsx-a11y`), Prettier
- Current setup docs for each library are checked before scaffolding. Versions are pinned in `package.json`.

## 3. Structure

```
src/
  app/[locale]/            route files only; they compose components
    (store)/ (auth)/ (account)/ (admin)/
  components/
    ui/                    shadcn primitives restyled to design.md
    layout/                Header, Footer, MobileNav, LocaleSwitcher
    shared/                PriceTag, RatingPill, TrustBadge, etc.
  features/<name>/         components, hooks, types per feature
  services/                interfaces + mock implementations
  mocks/                   seed data only
  stores/                  Zustand (cart, UI)
  lib/                     utils, analytics, validation, sanitize
  i18n/                    routing and request config
  messages/                en.json, ar.json
  styles/                  tokens.css
docs/
  architecture.md
  superpowers/specs/
```

Rules:
- Page files stay thin and only compose components.
- Components target 50 to 100 lines. Anything over 100 is reviewed for splitting.
- Types, hooks, services and mock data live in separate files.
- Feature folders do not import from each other; they import only from `components/`, `lib/` and `services/`.
- Key decisions are recorded in `docs/architecture.md`.

## 4. Design tokens

`design.md` is the single source. Where its frontmatter and prose disagree, the prose wins (canvas `#050D19`).

| Role | Value |
|---|---|
| Canvas | `#050D19` |
| Secondary canvas | `#0A1728` |
| Card | `#0D1D32` |
| Elevated | `#122640` |
| Border | `#1D3550` |
| Primary accent (cyan) | `#47D6FF` |
| Secondary accent (cobalt) | `#168BFF` |
| Tertiary accent (violet, sparing) | `#825BFF` |
| Text primary | `#F5F8FF` |
| Text muted | `#A5B4C7` |
| Warning (amber, low stock) | `#FFB020` |

- All values are CSS variables in `styles/tokens.css`. Tailwind's theme maps to those variables. Components contain no hardcoded hex values.
- Named utilities exist for the CTA glow, card hover elevation, hero ambient aura and the rim borders defined in `design.md`.
- Radii: 16px cards, 10 to 12px inputs, full pill for primary CTAs and badges, 6px checkboxes.
- Spacing follows the 8pt grid. Breakpoints: mobile under 768px, tablet 768 to 1199px, desktop 1200px and up (max content width 1440px, 12-column grid).
- The app is dark only.
- A script verifies every text and surface token pair against WCAG AA contrast. No accessibility claim is made without its output.

## 5. Typography

- Geist for Latin text, loaded through `next/font` with weights 400, 600, 700 and 800 and the scale from `design.md`.
- IBM Plex Sans Arabic for Arabic text (user-approved). Geist has no Arabic glyphs.
- The font is selected per locale so each language loads only its own file.
- In Arabic, line-height is slightly increased and positive letter-spacing is removed, because tracking breaks letter joining.

## 6. Internationalization and RTL

- Locale lives in the URL: `/en/...` and `/ar/...`, using `next-intl` with a `[locale]` segment.
- The server sets `<html lang dir>` from the locale.
- Interface strings live in `messages/en.json` and `messages/ar.json`. Product and catalog text is bilingual in the data (`LocalizedString`), not in message files.
- Components use logical utilities only (`ms-`, `pe-`, `text-start`, `start-0`). A lint rule flags `ml-`, `pl-`, `left-`, `right-` and `text-left`.
- Directional icons (chevrons, arrows) flip with an `rtl:` variant. Non-directional icons (cart, search) do not flip.
- Money uses `Intl.NumberFormat` with currency EGP and Western digits in both languages.
- The locale switcher keeps the current path when changing language.

## 7. Data layer

**Domain types** (`services/types`): `Product`, `Variant`, `Category`, `Money`, `CartItem`, `Order`, `Address`, `Customer`, `Review`, `GiftCard`. `Money` is an integer number of piasters (EGP × 100), never a float, formatted only at display time. Bilingual text uses `LocalizedString` (`{ en, ar }`).

**Services:** each interface exposes async methods (for example `ProductService.list(filters)`, `OrderService.get(id)`). Mock implementations simulate latency and, behind a flag, occasional failures so loading and error states are exercised. `services/index.ts` selects mock or real implementations, so a backend swap is one change per service. UI components never import mock data directly.

**Fetching:** TanStack Query hooks wrap the services. Query keys are centralized. Stale times are set per resource (long for catalog, short for cart and orders). Server components prefetch and hydrate the query cache for home, catalog and product pages.

## 8. Client state

- **Cart store (Zustand):** items hold only product id, variant id and quantity. Prices and totals are always recomputed from the service. Persisted to `localStorage` with a schema version and a migration path.
- **UI store:** drawers, filter sheet, and similar transient state.
- **Payment state machine** (from the Master Prompt): `PENDING → PROCESSING → SUCCEEDED`, with `FAILED`, `CANCELLED`, `EXPIRED`, `REFUND_PENDING` and `REFUNDED`. Transitions are documented in a table and unit tested. A success URL or browser redirect never sets `SUCCEEDED`; only a status returned by the (mock) service does, and the UI shows a pending state until then. A submit lock and a per-attempt idempotency key prevent duplicate submissions. A simulated network failure exercises the failed and retry states. Foundation delivers the logic and tests; the screens come in sub-project 3.
- `localStorage` is used only for the guest cart (ids and quantities) and UI preferences. It is never a source of truth for orders, payments or inventory.

## 9. Security

- User input is validated with Zod schemas shared between forms and services.
- No `dangerouslySetInnerHTML`. Any rich text passes through `lib/sanitize`.
- Checkout is a simulated payment form. It never stores card data and is labeled as a demo so a mock transaction cannot be mistaken for a real one.
- No secrets in client code. Environment variables follow Next's public/private split.
- Mock customers and orders are fictional and clearly marked as simulated.

## 10. Analytics readiness

A typed `track(event)` interface with a no-op or console adapter. Versioned event contracts are defined in one typed union: `product_viewed`, `search_performed`, `add_to_cart`, `checkout_started`, `order_created`, `payment_succeeded`, `payment_failed`, `refund_completed`, `inventory_updated`, `gift_card_redeemed`. Every event carries an event ID, timestamp and schema version, and consumers must tolerate duplicates. Events never contain card data, passwords, tokens or unnecessary personal data, and an analytics failure must never break checkout. Browser events measure behavior only; financial events (`order_created`, `payment_*`, `refund_completed`, `inventory_updated`) are marked as backend-originated and are only simulated in this phase. Tracking points are added where the matching UI exists. A real provider can be plugged in later without touching components.

## 11. Layout shell and first components

**Shell:**
- Header: logo, main nav, pill search, wishlist, cart (with count badge) and account icons, plus the locale switcher. Below 768px the nav collapses into a slide-over menu and search moves to its own row.
- Footer: brand blurb, newsletter field, three link columns, payment badges.
- Skip-to-content link, `<main>` landmark, visible cyan focus rings, reduced-motion respected.
- Footer links without a real page (Warranty Policy, Hardware Repairs, System Diagnostics) route to simple placeholder pages.

**Components** (built on shadcn primitives, restyled to tokens): buttons (primary pill, ghost, icon), inputs (text, search, phone with country prefix, password with visibility toggle), checkbox, quantity stepper, badge, rating pill, product card, category tile, trust bar, breadcrumb, tabs, skeleton loaders, toast. A `/dev/components` page, excluded from production builds, shows each component in every state in LTR and RTL.

## 12. Assumptions to confirm

**Resolved**
1. The Figma brand reads "GameHub" while the brief says "Games Station". The product name used is **Games Station**.
2. Figma prices in `$` are placeholders. Currency is EGP.
3. Figma has no mobile, Arabic or admin frames. Those layouts are designed from `design.md` rules and the Master Prompt's admin list.
4. `design.md` prose values override its frontmatter where they conflict.
5. Arabic/English is confirmed, so `next-intl` is justified.
6. **Fonts (user decision):** the attached `design.md` is authoritative, so Geist is used throughout, including SKUs and specs. The Master Prompt's Space Grotesk, Inter and JetBrains Mono are not used. IBM Plex Sans Arabic covers Arabic.
7. **Admin routing (user decision):** admin is localized and lives under the locale segment, at `/en/admin` and `/ar/admin`, with full RTL support. Authorization is still enforced by the backend, never by frontend route protection alone.
8. **Amber warning token (user approved the suggestion):** `warning` is `#FFB020`, with a tinted container of `rgba(255, 176, 32, 0.12)` and a border of `rgba(255, 176, 32, 0.4)`. It is used for low-stock and other cautions. Out-of-stock and errors use the existing `design.md` error tokens, not amber. The contrast script must confirm AA for the warning text on each surface; the value changes if it fails.

**Open (need a decision before the screens that depend on them)**
1. **Business rules (block Phase 3):** guest checkout versus mandatory registration; Google/Facebook login; two phone numbers and one saved address; discount and cashback rules; free-shipping threshold; digital versus physical gift cards and partial redemption.

## 13. Verification (completion criteria)

Each item must be run and its result reported:
- `tsc --noEmit`, ESLint and `next build` pass.
- Vitest passes for services, the cart store, the checkout state machine and money formatting.
- The contrast script passes for all token pairs.
- Screenshots of `/dev/components` at 375, 768 and 1280px in English and Arabic, compared against the Figma frames.
- Lighthouse results for the shell, reported as measured.
- Core Web Vitals budgets from the Master Prompt (LCP at or under 2.5s, INP at or under 200ms, CLS at or under 0.1) are measured and reported; bundle, payload and image-weight budgets are set from measurements, not invented.
- Security headers and a CSP are configured and checked in the production build.
- Required docs exist: `README.md`, `docs/requirements.md` (confirmed requirements and open questions), `docs/architecture.md`, `docs/frontend-architecture.md`, `docs/api-contracts.md`, `docs/security.md`, `docs/performance.md`, `docs/testing.md`, `docs/data-engineering.md`, `docs/deployment.md`. Docs only describe what actually exists.
- Anything not verified is listed as unverified in the phase report.

The Foundation makes no claim of production readiness or of capacity for 20,000 concurrent visitors or 10,000 simultaneous payments. Those targets depend on backend architecture, infrastructure, payment-provider limits and load testing.
