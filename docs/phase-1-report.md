# Phase 1 (Foundation) report

Date: 2026-11-17. Spec: `docs/superpowers/specs/2026-11-08-foundation-design.md`. Plan: `docs/superpowers/plans/2026-11-08-foundation.md`.

**Status:** the Foundation is built and its automated checks pass. It is a frontend with mock data only. Nothing here is production-ready, and nothing here shows capacity for 20,000 concurrent visitors or 10,000 simultaneous payments; those depend on backend, infrastructure, payment-provider limits and load testing that do not exist yet.

## Files created and modified

- 126 source files under `src/` and 45 test files under `tests/`, added across the commits since the scaffold (about 14,500 lines in total, including docs).
- 10 documents: `README.md` and `docs/{requirements,architecture,frontend-architecture,api-contracts,security,performance,testing,data-engineering,deployment}.md`, plus this report.
- Modified from the scaffold: default Next.js boilerplate and the five sample SVGs in `public/` were removed.
- Dependencies: 20 runtime, 19 dev. Added only when a task needed them (the shadcn CLI and Google Fonts were unreachable from the sandbox, so components are hand-written in shadcn style on Radix and fonts are self-hosted).

## Features implemented

- **Tooling:** Next.js 16 App Router, strict TypeScript (`noUncheckedIndexedAccess`), ESLint with `jsx-a11y`, Vitest, pnpm.
- **Design tokens:** all from `design.md`, plus the amber warning token, with a contrast script over 31 text and surface pairs.
- **i18n and RTL:** `/en` and `/ar` routes, `dir` and `lang` set on the server, Geist for Latin and IBM Plex Sans Arabic for Arabic, a check that bans physical-direction utilities (119 files scanned).
- **Data layer:** typed domain model, money as integer piasters in EGP, mock services behind one `services/index.ts`, TanStack Query hooks with server prefetch.
- **State:** guest cart store (ids and quantities only, tolerant of corrupted storage), UI store.
- **Payments (logic only):** eight-state payment machine, per-attempt idempotency keys, double-submit lock, polling in which only a status check can confirm success.
- **Analytics, validation, sanitizing:** ten versioned event contracts, Zod schemas, tag stripping.
- **Components:** buttons, inputs, password and phone fields, checkbox, quantity stepper, rating, price, stock badge, product card, category tile, trust bar, breadcrumb, tabs, skeleton, toast.
- **Shell:** header (collapses below 1024px), mobile menu, footer with newsletter form, locale switcher that keeps the path, skip link, three placeholder pages.
- **Dev showcase** at `/{locale}/dev/components`, which returns 404 in production.
- **Security:** six response headers and a CSP, env validation that stops the build on a bad value.

## Checks actually run (this session, final tree)

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed |
| `pnpm check:rtl` | Passed, 119 files, no physical-direction utilities |
| `pnpm check:contrast` | 31 pairs, 0 required failures, 4 advisory shortfalls (see issues) |
| `pnpm test` | 45 files, 458 tests passed |
| `pnpm build` | Passed, 13 static pages |
| Horizontal overflow in Chromium | None at 375, 768 and 1280px, English and Arabic (and at 11 widths from 320 to 1440px earlier in Task 16) |
| Production server | `/en` and `/ar` return 200, `/en/fr` returns 404, `/en/dev/components` returns 404, six security headers present |
| Lighthouse 13.6.0 (mobile preset) | Performance 87 to 99, accessibility 100, best practices 96, SEO 100, CLS at most 0.003 |
| Lighthouse 12.8.2 (earlier set) | Performance 82 to 93, same other scores; full tables in `docs/performance.md` |

Mutation checks were also run for most tasks (see the ledger): deliberate breakages that the tests did or did not catch. One survivor was found and fixed (the tabs direction test).

## Not verified

- **Arabic copy has not been reviewed by a native speaker.** All Arabic strings were written by the assistant. Treat them as drafts.
- **LCP against the 2.5 s budget is inconclusive.** The two Lighthouse sets disagree by about 2 s on the same code (2.54 to 3.63 s against 0.9 to 1.0 s) and the cause was not isolated.
- **INP and all field data:** Lighthouse has no INP in lab mode; there are no real users.
- **Pixel comparison with the Figma frames was not done.** The Figma image could not be fetched. Structure, element order, nav links and search copy were compared against the Figma node metadata only.
- **The dev server's CSP** (React Refresh) was not loaded in a browser.
- **Browsers other than Chromium,** real devices, real screen readers, real mobile networks.
- **Deployment, CDN behavior, load or payment capacity:** not tested at all.

