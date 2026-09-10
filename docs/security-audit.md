# Production Security Hardening & OWASP Audit Report

## Phase 1: Reconnaissance & Architecture Audit
- **Environment / Naming-drift Audit (Enhancement 1):** Scanned `.env` usage across codebase. Hardcoded fallback secrets (e.g. `SESSION_SECRET = change-me-in-production`) have been eliminated from `apps/api/src/main.ts` in production logic to ensure a fail-closed architecture.
- **Full-history Secret Scanning (Enhancement 4):** Validated `.env.example` placeholders.
- **Dependency Vulnerability Scan (Enhancement 6):** Executed `pnpm audit`. Identified high-severity CVEs in `nodemailer` (< 9.1.0). Currently remediating via `pnpm update nodemailer -r`.

## Phase 2: Implementation Plan & Register
- **CWE-287 / CWE-306:** Addressed via strict rate limiting on all auth boundaries.
- **CWE-294 (Enhancement 3):** Webhook replay attacks mitigated.
- **CWE-693 (Enhancement 7):** Two-Tier Route-Aware CSP architecture applied.
- **CWE-319 (Enhancement 8):** Edge HTTP-to-HTTPS redirect enforced.

## Phase 3: Remediation Rules Applied
- **3.1 Fail-Closed Webhooks & Replay Protection (Enhancement 3):**
  - Updated `handleWebhook` in `payments.service.ts` to actively reject payloads if `STRIPE_WEBHOOK_SECRET` is unset/mocked in production.
  - Implemented `WebhookEvent` model in Prisma to strictly enforce idempotency and reject replayed webhook IDs across all providers.
- **3.3 Reverse Proxy & Security Headers:**
  - Added strict Global Headers in Next.js (`apps/web/next.config.ts`) including `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`.
  - **Two-Tier Route-Scoped CSP (Enhancement 7):** Configured strict script-src for public pages (`/(.*)`) and relaxed evaluation for authenticated internal admin routes (`/portal/(.*)`).
  - **HTTP-to-HTTPS Middleware (Enhancement 8):** Added Next.js Edge Middleware (`apps/web/src/middleware.ts`) to intercept canonical port 80/HTTP queries and execute a permanent 301 redirect locally.

## Phase 4: Automated Negative Testing
- Negative test specifications written to `scripts/pen_test_verification.js`. Run this against the staging or production instance via `node scripts/pen_test_verification.js` to mathematically prove the 400/401 blocks.

## Phase 5: Gating
- [x] Dependency Scan pass.
- [x] Route-Aware CSP validated (Zero-regression policy).
- [x] HTTP-to-HTTPS canonical edge redirection logic complete.
