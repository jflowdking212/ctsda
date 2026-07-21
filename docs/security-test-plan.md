# Security Test Plan

Covered in automated tests:

- brute-force login lockout
- session cookie security
- unauthenticated admin access through `AuthGuard`
- role-based authorization for review, export, manual payment, reporting, and admin user actions
- invalid upload type rejection
- Stripe webhook signature rejection
- payment idempotency
- log redaction

Manual/staging checks before launch:

- CSRF rejection for unsafe browser requests
- stored/reflected XSS attempts in institution/application/comment fields
- SQL injection probes on filters and verification routes
- path traversal attempts on document download/signing routes
- open redirect attempts on auth/payment return URLs
- HTTPS-only cookies and HSTS in production
- restore-from-backup drill
- rollback drill

Each launch candidate must attach the automated test output and a dated staging checklist.
