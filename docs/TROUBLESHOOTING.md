# Troubleshooting (local development)

| Symptom | Cause & fix |
|---|---|
| `Communications link failure` / `Connection refused` on API start | MySQL isn't running. Start it in the XAMPP Control Panel and check port 3306: `netstat -ano \| findstr :3306` |
| `Access denied for user 'root'@'localhost'` | Wrong `DB_USERNAME`/`DB_PASSWORD` in `backend/.env`. XAMPP's default root password is empty (`DB_PASSWORD=`) |
| `Unknown database 'jovens_buzz'` | Create it ([README step 1](README.md#1-database-setup-xampp)) or run `backend/scripts/init-database.sql` |
| XAMPP MySQL stops immediately | Another MySQL service is using 3306, or the data folder is damaged. Check `C:\xampp\mysql\data\mysql_error.log`, or stop the other service in `services.msc` |
| `Port 8081 was already in use` | Set another port (`PORT=8082` in `backend/.env`) and update `NEXT_PUBLIC_API_BASE_URL` and `API_INTERNAL_URL` |
| `Port 3000 is in use` | `npm run dev -- -p 3001`, then add `http://localhost:3001` to `CORS_ALLOWED_ORIGINS` and update `NEXT_PUBLIC_SITE_URL` |
| `Validate failed: Migrations have failed validation` / checksum mismatch | An applied migration file was edited. Revert the edit and add a new `V{n}` migration instead. On a disposable local DB only, you can drop and recreate `jovens_buzz` |
| `Schema-validation: missing column …` | The DB is behind the code. Restart the API so Flyway applies pending migrations, and check `flyway_schema_history` for failed rows |
| API starts but no admin can sign in on a fresh DB | `BOOTSTRAP_ADMIN_USERNAME`/`PASSWORD` were empty on first start. Set them and restart; the bootstrap runs only when `admin_users` is empty |
| Forgot the admin password (local) | Delete the row (`DELETE FROM admin_users WHERE username='jovens_buzz_2026';`) and restart with the bootstrap variables set. Never do this in production without a backup |
| "Too many failed sign-in attempts" | The account is locked for 15 minutes after 5 failures. Wait, or locally run `UPDATE admin_users SET locked_until=NULL, failed_login_attempts=0;` |
| Enquiry form: "We couldn't reach our server" | API not running, or `NEXT_PUBLIC_API_BASE_URL` is wrong. Rebuild/restart Next.js after changing `NEXT_PUBLIC_*` values, because they're inlined at build time |
| Browser console: blocked by CORS policy | The site origin isn't in `CORS_ALLOWED_ORIGINS` (exact scheme, host and port; no trailing slash). Restart the API |
| Enquiry form: "You've sent several enquiries in a short time" | Per-IP rate limit (5 per 10 min). Wait, or raise `RATE_LIMIT_ENQUIRY_MAX` locally |
| Dashboard shows "The Jovens Buzz API is not reachable" | `API_INTERNAL_URL` is wrong or the API is down. Check http://localhost:8081/api/v1/health |
| Redirected to login after ~1 hour idle | Expected: tokens last `JWT_EXPIRATION_MS` (60 min) and are renewed only while you're active |
| Content edits don't appear on the website | Edits through the dashboard revalidate immediately. Edits made directly in the DB/API appear after `CONTENT_REVALIDATE_SECONDS`. In `npm run dev`, refresh the page |
| Enquiry shows "Not synced" | Google Sheets isn't configured or failed; see [backend/docs/GOOGLE_SHEETS_SETUP.md](../../backend/docs/GOOGLE_SHEETS_SETUP.md). The enquiry itself is safe in MySQL |
| `mvnw.cmd` says `JAVA_HOME not found` | Install a JDK 17+ and set `JAVA_HOME` to its folder (not `\bin`). Restart the terminal |
| Backend tests fail connecting to MySQL | Tests use `jovens_buzz_test` on the same server (created automatically). Start XAMPP MySQL, or set `TEST_DB_URL`/`TEST_DB_USERNAME`/`TEST_DB_PASSWORD` |
| `npm install` warns about blocked install scripts (`allow-scripts`) | Safe to ignore for this project; the required native binaries ship as optional dependencies |
| `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` | A font was switched back to `next/font/google`, whose build-time download times out on slow networks. Fonts are self-hosted in `frontend-next/src/fonts/` via `next/font/local`; keep it that way |
| Emails stay "Pending — SMTP is not configured" | Set `SMTP_HOST` and `SMTP_FROM_EMAIL` (plus username/password) in `backend/.env` and restart the API; pending emails send within a minute |
| Admin email pending "ADMIN_NOTIFICATION_EMAIL is not configured" | Set `ADMIN_NOTIFICATION_EMAIL` and restart, then click **Retry unsent emails** on the enquiry |
| `AuthenticationFailedException` / `535 5.7.8` in the email error | Wrong SMTP username/password. Gmail and Microsoft 365 need an App Password (or SMTP AUTH enabled for the mailbox) |
| `553/550 sender not allowed` in the email error | `SMTP_FROM_EMAIL` must be the authenticated mailbox or a verified alias/domain at your provider |
| Connection timeouts to the SMTP host | Port 587 is blocked by a firewall/ISP; use your provider's alternative port (465 needs `SMTP_STARTTLS=false` and `spring.mail.properties.mail.smtp.ssl.enable=true`) |
| Form says "Please enter a valid … phone number" | The number is checked against the selected country (the US and Canada share +1 but have different area codes) |
| Contact form shows "We couldn’t load our services" | The browser can't reach `GET /api/v1/services`: check the API is running and `NEXT_PUBLIC_API_BASE_URL` / `CORS_ALLOWED_ORIGINS` |
