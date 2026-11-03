# Jovens Buzz — Website, API & Admin Dashboard

Marketing website, enquiry handling and admin dashboard for **Jovens Buzz**, a creative, strategic and
results-driven digital growth agency.

The repository root contains only the three projects. Commands below (`cd backend`, `cd frontend-next`) are run from
that root.

| Folder | What it is |
|---|---|
| `frontend-next/` | **Next.js 16 (App Router, TypeScript)** — public landing page, legal pages, SEO, admin dashboard, and a backend-for-frontend (BFF) auth proxy |
| `backend/` | **Spring Boot 3.3 (Java 17+)** REST API — MySQL via JPA/Flyway, Spring Security + JWT, Google Sheets sync, OpenAPI |
| `frontend/` | The original static HTML/Bootstrap landing page: the approved design and visual reference. Kept untouched; the Next.js homepage is a faithful migration of it |
| `frontend-next/docs/` | This overview, the deployment & security checklist and troubleshooting |
| `backend/docs/` | Database, SMTP and Google Sheets setup, API examples |

## Architecture

```
Browser ──► Next.js (localhost:3000)
  │           ├─ Public pages: server-rendered, cached (ISR), revalidated when admins edit content
  │           ├─ /admin/*: server-rendered per request; session checked server-side
  │           └─ /api/auth/*, /api/admin/*: BFF proxy — keeps the API token in an HttpOnly,
  │              SameSite=Strict cookie and forwards it as a Bearer header
  │
  └─ POST enquiry ──► Spring Boot API (localhost:8081) ──► MySQL `jovens_buzz` (system of record)
                         └─ background worker ──► Google Sheets (retries + no duplicate rows)
```

Key design decisions:

- **MySQL is the primary record.** An enquiry, its status history and its Google Sheets sync job are saved in one
  transaction. Sync runs *after* commit; a Sheets outage never loses or delays an enquiry.
- **Idempotent sync.** Jobs are claimed atomically (no double-processing), and the worker checks the sheet for the
  enquiry reference before appending, so retries never create duplicate rows. Failures retry with exponential
  backoff (1, 2, 4, 8, 16 min…), and jobs that failed only because Sheets wasn't configured catch up automatically
  once it is.
- **The token never reaches browser JavaScript.** The API authenticates only via `Authorization: Bearer`. The Next.js
  server holds the token in an HttpOnly cookie, so the API is not exposed to CSRF. State-changing proxy calls also
  require a custom header and a same-origin `Origin`.
- **Short-lived, revocable tokens.** Tokens last 60 minutes and are renewed while you're active. Logging out or changing
  your password bumps a per-user token version, which revokes every earlier token.

## Prerequisites (Windows)

- **XAMPP** with MySQL/MariaDB (tested with MariaDB 10.4 bundled with XAMPP 8.x)
- **Java 17 or newer** (tested on Java 25). Maven is not required; use the included wrapper `mvnw.cmd`
- **Node.js 20.9+** (tested on Node 24) and npm

## 1. Database setup (XAMPP)

1. Open **XAMPP Control Panel** and click **Start** next to **MySQL**. Apache is only needed if you want phpMyAdmin.
2. Open phpMyAdmin at http://localhost/phpmyadmin (start Apache first) and create the database:
   - **Databases** tab → name `jovens_buzz` → collation `utf8mb4_unicode_ci` → **Create**.
   - Or run `backend/scripts/init-database.sql` in the SQL tab. It also creates `jovens_buzz_test` for automated tests,
     and contains an optional least-privilege user.
   - Or from a terminal:
     `C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS jovens_buzz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`
3. **Do not create tables by hand.** Flyway creates and migrates them when the API starts
   (`backend/src/main/resources/db/migration`).
4. Note your MySQL credentials. XAMPP's default is user `root` with an **empty** password. If you set a password, put it
   in `DB_PASSWORD` below.

## 2. Backend (Spring Boot API)

```powershell
cd backend
copy .env.example .env      # then edit .env (see below)
.\mvnw.cmd spring-boot:run
```

`backend/.env` is git-ignored and loaded automatically; real environment variables take precedence over it. At
minimum, set:

