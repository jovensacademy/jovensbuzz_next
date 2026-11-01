# Jovens Buzz — Web (Next.js 16)

Public website, SEO, admin dashboard and backend-for-frontend auth proxy. Setup, environment variables and the full
project overview are in the [project README](docs/README.md).

```powershell
copy .env.example .env.local
npm install
npm run dev        # http://localhost:3000  (API expected at http://localhost:8081)
npm test           # Vitest + Testing Library + axe
npm run lint
npm run typecheck
npm run build && npm run start
```

## Structure

```
src/
  app/
    (home)/              ROOT LAYOUT 1 — marketing homepage "/" (Bootstrap + original style.css)
    (site)/              ROOT LAYOUT 2 — privacy-policy, terms, admin/* (dashboard design system)
    global-not-found.tsx 404 for unmatched URLs (needed with two root layouts)
    api/auth/*           login/logout: exchange credentials for an HttpOnly session cookie
    api/admin/[...path]  authenticated proxy to the API (CSRF checks, token refresh, cache revalidation)
    robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg
  proxy.ts               optimistic /admin gate + sliding token renewal (Next 16 "proxy", formerly middleware)
  components/home/       homepage sections migrated from frontend/index.html + HomeInteractions (main.js port)
  components/            layout (header/footer for legal pages), sections/ServiceIcon (admin), ui
  styles/original/       style.css copied verbatim from frontend/css (only url() paths changed) + additions.css
  features/              admin shell & charts, enquiries, content managers, settings
  lib/                   api clients, auth helpers, seo, enquiry payload mapping, config
public/assets/           original frontend/assets (same file names)
```

The homepage and the dashboard are **separate root layouts** so Bootstrap and the landing-page CSS never load on
admin pages (navigating between them is a full page load, by design).

Caching: public pages use tagged `fetch` with `revalidate` (ISR). Saving services, FAQs or content in the dashboard
calls `revalidateTag`, so the change appears on the next request. Admin pages always render on demand with
`no-store` and are never indexed.

To add a page later (e.g. `/services/[slug]`, `/blog`), create it under `src/app/(home)/` to reuse the original
landing-page styles and components (or `src/app/(site)/(public)/` for the dashboard style), add it to `sitemap.ts`, and use `breadcrumbJsonLd` from `lib/seo/structured-data.ts`.
