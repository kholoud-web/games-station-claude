# Security

Frontend-only phase. This documents the controls that exist in the code and the ones that cannot exist until there is a backend. Nothing here is a security certification: no penetration test, dependency audit or external review has been run.

## What the frontend does

| Control | Where | Evidence |
| --- | --- | --- |
| Security headers on every response | `src/lib/security-headers.ts`, wired in `next.config.ts` | Unit tests; all six headers seen with `curl -I` on `pnpm start` (Task 15) |
| No `unsafe-eval` in production | CSP `script-src` | Test; Chromium loaded `/en` and `/ar` with 0 CSP violation events |
| Input validation and normalization | Zod schemas in `src/lib/validation/schemas.ts` (email, Egyptian phone, password, address, newsletter) | Unit tests |
| Markup stripped from free text | `stripTags`, `escapeText` in `src/lib/sanitize.ts`; `addressSchema` applies it | Unit tests |
| No unsafe rendering | No `dangerouslySetInnerHTML` anywhere in `src/` | Grep; React escapes text by default |
| Card data never handled | No card fields exist; analytics `track()` drops any event containing a secret-looking field (`cardNumber`, `cvv`, `password`, `token`, `code`, ...) at any depth | Unit tests, including compile-time rejection of such fields |
| Duplicate submits blocked | Ref-based lock in `usePaymentAttempt`, `loading` buttons are disabled and `aria-busy`, newsletter form lock | Unit tests (a second synchronous `submit()` makes one `createAttempt` call) |
| Payment success needs the server | A `SUCCEEDED` reply to "create attempt" is downgraded to `PROCESSING`; only `getStatus` confirms | Unit tests |
| Safe browser storage | `localStorage` holds only guest cart ids and quantities; a corrupted or tampered value yields an empty or filtered cart, and planted fields such as `price` are stripped | Unit tests (Review Focus 2) |
| No secrets in client code | Only two `NEXT_PUBLIC_` variables (mock latency and failure rate), validated at startup by `parseEnv`; `.env.example` has no secrets | Test and source review |
| Dev-only page cannot ship | `/dev/components` calls `notFound()` unless `NODE_ENV` is `development` or `test`; fails closed | Test; 404 seen on `pnpm start` |
| Unknown locale | `/fr` ends in a 404 (one redirect to `/en/fr`) | Seen on a production build |
| Everything simulated is labeled | Mock newsletter says "demo"; analytics events carry `simulated`; mock data is fictional | Source review |

### Response headers

`Content-Security-Policy` (default-src and most others `'self'`; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri` and `form-action` `'self'`; `upgrade-insecure-requests` in production), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation off; `payment=(self)`), and `Strict-Transport-Security` (2 years, includeSubDomains) in production only. `next dev` additionally allows `unsafe-eval` and `ws:` for React Refresh and sends no HSTS.

## Known limits and risks

1. **The CSP is static and keeps `'unsafe-inline'` for scripts and styles.** Next.js writes inline bootstrap scripts, and a per-request nonce would make every page render on demand and give up CDN caching. The policy limits origins, framing, plugins and eval but is a weaker XSS backstop than a nonce policy. See [architecture.md](architecture.md) decision 7.
2. **HSTS is sticky.** Once a browser sees it, the domain must keep serving HTTPS. Confirm the real domain before launch.
3. **The CSP will block product videos and the payment gateway** until their origins are added to `img-src`, `media-src`, `connect-src` and `frame-src` (not yet allowed at all).
4. **The development server's CSP was not loaded in a browser**, so React Refresh under the dev policy is unverified.
5. **No dependency audit** (`pnpm audit`) and **no secret scan** have been run for this report.
6. **Zod runs in `jitless` mode** to avoid `new Function`; slower only for very large objects.
7. **Frontend route protection is not security.** Admin and account routes do not exist yet; when they do, authorization must be enforced by the backend on every request.

## What only a backend can do (not built)

Real authentication and session management (secure, HttpOnly, SameSite cookies; CSRF protection), authorization and role checks, server-side validation of every input, rate limiting and bot protection on login, checkout and gift card redemption, server-side price, stock and discount calculation, verified payment webhooks and reconciliation, gift card code entropy and redemption locking, audit logging for admin actions, and secret management. The frontend validation here improves usability and is **not** a substitute for any of them.
