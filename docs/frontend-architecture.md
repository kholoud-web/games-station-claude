# Frontend architecture

## Folder rules

```
src/app/[locale]/(store)/   route files compose components and nothing else
src/components/ui/          primitives restyled to the tokens (button, input, checkbox, badge, tabs, skeleton, toaster)
src/components/shared/      store components (product card, price tag, stock badge, rating pill, quantity stepper, ...)
src/components/layout/      header, footer, mobile navigation, locale switcher, skip link
src/features/<name>/        components, hooks, types for one feature
src/services/               interfaces and domain types at the top level; mock/ holds implementations
src/mocks/                  seed data only
src/stores/                 Zustand stores
src/lib/                    pure helpers with tests
```

- A feature folder imports only from `components/`, `lib/` and `services/`, never from another feature.
- UI never imports from `mocks/`; only `services/` does.
- `lib/` never imports from `features/`.
- Types, hooks, services and mock data live in separate files.
- Page files stay thin. Components target 50 to 100 lines; anything over 100 is reviewed for a split. Files over 100 lines today: `services/types/index.ts` (a type catalogue), `mocks/products.ts` (data), `features/checkout/use-payment-attempt.ts` (one invariant, kept whole on purpose), `components/layout/newsletter-form.tsx` (106 lines).

## Server and client components

Server Components by default. `'use client'` only where interaction needs it: the mobile menu, forms, the cart button and badge, stepper, password input, toaster and providers. Components that read text or the locale use `next-intl` hooks, so they need the intl provider the locale layout supplies.

## Styling

Tailwind 4 with `src/styles/tokens.css` as the single source of colors, radii and shadows. No hard-coded hex values in components. `cn()` merges class names and knows the project's custom radius and shadow tokens, so overrides win predictably. Focus rings use one shared `focusRing` class (cyan). Motion respects `prefers-reduced-motion`.

## Internationalization

- Interface text: `src/messages/en.json` and `ar.json`. A test requires identical key sets, and another that every validation message key exists in both.
- Catalog text: `LocalizedString` in the data (`{ en, ar }`), read with `localize()`, which falls back to English for blank Arabic.
- Numbers and prices use Western digits in both languages (`formatMoney`, `formatCount`).
- Arabic gets a looser line height and no positive letter spacing, because tracking breaks Arabic letter joining.

## Data fetching

`queryOptions` factories in `src/lib/query/options.ts` give key, fetcher and stale time in one place; hooks and server prefetch both use them. `prefetchProducts` swallows service errors on purpose, so a failing service never breaks page render; the client then fetches and shows its own error state.

## Forms and validation

React Hook Form with Zod schemas from `src/lib/validation/schemas.ts`. Schemas emit message keys (not text), so forms translate them with `t(issue.message)`. Free text is stripped of markup. The Egyptian phone schema accepts +20, 0020, spaces, dashes and Arabic-Indic digits and normalizes to `01XXXXXXXXX`.

## Accessibility conventions

Semantic landmarks (`<header>`, `<main id="main">`, `<footer>`), a skip link, labelled search, visible focus rings, 24px checkboxes (WCAG 2.2 target size), `aria-pressed` for toggles with one constant label, error text tied to its field, and a Radix dialog for the mobile menu (focus trap, Escape, focus return).
