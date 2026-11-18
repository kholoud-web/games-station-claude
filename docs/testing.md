# Testing

## Commands

| Command | Checks |
| --- | --- |
| `pnpm test` | Vitest, jsdom, Testing Library (45 files, 458 tests at the last run) |
| `pnpm typecheck` | `next typegen` then `tsc --noEmit` with `strict` and `noUncheckedIndexedAccess` |
| `pnpm lint` | ESLint with `jsx-a11y` |
| `pnpm check:rtl` | No physical direction utilities (`ml-`, `pr-`, `left-`, `text-left`, border and rounding sides) in `src/` |
| `pnpm check:contrast` | WCAG contrast for every token text and surface pair, parsed from `tokens.css` |
| `pnpm build` | Production build (also runs TypeScript and `parseEnv`) |

The full gate is `typecheck`, `lint`, `check:rtl`, `check:contrast`, `test`, `build`, all of which must exit 0.

## What the tests cover

| Area (`tests/`) | Files | Covers |
| --- | --- | --- |
| `lib/` | 14 | Money (zero, 1 piaster, 9,999,999.99; floats, negatives and NaN rejected), number and stock helpers, localized text, product helpers, contrast, RTL scanner, analytics (envelope, secret filtering, never throws), validation, sanitizing, env, security headers, Zod setup, query keys |
| `services/` | 6 | Product search, sorting and cursor pagination, pricing statuses (unknown product, out of stock, invalid quantity), orders, mock config, failure injection, payment and newsletter services |
| `stores/` | 2 | Cart merge, clamp, removal, persisted shape, corrupted and old-version storage; UI store |
| `features/` | 5 | Payment state machine and the payment hook (double submit, retry key rules, dropped request, polling timeout), product query hook, dev-route guard, component showcase |
| `components/` | 12 | Button, form controls (password, phone, inputs, checkbox), quantity stepper, display components (price, stock, rating), tabs and toast, product card and catalog parts (category tile, trust bar, breadcrumb), header with mobile navigation, footer with the newsletter form, locale switcher, cart hydrator, coming-soon page |
| `i18n/` | 2 | Direction, identical key sets in `en.json` and `ar.json`, locale switching URLs |
| `config/` | 1 | `next.config.ts` wiring (Tailwind registration, headers) |
| root | 1 | Smoke test (jsdom, jest-dom, `@/` alias) |

The plan's five review-focus cases each have a pinned test: unknown locale, corrupted cart storage, cart lines for missing or out-of-stock products, extreme money values, and double-submitting a payment.

## What is not tested

- **No end-to-end tests.** Playwright was used for one-off screenshots, overflow measurements and CSP checks (see [phase-1-report.md](phase-1-report.md)); no Playwright suite is committed.
- **Layout is not unit-testable here.** jsdom has no layout engine, so responsive overflow, visual match to Figma and RTL appearance were checked by hand in Chromium, not by the suite. The header breakpoint is pinned by class and media-query tests only.
- **No automated accessibility run** (axe or similar). `jsx-a11y` lint rules, accessible-name tests and manual checks only. No screen reader testing.
- **No visual regression, cross-browser or real-device testing.** Chromium only.
- **No load or stress testing.** The 20,000-visitor and 10,000-payment targets are untested.
- **No coverage threshold** is enforced and no coverage report was generated.

## Conventions

- Test first: write the failing test, watch it fail for the right reason, then implement.
- One behavior per test, named for the behavior. Prefer real components and real stores; fake only the service boundary.
- A test that has never failed proves nothing. Where a test was added after the code, a mutation check (break the code, see the test fail, restore) is the substitute. Task 15 used this.
- Edge cases from real failure modes (corrupt storage, double click, dropped request, missing product) get a test before they get a fix.
