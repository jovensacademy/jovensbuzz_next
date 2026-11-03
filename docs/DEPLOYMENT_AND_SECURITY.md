# Production deployment & security checklist

## Recommended topology

```
Internet ──HTTPS──► Reverse proxy / CDN (TLS, HTTP→HTTPS redirect, HSTS)
                      ├──► Next.js  (node: `npm run build && npm run start`, port 3000)
                      └──► (optional) public API path for the enquiry form
                                │
                Spring Boot API (java -jar, port 8081, private network)
                                │
                MySQL 8 / MariaDB 10.6+ (private network, TLS, automated backups)
```

- Serve the site and the API over **HTTPS only**. Session cookies are marked `Secure` automatically in production
  builds, and Next.js sends HSTS in production.
- Keep the API on a private network where possible. Only `POST /api/v1/enquiries` must be reachable from browsers;
  everything admin-related goes through the Next.js server (`API_INTERNAL_URL`). To fully hide the API, add a
  Next.js route handler that forwards the enquiry and point `NEXT_PUBLIC_API_BASE_URL` at the site itself.
- Behind a reverse proxy, set `TRUSTED_PROXIES` to the proxy/Next.js addresses so rate limiting sees real client IPs.
  Do not trust `X-Forwarded-For` from anywhere else.

## Build & run

```bash
# API
cd backend && ./mvnw -B clean package        # runs the test suite; produces target/jovens_buzz-0.0.1-SNAPSHOT.jar
java -jar target/jovens_buzz-0.0.1-SNAPSHOT.jar

# Web
cd frontend-next && npm ci && npm run build && npm run start
```

Run each as a supervised service (Windows Service via NSSM/WinSW, systemd, or containers) with restart-on-failure.
Health checks: API `GET /actuator/health` (or `/api/v1/health`), web `GET /`.

## Before go-live checklist

**Secrets & configuration**
- [ ] `APP_PRODUCTION_MODE=true`. The API then refuses to start with the default JWT secret or the documented dev password.
- [ ] `JWT_SECRET` set to a fresh random base64 value (≥ 32 bytes) and stored in a secret manager, not a file in the repo.
- [ ] `BOOTSTRAP_ADMIN_PASSWORD` is a strong unique value. After first sign-in, set a new password under Users and
      remove the bootstrap variables.
- [ ] Database user is a dedicated least-privilege account (see `backend/scripts/init-database.sql`), not `root`.
- [ ] Google service account key provided via a secret store or workload identity, readable only by the API user.
- [ ] `.env`, `.env.local` and credential JSON files are absent from git (`git status` / `git log --stat`).
- [ ] `SWAGGER_ENABLED=false` (or protect it at the proxy).
- [ ] `CORS_ALLOWED_ORIGINS` lists only the production site origin(s).
- [ ] `SMTP_PASSWORD` comes from a secret store; SPF, DKIM and DMARC are set up for the sender domain so emails are
      not marked as spam; `CLIENT_RESPONSE_TIME` reflects a promise the team can keep.
- [ ] `NEXT_PUBLIC_SITE_URL` is the real `https://` domain, so canonical URLs, the sitemap and Open Graph are correct.

**Security behaviour (already implemented; verify after deploy)**
- [ ] `/admin` redirects to the login page when signed out, and `GET /api/v1/admin/enquiries` without a token returns 401.
- [ ] The session cookie is `HttpOnly; Secure; SameSite=Strict`. Logout and password changes revoke old tokens.
- [ ] Login lockout (5 failures → 15 min) and rate limits (login 10 / 5 min, enquiries 5 / 10 min per IP) work.
      The limiter is in-memory per instance, so with several API instances add a shared limiter at the gateway.
- [ ] Response headers include CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy` and HSTS.
- [ ] Admin pages return `X-Robots-Tag: noindex`, and `robots.txt` disallows `/admin` and `/api`.
- [ ] Error responses contain no stack traces or SQL. Actuator exposes only redacted `health`/`info`.

**Content & legal**
- [ ] Review the Privacy Policy and Terms (`frontend-next/src/app/(site)/(public)/…`) with your legal adviser and adjust
      retention periods and jurisdiction.
- [ ] Confirm contact details and social links in **Admin → Website Content**.

## Database migrations

- Flyway runs automatically on API start and is the only way the schema changes. Never edit an applied
  `V*__*.sql` file; add a new `V{n}__description.sql`.
- Back up before deploying a release that contains new migrations.
- `spring.jpa.hibernate.ddl-auto=validate` makes the API refuse to start if the schema and entities disagree.
- Roll back by restoring the backup and deploying the previous release. Flyway Community has no automatic undo.

## Backups

- Take a nightly logical backup, keep at least 14 daily and 8 weekly copies, and store one off-site and encrypted:
  `mysqldump --single-transaction --routines --triggers jovens_buzz | gzip > jovens_buzz-$(date +%F).sql.gz`
- On XAMPP/Windows: `C:\xampp\mysql\bin\mysqldump.exe -u root --single-transaction jovens_buzz > backup.sql`
- Test a restore into a scratch database at least monthly.
- Google Sheets is a convenience copy, not a backup.

## Monitoring & logs

- Logs include a per-request correlation ID (`[req:…]`, echoed in the `X-Request-Id` response header). Ship logs to
  your log platform and alert on `ERROR`.
- Watch **Settings → Google Sheets integration** (or `GET /api/v1/admin/settings/integrations/google-sheets`) for
  rising `failed` counts.
- Never log request bodies. Audit metadata deliberately excludes passwords, tokens and secrets.
- Permanent enquiry deletion (owner only, Deleted enquiries) cannot be undone in the app; the only way back is a
  database backup, so keep the nightly backups below. Each purge is in the audit log as `PERMANENT_DELETE_ENQUIRY`.

## Docker

Not included, because the local workflow is XAMPP. If you containerise, use two images: the Spring Boot jar on
`eclipse-temurin:21-jre`, and Next.js with `output: "standalone"` on `node:22-alpine`. Pass every setting above as
environment variables and secrets, and run MySQL as a managed service or a separate container with a persistent volume.
