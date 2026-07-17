# 003. Secret Management

## Status

Accepted

## Context

The legacy project exposed production-like credentials in source control. The rewrite must treat local env files as disposable developer state and production secrets as managed infrastructure.

## Decision

Local development uses `.env.example` templates plus untracked `.env` files. Production and staging secrets must be stored in a managed secret store such as AWS Secrets Manager, Doppler, or Vault; deployment pipelines inject them at runtime.

## Consequences

Secrets are not committed, logged, or baked into images. Rotating a credential does not require a source-code change. CI verifies builds using configured environment secrets rather than checked-in values.