## Final review and fixes

One fresh-context reviewer read the whole branch and ran the suite, the build and headless-Chrome probes. It reported no Critical findings. It ran on Sonnet 5.5, not the most capable model the process asks for, so treat it as a good review, not the strongest one. Six Important findings were fixed, each with a test that failed first:

1. Payment polling ignored forward and terminal states reported by the server.
2. The idempotency key and attempt state were not scoped to the order.
3. Restoring the cart could wipe the in-memory cart, and could overwrite the saved cart before reading it.
4. `formatMoney` accepted an invalid `Money`, and its never-NaN test could not fail.
5. Zod was in the shared client bundle (see issue 1 below).
6. A card number pasted into search could reach analytics in `search_performed.query`.

Ten minor findings were deferred and one Important finding was not changed (field border contrast, issue 2 below). The fixes were verified by the automated suite and a production build only; Lighthouse and the browser probes were not repeated after them.

## Performance and accessibility issues

1. **Zod no longer ships to every page.** After the final review it was moved out of the shared client code: cart lines are validated by hand, the newsletter form loads Zod on its first submit, and the mock config reader has its own dependency-free module. Verified by grepping the built chunks that `/en` and `/ar` reference (none contains Zod) and pinned by `tests/lib/client-bundle.test.ts`. Lighthouse was not re-run after this change, so the score and the bundle sizes are not re-measured.
2. **Default input border `#1D3550` is 1.2 to 1.56:1** against the surfaces, under the 3:1 that WCAG 1.4.11 asks for on control boundaries. It follows `design.md`; inputs get a cyan border and ring on focus. A decision on the border token is needed from the design owner.
3. **Header collapses at 1024px, not 768px.** The spec says the nav collapses below 768px, but the full header needs about 1,290px, so at 768px the language switcher fell off screen. Tablets now get the compact header (ledger ruling).
4. **Checkbox is 24px, not Figma's 16px,** to meet the WCAG 2.2 AA target size.
5. **Best practices is 96** because of console 404 errors from prefetching pages that do not exist yet (cart, products, categories, deals, about, gift cards, wishlist, account, orders, returns, login, sign up). They go away as sub-projects 2 to 5 add those pages.

## Remaining bugs and risks

- Two files are over the 100-line guideline: `use-payment-attempt.ts` (154, kept whole on purpose because its lock, key and attempt share one invariant) and `newsletter-form.tsx` (108). Two more are data or types (`services/types/index.ts` 134, `mocks/products.ts` 126).
- The CSP allows `'unsafe-inline'` for scripts and styles in production, a weaker XSS backstop than a nonce policy. A nonce policy would force dynamic rendering and give up CDN caching of static pages.
- The wishlist heart is local to each card and resets on reload.
- A `Strict-Transport-Security` header is sent in production; it is sticky, so the real domain must serve HTTPS before launch.
- A cart line whose stock has fallen below its quantity is flagged by the pricing service, but no cart screen exists yet to show it.

## Mock functionality still present

Everything behind `src/services/mock/` is simulated and marked `MOCK DATA`: products, categories, orders, pricing, shipping (flat EGP 75, free from EGP 2,500, both invented), the newsletter signup (labeled demo), and the payment service. No card data is collected or stored. No analytics are sent anywhere.

## Outstanding integration requirements

- A backend that satisfies the service interfaces in `docs/api-contracts.md`, with authorization enforced server-side. Frontend route protection alone is not enough, including for `/en/admin` and `/ar/admin`.
- Payment gateway with verified server-side webhooks, reconciliation and refunds; success must come from the server, never from a redirect.
- Aramex shipment and tracking APIs; real shipping fee and free-shipping threshold.
- Real authentication (email, Google and Facebook), saved addresses and two phone numbers per customer.
- Server-side inventory reservation, order and payment state machines, gift card issue and redemption.
- Backend-originated financial analytics events and a warehouse; the browser only measures behavior.
- **Open business rules (block sub-project 3):** guest checkout versus mandatory registration, discount and cashback rules, free-shipping threshold, digital versus physical gift cards and partial redemption.
- Load testing of the checkout path once a backend exists.
