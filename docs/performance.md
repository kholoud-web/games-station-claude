# Performance

Budgets from the Master Prompt and the Foundation spec: **LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less.** This file records what was measured at the end of Phase 1 and what was not. The measured page is a **placeholder home page** inside the real header and footer, so these numbers are a baseline for the shell, not a prediction for catalog, product or checkout pages.

## How it was measured

Two separate measurement sets, both Lighthouse mobile preset (simulated slow 4G and 4x CPU slowdown), headless Chromium on the same shared sandbox machine that built the app, production build (`pnpm build && pnpm start`) on localhost. Lab data only.

- **Set A:** Lighthouse 12.8.2, three runs per page, taken earlier in Task 16.
- **Set B:** Lighthouse 13.6.0, four runs per page (one initial run plus three more), taken at the end of Task 16 after the header fix. Installed outside the project so `package.json` is unchanged.

Reproduce with `npx lighthouse http://localhost:3000/en --only-categories=performance,accessibility,best-practices,seo` after `pnpm build && pnpm start`.

## Results

### Set A (Lighthouse 12.8.2)

| Run | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/en` 1 | 86 | 100 | 96 | 100 | 1.57 s | 3.09 s | 330 ms | 0 | 412 KB |
| `/en` 2 | 93 | 100 | 96 | 100 | 0.93 s | 2.54 s | 231 ms | 0 | 412 KB |
| `/en` 3 | 88 | 100 | 96 | 100 | 1.52 s | 3.44 s | 172 ms | 0 | 412 KB |
| `/ar` 1 | 84 | 100 | 96 | 100 | 1.70 s | 3.63 s | 274 ms | 0.003 | 471 KB |
| `/ar` 2 | 89 | 100 | 96 | 100 | 1.67 s | 2.96 s | 254 ms | 0.003 | 471 KB |
| `/ar` 3 | 82 | 100 | 96 | 100 | 1.68 s | 3.20 s | 402 ms | 0.003 | 471 KB |

Medians: `/en` performance 88, LCP 3.09 s, TBT 231 ms; `/ar` performance 84, LCP 3.20 s, TBT 274 ms.

### Set B (Lighthouse 13.6.0)

| Run | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/en` 1 | 87 | 100 | 96 | 100 | 1.0 s | 1.0 s | 500 ms | 0 | not recorded |
| `/en` 2 | 97 | 100 | 96 | 100 | 1.0 s | 1.0 s | 200 ms | 0 | 412 KiB |
| `/en` 3 | 99 | 100 | 96 | 100 | 0.9 s | 0.9 s | 110 ms | 0 | 412 KiB |
| `/en` 4 | 99 | 100 | 96 | 100 | 0.9 s | 0.9 s | 140 ms | 0 | 412 KiB |
| `/ar` 1 | 95 | 100 | 96 | 100 | 0.9 s | 0.9 s | 260 ms | 0.003 | not recorded |
| `/ar` 2 | 94 | 100 | 96 | 100 | 0.9 s | 0.9 s | 290 ms | 0.003 | 471 KiB |
| `/ar` 3 | 94 | 100 | 96 | 100 | 0.9 s | 0.9 s | 280 ms | 0.003 | 471 KiB |
| `/ar` 4 | 97 | 100 | 96 | 100 | 0.9 s | 0.9 s | 200 ms | 0.003 | 471 KiB |

## Against the budgets

| Budget | Result | Verdict |
| --- | --- | --- |
| CLS 0.1 or less | 0 (`/en`), 0.003 (`/ar`) in all 14 runs | Met in the lab |
| LCP 2.5 s or less | Set A: 2.54 to 3.63 s (6 of 6 over). Set B: 0.9 to 1.0 s (8 of 8 under) | **Inconclusive.** The two sets disagree by about 2 s on the same code. Not explained: tool version and machine load are both candidates and neither was isolated. Do not report this budget as met or missed until a controlled re-run |
| INP 200 ms or less | Not measurable | **Not measured.** Lighthouse has no INP in lab mode. TBT is only a rough proxy and is not the same metric: 172 to 402 ms in Set A, 110 to 500 ms in Set B |

Real-user (field) data does not exist.

## Findings

0. **Zod used to ship to every page; it no longer does (fixed after the final review).** Before the fix the `/en` HTML referenced a 380 KB (about 90 KB gzipped) chunk that contained Zod, reached through the cart store's storage validation, the footer newsletter form and the mock config reader. Now cart lines are validated by hand, the newsletter form loads Zod on its first submit, and `src/lib/mock-env.ts` has no imports. Checked on the production build by searching every chunk that `/en` and `/ar` reference for Zod markers: none found; Zod exists only in two chunks that load on demand. `tests/lib/client-bundle.test.ts` fails if a shared entry point statically imports Zod again. **Not re-measured:** Lighthouse was not re-run, so the scores, the LCP and the "unused JavaScript" estimate above still describe the build before this fix. The first newsletter submit now waits for one extra chunk request.
1. **LCP was over budget in Set A.** The LCP element is a text paragraph in the placeholder hero, so there is no image or resource to load: 82 to 87% of the simulated LCP is "render delay". Under no throttling the same page shows an LCP breakdown of roughly 30 ms to first byte plus about 225 ms render delay, so the miss comes from Lighthouse's simulated slow device and network, not from a slow server.
2. **Candidate causes (hypotheses, not tested):** three render-blocking CSS files (8 KB, 1 KB, 1 KB, about 315 ms estimated delay); 170 to 270 KB of JavaScript, of which Lighthouse reports about 72 KB of one 83 KB chunk and 25 KB of a 70 KB chunk as unused; about 690 to 770 ms of script evaluation on the throttled main thread; fonts discovered late because `preload` is off (architecture decision 9).
3. **Font preload decision (architecture decision 9):** the Task 3 note said these results would decide whether to revisit it. They do not show a font delay on the LCP element (it is text, with no load-delay or load-time portion), so preload stays off. Revisit when real pages have heading text that waits for a web font.
4. **`/ar` is heavier than `/en`** (471 KB vs 412 KB, about 7% worse performance score) because IBM Plex Sans Arabic ships four files (Arabic and Latin subsets, two weights) against one Geist variable font.
5. **Best practices is 96, not 100,** because of one console error: a 404 for `/en/cart?_rsc=...`. Header and footer link to pages that do not exist yet (cart, products, categories, deals, about, gift cards, wishlist, account, orders, returns, login, sign up). It disappears as sub-projects 2 to 5 add those pages.

## What was done to help (by design, not measured as causes)

Pages are prerendered static HTML, so a CDN can cache each language. Each locale downloads only its own font files (seen with `curl` on both routes). Pricing is never computed in the browser. The newsletter mock loads by dynamic import on first submit so seed data stays out of the footer on every route. Layout is stable: CLS is about 0.

## Not measured

INP and any field data; real devices and real networks (including Egyptian mobile networks); CDN behavior; image optimization (there are no product images yet, cards show a placeholder illustration); catalog, product, cart and checkout pages with data; the dev server; bundle composition analysis; and repeated runs under controlled CPU conditions (these ran on a shared sandbox, so run-to-run spread is large: performance 82 to 99 across both sets).

## Next steps

1. Re-measure when the storefront pages exist and set bundle, payload and image-weight budgets from those measurements (the spec says not to invent them).
2. Investigate the LCP candidates above with a bundle analysis before the product page is built.
3. Add real-user monitoring so INP and LCP come from real devices.
4. Plan a load test of the backend and checkout path; frontend work alone cannot show the 20,000-visitor and 10,000-payment targets.
