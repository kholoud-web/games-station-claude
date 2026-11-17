# Deployment

**Deployment has not been done or verified.** The app has only been built and run with `pnpm build` and `pnpm start` in a development sandbox. No hosting platform, domain, TLS, CDN, environment or monitoring has been set up or tested. This file records what is known and what must be decided.

## What was verified

- `pnpm build` succeeds (Next.js 16, Turbopack) and prerenders 13 static pages: the home page, three placeholder pages and the dev showcase in each language, plus framework pages. The showcase returns 404 at runtime in production.
- `pnpm start` serves `/en`, `/ar` and `/en/warranty` with status 200, sends the security headers, and returns 404 for `/en/dev/components` and `/en/fr`.
- The pages are static, so they can be cached by a CDN per language. This was **not** tested with a CDN.

## Requirements

- Node 22 and pnpm 10.
- Environment variables are optional and public: `NEXT_PUBLIC_MOCK_LATENCY_MS` (0 to 10000, default 150) and `NEXT_PUBLIC_MOCK_FAILURE_RATE` (0 to 1, default 0). A malformed value stops the build. **Set the failure rate to 0 in any shared environment** so visitors are not shown simulated failures.
- No secrets exist in this phase. When a backend exists, server secrets must never use the `NEXT_PUBLIC_` prefix.

## Before this can go to a real domain

1. **Decide what is being deployed.** This build shows a placeholder home page and mock data. It is a demo, not a store. Do not point a customer-facing domain at it.
2. **HTTPS first.** The app sends HSTS for two years including subdomains; a browser that sees it keeps requiring HTTPS for that domain.
3. **CSP:** add the origins for product video, the payment provider and analytics when those exist (see [security.md](security.md)).
4. **Caching:** static pages can sit behind a CDN, but cache keys must include the locale path. Cache rules for the future API (catalog versus cart and orders) are undecided.
5. **Fonts and images:** fonts are self-hosted; there are no real product images yet (cards show a placeholder illustration), so the image pipeline is untested.
6. **Monitoring and error reporting:** none. Core Web Vitals from real users (RUM) are not collected.
7. **A CI pipeline** running the gate in [testing.md](testing.md) does not exist.

## Capacity

The targets (20,000 concurrent visitors, 10,000 simultaneous payment attempts) are planning targets for the whole system. This frontend avoids work that would hurt them (static pages, no client-side pricing, duplicate-submit protection), but capacity depends on the backend, infrastructure, payment-provider limits and load testing. **None of that exists and no load test has been run, so no capacity claim is made.**
