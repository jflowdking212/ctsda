# Backup and Restore Runbook

## Backups

Postgres:

```bash
pg_dump "$DATABASE_URL" --format=custom --file backups/ctsda-$(date +%Y%m%d%H%M).dump
```

Object storage:

```bash
aws s3 sync "s3://$S3_BUCKET" "backups/object-storage/$S3_BUCKET-$(date +%Y%m%d%H%M)"
```

Keep daily backups for 30 days and monthly backups for 12 months.

## Restore Drill

1. Create a clean staging database.
2. Restore Postgres:

```bash
pg_restore --clean --if-exists --dbname "$STAGING_DATABASE_URL" backups/latest.dump
```

3. Restore object storage:

```bash
aws s3 sync backups/object-storage/latest "s3://$STAGING_S3_BUCKET"
```

4. Run migrations:

```bash
DATABASE_URL="$STAGING_DATABASE_URL" pnpm --filter @ctsda/db exec prisma migrate deploy
```

5. Start staging and verify:

```bash
curl -fsS "$STAGING_API_URL/ready"
curl -fsS "$STAGING_WEB_URL"
```

6. Verify one public certificate and one admin login.

Record drill date, backup artifact IDs, restore duration, and any errors.

## Rollback

1. Stop traffic to the new version.
2. Redeploy the previously known-good image tag.
3. If migrations were applied, restore the last pre-deploy database backup into staging first and confirm compatibility before production restore.
4. Re-run `/ready`, public verification, login, payment webhook dry-run, and admin queue smoke checks.
