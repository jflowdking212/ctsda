# Legacy Seed Runbook

Milestone 13 is intentionally manual. Do not bulk-import the old repository data.

## Decisions

- Recreate the two production institutions through the admin dashboard/API after line-by-line review.
- Create admin accounts fresh. Do not import old password hashes.
- Force password reset and TOTP enrollment for every created admin.
- Preserve existing public codes only if continuity is required:
  - `CTSDA-628356-TG`
  - `CTSDA-628357-EC`

## Manual Institution Entry

Use `POST /admin/legacy/accredited-institutions` as `super_admin` or `support_officer`.

Required fields:

- `name`
- `registrationNumber`
- `institutionType`
- `country`
- `address`
- `phone`
- `email`
- `accreditationCode`
- `certificateNumber`

Optional fields:

- `website`
- `description`
- `verificationToken`
- `issuedAt`
- `expiresAt`

After entry, verify the certificate from the public verification page using the generated or preserved verification token.

## Admin Accounts

Use `POST /admin/users` as `super_admin`.

The endpoint returns a `passwordResetToken`. Send it out-of-band to the intended admin. They must reset their password before dashboard access. Admin dashboard access still requires TOTP.

## Legacy Files

The new repository must not contain:

- `database/*.db`
- `registrationForms.csv`
- `logs/*`
- personal photos/documents from old uploads
- old admin credential hashes

If these exist in the old repository history, scrub that history with BFG or `git filter-repo` before sharing the archive.
