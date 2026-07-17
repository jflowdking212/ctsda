# ADR 001: Monorepo Structure with Turborepo

**Date:** 2026-07-17

**Status:** Accepted

## Context
The CTSDA platform requires multiple applications (web frontend, API backend, background workers) and shared packages (contracts, UI components, database client, configuration). A monorepo structure allows code sharing, consistent tooling, and coordinated versioning.

## Decision
Use **Turborepo** with **pnpm workspaces** for the monorepo.

- **Turborepo** provides parallel task execution, caching, and dependency graph awareness.
- **pnpm** offers strict dependency isolation via its node_modules structure, which prevents accidental cross-package imports.
- Workspace layout: `apps/*` for deployable applications, `packages/*` for shared libraries.

## Consequences
- All packages share a single lockfile and TypeScript version.
- Build caching via Turborepo speeds up CI.
- pnpm's strict mode prevents importing dependencies not declared in `package.json`.
- New packages can be added by creating a directory and adding to `pnpm-workspace.yaml`.