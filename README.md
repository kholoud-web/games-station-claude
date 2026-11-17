# Games Station

Frontend for an Egyptian gaming e-commerce store (consoles, controllers, VR, digital games, gift cards). Arabic and English, right-to-left and left-to-right, dark theme only.

**Status: Phase 1 (Foundation) only, mock data only.** There is no backend, no database, no real authentication, no real payment and no Aramex integration. Every order, customer, payment and newsletter signup in the app is simulated and labeled as such. See [docs/phase-1-report.md](docs/phase-1-report.md) for what was built and verified, and what was not.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · strict TypeScript · Tailwind CSS 4 · shadcn-style components on Radix · TanStack Query · Zustand · next-intl · Zod · React Hook Form · Vitest + Testing Library.

## Run it

Requires Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000, redirects to /en
pnpm build && pnpm start
```

| Script | What it does |
| --- | --- |
| `pnpm test` | Vitest unit and component tests |
| `pnpm typecheck` | `next typegen` then `tsc --noEmit` |
| `pnpm lint` | ESLint, including `jsx-a11y` |
| `pnpm check:rtl` | Fails on physical direction utilities (`ml-`, `left-`, `text-left`, ...) |
| `pnpm check:contrast` | WCAG contrast for every design-token text and surface pair |
| `pnpm format` | Prettier |

Environment variables are optional and public (see `.env.example`): `NEXT_PUBLIC_MOCK_LATENCY_MS` (0 to 10000, default 150) and `NEXT_PUBLIC_MOCK_FAILURE_RATE` (0 to 1, default 0). A malformed value stops the build or dev server with a clear message.

## What exists today

- `/en` and `/ar`: a placeholder home page inside the real header and footer.
- `/en/warranty`, `/en/repairs`, `/en/diagnostics` (and `/ar/...`): "coming soon" pages for footer links.
- `/en/dev/components` and `/ar/dev/components`: a showcase of every component in each state. Development only; it returns 404 in production builds.
- Header links to products, cart, account and other pages that do not exist yet return 404 until the next sub-projects.

## Layout

```
src/app/[locale]/        route files only; they compose components
src/components/          ui (primitives), layout (shell), shared (store components), providers
src/features/            catalog, checkout, dev: hooks and feature logic
src/services/            typed service interfaces, domain types, and mock/ implementations
src/mocks/               seed data only (fictional)
src/stores/              Zustand: guest cart, UI
src/lib/                 money, validation, analytics, sanitize, env, security headers, query
src/i18n/                routing, direction, locale switching
src/messages/            en.json, ar.json
src/styles/tokens.css    design tokens (single source for colors, radii, shadows)
```

## Documentation

- [Requirements and open questions](docs/requirements.md)
- [Architecture decisions](docs/architecture.md) and [frontend architecture](docs/frontend-architecture.md)
- [API contracts](docs/api-contracts.md) (what a backend must satisfy)
- [Security](docs/security.md) · [Performance](docs/performance.md) · [Testing](docs/testing.md)
- [Data engineering and analytics](docs/data-engineering.md) · [Deployment](docs/deployment.md)
- [Phase 1 report](docs/phase-1-report.md)
- Design spec and plan: `docs/superpowers/specs/` and `docs/superpowers/plans/`

## Scale targets

The business targets are 20,000 concurrent visitors and 10,000 simultaneous payment attempts. These are planning targets, not claims. The frontend avoids work that would hurt them (static pages, no client-side pricing, duplicate-submit protection), but capacity can only be shown by backend architecture, infrastructure, payment-provider limits and load testing. None of that exists or has been run.