| Variable | Local value |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `jovens_buzz` |
| `DB_USERNAME` / `DB_PASSWORD` | your XAMPP MySQL credentials (`root` / empty by default) |
| `JWT_SECRET` | a random base64 string ≥ 32 bytes (PowerShell: `[Convert]::ToBase64String((1..48 \| % { Get-Random -Max 256 }))`) |
| `BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD` | the first admin account (see step 4) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` |

The API runs on **http://localhost:8081**. Port 8081 is the default because 8080 is often taken on Windows; change it
with `PORT`. On first start you should see `Successfully applied … migrations` and `Started JovensBuzzApplication`.

- Health: http://localhost:8081/api/v1/health
- OpenAPI/Swagger UI: http://localhost:8081/swagger-ui.html (disable in production with `SWAGGER_ENABLED=false`)

To verify the tables, run `C:\xampp\mysql\bin\mysql.exe -u root jovens_buzz -e "SHOW TABLES;"`. You should see
`admin_users, audit_logs, enquiries, enquiry_notes, enquiry_status_history, faqs, flyway_schema_history,
integration_sync_jobs, services, site_content`.

## 3. Frontend (Next.js)

```powershell
cd frontend-next
copy .env.example .env.local
npm install
npm run dev            # development at http://localhost:3000
# or, production mode:
npm run build
npm run start
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (canonical links, sitemap, Open Graph). Use the real domain in production |
| `NEXT_PUBLIC_API_BASE_URL` | API URL the **browser** uses (enquiry form) |
| `API_INTERNAL_URL` | API URL the **Next.js server** uses (can be internal/private) |
| `CONTENT_REVALIDATE_SECONDS` | Background refresh interval for public content (admin edits apply immediately) |
| `BUSINESS_TIMEZONE` | Time zone for "today", "this month" and daily charts (default `America/Chicago`) |

## 4. Admin login (local bootstrap)

The first administrator is created **only when the `admin_users` table is empty**, from
`BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD`. For local development these are:

- Username: `jovens_buzz_2026`
- Password: `Jovensbuzz@2026`

Sign in at http://localhost:3000/admin/login. The password is stored only as a BCrypt hash. Owners set passwords
for every account (including their own) under **Users → Set new password**; there is no forced change. Passwords persist across restarts; the bootstrap never overwrites an existing account. With
`APP_PRODUCTION_MODE=true`, the API refuses to start with the default JWT secret or the documented dev password.

Five failed sign-ins lock the account for 15 minutes, and sign-in is rate limited per IP.

## 5. Email notifications (SMTP, optional)

Every saved enquiry queues two emails in the same database transaction: **"New Enquiry Received - Jovens Buzz"**
to `ADMIN_NOTIFICATION_EMAIL`, and **"Thank You for Contacting Jovens Buzz!"** to the visitor (with their reference,
selected service and the `CLIENT_RESPONSE_TIME` promise, default "within 24 hours"). Emails are sent in the
background after the enquiry is committed, so the form never waits for SMTP. Failures retry with backoff (1, 2, 4…
minutes, up to 6 attempts), and a sent email is never sent again.

Set these in `backend/.env` and restart the API:

```properties
SMTP_HOST=smtp.gmail.com            # or your provider (Microsoft 365: smtp.office365.com)
SMTP_PORT=587                       # STARTTLS
SMTP_USERNAME=you@yourdomain.com
SMTP_PASSWORD=app-password          # Gmail/Workspace: a 16-character App Password (needs 2-Step Verification)
SMTP_FROM_EMAIL=you@yourdomain.com  # usually must match the authenticated account or a verified alias
SMTP_FROM_NAME=Jovens Buzz
ADMIN_NOTIFICATION_EMAIL=team@yourdomain.com
CLIENT_SUPPORT_EMAIL=hello@yourdomain.com   # optional Reply-To on client emails
PUBLIC_SITE_URL=https://jovensbuzz.com
ADMIN_DASHBOARD_URL=https://jovensbuzz.com/admin
```

Without SMTP, enquiries still save normally and their emails wait as **Pending** ("SMTP is not configured"); they
send automatically once SMTP is configured. Delivery status and a **Retry unsent emails** button are on each
enquiry's page, and **Settings → Email (SMTP)** shows the configuration (never the password).

