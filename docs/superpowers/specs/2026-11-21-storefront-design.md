# Games Station: Storefront Design

Date: 2026-11-21
Status: Draft for review
Sub-project: 2 of 5 (Foundation done; this is Master Prompt Phase 2, Core UI)

## 1. Purpose and scope

Build the public storefront on top of the Foundation: the home page, the product catalog (browse, search, filter, sort, paginate) and the product detail page, in English and Arabic with full RTL. Everything uses mock data behind the existing service boundary.

**In scope:** home, catalog, product detail, header search wiring, the mock catalog expansion, a protected-playback video player (simulated), cross-sell and related-product rows, analytics tracking points for these pages, tests, and verification against Figma.

**Out of scope:** cart, checkout, wishlist page, accounts, gift cards, authentication, search autocomplete, submitting reviews, a real video file or host, bundles and upsell pricing rules (Phase 3 business questions), subcategories (not in Figma).

**Inputs (authoritative):** the Figma file (home and category are one flattened image, `9:219`; product `9:221`; catalog results `9:2839`), `design.md`, and the Master Prompt (Customer Storefront, Product Video Protection and Frontend Performance sections). Figma only; the Stitch project was not used.

## 2. Routes (under `/[locale]/(store)`)

- `/` home.
- `/products` catalog. All state is in the URL: `?q=&category=&brand=&color=&price=&availability=&connectivity=&rating=&sort=&page=&view=`. One page serves both Figma catalog screens: it shows the category banner when `category` is set and the search header when `q` is set.
- `/products/[slug]` product detail. An unknown slug returns 404.
- Header search submits to `/products?q=`.

## 3. Data and service changes

Extends the Foundation types; existing fields stay.

- `Category` set is a taxonomy decision (section 11, item 1).
- `Product` gains: `attributes` (for example `connectivity`), `badges` (for example "Pro pick"), grouped `specs`, `options` groups (finish, caps preset) with per-option stock, `pairedProductIds`, `warranty` details, and `videos`.
- `protection` (already present) stays as the warranty or official-hardware badge. Video protection is separate (section 6).
- `ProductFilters` gains: `colors`, `connectivity`, `minRating`, `page` (1-based) and `inStockOnly` is the availability filter. `ProductSort` gains `name`. The cursor stays for later infinite scroll; the numbered Figma pagination uses `page` plus `limit`, and the response keeps `total`.
- `ProductService` gains `facets(filters): Promise<Facets>` (counts per option for the sidebar), `pairedWith(productId)` and `related(productId)`. `list` and `getBySlug` accept an `AbortSignal` so obsolete requests can be cancelled.
- New `VideoService.getPlayback(productId, videoId)` returns `{ url, expiresAt, watermark }` (simulated signed, expiring access).
- Mock catalog: about 36 bilingual products across the categories, with brands, ratings, options, stock states, specs, reviews and pairs. Placeholder art stays SVG under `public/products/`, one per category, behind a `ProductImage` component with a fixed aspect-ratio box. Real photos later need only a `src` change.

## 4. Catalog behavior

