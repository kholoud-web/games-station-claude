# Requirements

Sources: the Games Station E-Commerce Master Prompt (PDF), `design.md`, the Figma file (10 desktop screens), and the project brief. Where they disagreed, the decisions below apply.

## Decisions made

| # | Decision | Why |
| --- | --- | --- |
| 1 | Product name is **Games Station** | Figma says "GameHub"; the brief says Games Station |
| 2 | Currency is **EGP**, stored as integer piasters, Western digits in both languages | Brief; Figma `$` prices are placeholders |
| 3 | `design.md` is the visual source of truth, and its prose values win over its frontmatter (canvas `#050D19`) | They conflict; prose matches the Figma frames |
| 4 | **Geist** for Latin text, **IBM Plex Sans Arabic** for Arabic | User: `design.md` wins over the Master Prompt's Space Grotesk, Inter and JetBrains Mono |
| 5 | Locale in the URL (`/en`, `/ar`), admin included (`/en/admin`) | User decision; good for SEO and CDN caching |
| 6 | Warning (amber) token `#FFB020` for low stock | `design.md` has none; passes AA on all four surfaces (8.3 to 10.7:1) |
| 7 | One Next.js app, no monorepo or microservices | Master Prompt: no Turborepo without a demonstrated need |

## Requirement status (Master Prompt, section 3)

"Foundation" means the building blocks exist. Nothing below is a finished user-facing screen yet except the shell.

| Area | Status |
| --- | --- |
| Responsive, mobile-first shell (header, footer, navigation) | Built and checked at 320 to 1440px in both languages |
| Arabic and English with RTL and LTR | Built: routing, fonts, direction, logical utilities, bilingual data and messages |
| Product listing, search, filters, sorting, cursor pagination | Data layer built (`ProductService.list`); screens are sub-project 2 |
| Product details, images, videos, protection indicators | Types and card components built (`videoUrl`, `protection`); page is sub-project 2 |
| Cart and quantity management | Store and pricing contract built; cart page is sub-project 3 |
| Checkout, payment status, free-shipping threshold | State machine and mock service built; screens are sub-project 3 |
| Accounts, order history, tracking | Types and mock orders only; screens are sub-project 4 |
| Gift cards | Type only; purchase and redemption flows not built |
| Wishlist | Button only; nothing is saved |
| Admin dashboard | Not started (sub-project 5) |
| Cross-selling and upselling | Not started |
| Loading, empty, error, success and out-of-stock states | Skeleton, stock badge, error text and toast exist as components |
| Analytics events | Typed contract and `track()` built; no provider connected |

## Open business questions (block Phase 3)

These need a decision from the business before the screens that depend on them are built:

1. Guest checkout, or mandatory registration?
2. Google and Facebook sign-in: wanted at launch?
3. Two telephone numbers and one saved address per customer: confirm.
4. Discount and cashback rules.
5. Free-shipping threshold and shipping fee. The mock uses EGP 75 flat and free from EGP 2,500; these are placeholders, not policy.
6. Gift cards: digital, physical or both; recipient delivery; expiry; partial redemption.
7. Whether the contrast of input borders may be raised (see [security and accessibility notes](phase-1-report.md)): `design.md`'s border `#1D3550` is 1.2 to 1.6:1 against the surfaces, below the 3:1 WCAG 1.4.11 asks for control boundaries.

## Out of scope for the frontend phase

Backend APIs, database, real authentication, real payment gateway, Aramex, inventory reservation, webhooks, reconciliation. The frontend defines the contracts they must meet (see [api-contracts.md](api-contracts.md)).