## 6. Google Sheets (optional)

Enquiries work without it. Until it's configured, each enquiry shows **Not synced** in the dashboard and is
retried automatically once it is. Setup steps: [backend/docs/GOOGLE_SHEETS_SETUP.md](../../backend/docs/GOOGLE_SHEETS_SETUP.md).

## Features

**Contact form** — the service dropdown is loaded live from the published services (`GET /api/v1/services`); the
phone field has a country selector (United States default, India, Canada, United Kingdom, Australia) validated per
country with libphonenumber on both frontend and backend and stored in E.164 with its ISO country; privacy consent
is required; success shows the "Your Buzz Starts Here." modal. The homepage Services section stays static.

**Public website (`/`)** — a component-by-component migration of the approved `frontend/index.html`: same markup,
class names, assets (`public/assets/`), Bootstrap 5.3, Bootstrap Icons, AOS and the original `style.css` (copied
verbatim to `src/styles/original/`). Every interaction from `js/main.js` (hero 3D intro and parallax, tilt cards,
3D scroll reveal, pinned process steps, services accordion, stat counters, FAQ accordion, mobile menu) is ported in
`components/home/HomeInteractions.tsx`. FAQs, contact details and the hero eyebrow come from the database (editable in
the admin). The "Let’s Talk !" form posts to the Spring Boot API and shows the enquiry reference on success.
`/privacy-policy` and `/terms` use the dashboard design system.

**SEO** — Metadata API titles/descriptions, canonical URLs from `NEXT_PUBLIC_SITE_URL`, Open Graph + Twitter cards
with a generated OG image, JSON-LD (Organization, WebSite, FAQPage; a Breadcrumb helper for future pages),
`robots.txt`, `sitemap.xml`, a custom 404 with correct status, and `noindex` plus `X-Robots-Tag` on all admin routes.
LocalBusiness markup is intentionally omitted until a verified street address exists.

**Admin dashboard (`/admin`)**

| Area | What it does |
|---|---|
| Overview | Live counts (total/new/contacted/qualified/converted/closed/today/this month), daily trend with 7/30/90-day ranges, conversion ring, service and status distribution, recent enquiries, sync alerts |
| Enquiries | Search (name/email/company/ID), filters (status, service, date range), server-side pagination and sorting, CSV export of the filtered set |
| Enquiry detail | Full details, validated status transitions with history, internal notes, assignment to an administrator, Google Sheets sync status and manual retry |
| Services / FAQs | Create, edit, hide or publish, delete. Changes revalidate the public site immediately |
| Website Content | Hero, About, Strategy and footer copy, contact details and social links, validated per field |
| Analytics | Custom date ranges with trend, service and status breakdowns that link through to filtered lists |
| Settings | Profile, password change, Google Sheets health (no secrets shown), bulk retry of failed syncs, audit log |

All metrics come from the database; nothing is estimated or invented.

## Tests

```powershell
# Backend: unit + MySQL integration tests (uses the separate jovens_buzz_test database, created automatically)
cd backend
.\mvnw.cmd test

# Frontend: component, validation, routing-helper and accessibility (axe) tests
cd frontend-next
npm test
npm run lint
npm run typecheck
```

The tests never call the real Google Sheets API; it is mocked in unit tests and unconfigured in the test profile.

## More documentation

- [backend/docs/DATABASE_SETUP.md](../../backend/docs/DATABASE_SETUP.md) — XAMPP MySQL setup, environment variables, Flyway migrations, troubleshooting
- [backend/docs/SMTP_SETUP.md](../../backend/docs/SMTP_SETUP.md) — Gmail App Password SMTP setup, Microsoft 365, troubleshooting
- [backend/docs/GOOGLE_SHEETS_SETUP.md](../../backend/docs/GOOGLE_SHEETS_SETUP.md) — service account and sharing setup, plus troubleshooting
- [backend/docs/API_EXAMPLES.md](../../backend/docs/API_EXAMPLES.md) — curl and PowerShell requests for every endpoint group
- [frontend-next/docs/DEPLOYMENT_AND_SECURITY.md](DEPLOYMENT_AND_SECURITY.md) — production checklist, HTTPS, secrets, backups, migrations
- [frontend-next/docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) — common local development errors