- Filters: category, brand, color, price (slider plus min and max boxes), availability, connectivity and rating. The first five are in the Master Prompt; connectivity and rating are in Figma.
- Sort: Featured (default, the service's best-selling then newest order), name A to Z, price low to high, price high to low, newest, best selling.
- Search matches product name and SKU.
- `parseFilters(searchParams)` and `toSearchParams(filters)` are pure, hand-validated functions (no Zod in the client bundle). Bad input falls back to defaults: unknown sort or category, page below 1 or beyond the last page, `NaN`, negative or reversed prices, repeated or array parameters, oversized values.
- Filtering, sorting and paging run in the service; the client renders one page (12 items). The whole catalog is never sent to the browser.
- The catalog search box is debounced (300 ms) and cancels the previous request. Filter changes run in a transition and keep the previous results visible.
- Empty results show a message with a clear-filters action. A service failure shows an error state with a retry.
- Pages contain no personalized data (cart count is client-only), so public pages are cache-eligible. ISR and revalidation settings are documented, not load-tested.

## 5. Product page behavior

- Gallery: image and video slides, thumbnails with `aria-current`, zoom dialog, badges, and a "360 view" hint that is a label only (no 360 asset exists).
- Info: brand, stock badge, title, summary, rating, SKU, price with compare-at price and savings pill, option selectors (radio-group semantics, stock per option), quantity, wishlist (local state), share, Add to Cart (with price) and Instant Buy.
- Instant Buy adds the item and goes to `/cart`, a placeholder until sub-project 3.
- Protection bar (Figma trust badges): delivery, official warranty, return window. The text comes from product data and the shipping and return windows are placeholders until business rules exist.
- Package inclusions, tabs (specs, overview, reviews; reviews load on demand), spec cards, "Frequently paired together" (cross-sell, quick add) and a related-products row (same category or brand, reusing `ProductCard`; not in Figma, added to meet the Master Prompt's related-products requirement).
- Localized metadata, and `Product` JSON-LD with `<` escaped before it is written into the page.
- Figma's "Klarna or PayPal installments" line is dropped (not Egyptian options; installments are an open business question).

## 6. Product video protection (simulated)

The Master Prompt asks for authorized hosting, signed URLs or tokens, expiring access and watermarking, and states that browsers cannot fully prevent screenshots or screen recording.

- The player never holds a permanent URL. It requests playback from `VideoService.getPlayback`, and requests a new token when the current one is near expiry or a load fails.
- A visible "Protected playback" indicator and a watermark overlay (mock viewer reference) are shown on the video.
- The UI does not claim recording is prevented. Right-click blocking is not used; it adds no real protection.
- The mock service returns a placeholder poster and a short expiring token. No real video, host or signing exists in this phase.

## 7. Home page

Built from the flattened image, so spacing is approximate: hero carousel (PS5 slide copy as in Figma, controls, pause button, no autoplay under reduced motion), trust strip (free shipping uses the mock threshold constant, EGP 2,500, not Figma's "$50"), category tiles, and the "Save up to 40%" promo banner. Slide and promo copy are mock content, clearly separated from components.

## 8. Components

Small files, each aiming for 100 lines or fewer, built on Foundation components.
- Home: `HeroCarousel`, `CategoryGrid`, `PromoBanner`, `TrustBar`.
- Catalog: `CatalogHeader`, `FilterSidebar` with `FilterGroup`, `CheckboxFilter`, `PriceRangeFilter`, `RatingFilter`, `ActiveFilters`, `ResultsToolbar`, `ProductGrid`, `ProductList`, `Pagination`, skeletons, empty and error states, and a mobile filter sheet (uses the existing UI store flag).
- Product: `Gallery`, `VideoPlayer`, `PricePanel`, `OptionSelector`, `PurchaseActions`, `PackageInclusions`, `SpecCards`, `ReviewsList`, `CrossSellRow`, `RelatedRow`.
- Directional icons flip in RTL; the price slider runs right to left; the sidebar swaps sides through logical layout.
- Heavy parts (zoom dialog, video player, reviews) load on demand.

## 9. Accessibility, security, analytics, performance

- Accessibility: filter changes announced through an `aria-live` region ("28 results"), keyboard-operable slider, carousel as a labeled region with a pause control, focus rings, 24px minimum targets, reduced motion respected.
- Security: all URL parameters are untrusted and validated; no `dangerouslySetInnerHTML` (JSON-LD is serialized and `<` escaped); prices, stock and discounts come from the service, never the client.
- Analytics (existing `track`): `product_viewed` once per product page, `search_performed` per results load (card-like numbers already redacted), `add_to_cart` from card and product page.
- Performance: Server Components for pages with prefetch and hydration; hero and first product image use priority loading, the rest load lazily; fixed aspect ratios prevent layout shift. Budgets from the Foundation apply (LCP at or under 2.5 s, INP at or under 200 ms, CLS at or under 0.1) and results are reported as measured.

## 10. Verification (completion criteria)

Each item must be run and its result reported.
- Unit tests: parameter parsing and serialization with hostile input, facets, filtering, sorting, paging, the video playback token and expiry refresh, and the new components.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm check:rtl`, `pnpm check:contrast`, `pnpm test`, `pnpm build` all pass.
- Screenshots of home, catalog and product at 375, 768 and 1280 px in English and Arabic, compared with the Figma frames. The home image can only be compared by eye.
- Lighthouse on the three routes, reported as measured. Anything not run is listed as unverified.
- No claim of production readiness or capacity is made.

## 11. Open decisions (defaults used unless you change them)

1. **Category taxonomy.** Figma shows three different lists: home tiles (Consoles, Gaming Headsets, Keyboards, Gaming Mice, Accessories), catalog filter (Consoles, Controllers, Keyboards, Mice, Accessories) and footer (Console Systems, Controllers & Input, VR & Simulation, Digital Games, Gift Cards). Default: Consoles, Controllers, Headsets, Keyboards, Mice, Accessories (the storefront screens), with the footer links updated to match. Gift Cards stays a separate footer link to its own page later.
2. Bundles, upsell rules, installments and the real shipping and return windows are Phase 3 business questions and are not built here.
3. The exact home layout cannot be measured from the flattened image; the Figma frames for home are not available as editable design.
