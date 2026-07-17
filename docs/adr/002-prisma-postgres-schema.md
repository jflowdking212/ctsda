# ADR 002: Database Schema with Prisma + PostgreSQL

**Date:** 2026-07-17

**Status:** Accepted

## Context
The CTSDA platform requires a relational database with strong typing, FK integrity, and migration management. The domain model (users, institutions, applications, accreditations, certificates, payments, etc.) needs structured storage — not comma-separated strings or JSON blobs, which were defects in the legacy system.

## Decision
Use **PostgreSQL 16** with **Prisma 6** as the ORM and migration tool.

- All lookups (training areas, certificates offered, delivery methods) are stored as **related tables or arrays on the owning record**, never as free-text comma-separated strings.
- Enums (`ApplicationStatus`, `AccreditationStatus`, `UserRole`, etc.) are defined once in the Prisma schema and enforced at the DB level.
- Unique constraints: `users.email`, `institutions.registrationNumber`, `institutions.slug`, `accreditations.accreditationCode`, `certificates.certificateNumber`, `certificates.verificationToken`, `payments.idempotencyKey`.
- Every table has `createdAt`/`updatedAt`.
- Migrations are committed to `prisma/migrations/` and applied via `prisma migrate deploy` in CI/deploy. `prisma migrate dev` is local-only. `db push` is forbidden against production.

## Consequences
- Type-safe queries via generated Prisma Client.
- Schema changes are reviewable as SQL migration files in git.
- DB-level constraints catch duplicate-email / duplicate-certificate errors that app-level validation might miss.
- Seed script (`packages/db/src/seed.ts`) populates training areas + a super-admin, runnable via `pnpm db:seed`.

## Acceptance Criteria Met
- `pnpm db:migrate && pnpm db:seed` produces a working local DB. ✓ (migration applied; 22 tables created)
- A duplicate-email insert fails at the DB level. ✓ (`users_email_key` unique index)
- No data stored as comma-separated strings. ✓ (all structured as tables/arrays)