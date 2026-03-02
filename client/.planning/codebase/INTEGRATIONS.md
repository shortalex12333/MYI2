# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**Database & Authentication:**
- Supabase - Full backend-as-a-service platform
  - SDK: `@supabase/supabase-js` (2.81.1) and `@supabase/ssr` (0.7.0)
  - Auth: `process.env.NEXT_PUBLIC_SUPABASE_URL`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Service role: `process.env.SUPABASE_SERVICE_ROLE_KEY`

**Web Scraping:**
- Robots.txt parser: `robots-parser` (3.0.1)
  - Respects robots.txt directives
  - Development mode bypass: `process.env.SCRAPER_DEV_MODE`
  - Rate limiting: Configurable per domain with timestamp tracking

**Content Sources (Internal Scraper):**
- Investopedia, BoatUS, The Boat Galley, Morgan's Cloud, Yachting Pages
- Marine insurance brokers: MarineIns, SuperYacht Insurance Brokers, Southeast Insure
- Insurers: Travelers, Allstate, Chubb
- Forums: Cruisers Forum, The Hull Truth, YBW, Sailing Anarchy, Trawler Forum, Reddit
- P&I Clubs: UK P&I Club
- Defined in `src/lib/scraper/sources.ts` with crawl frequency and priority

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: Authenticated via `NEXT_PUBLIC_SUPABASE_URL` and keys
  - Client: `@supabase/supabase-js` with `@supabase/ssr` wrapper
  - Server-side via cookies managed in `src/lib/supabase/server.ts`
  - Client-side via browser client in `src/lib/supabase/client.ts`

**File Storage:**
- Supabase Storage (configured for Supabase bucket access)
- Remote images allowed from `*.supabase.co` domains (Next.js image optimization)

**Caching:**
- Local filesystem cache for scraper (configurable directory in scraper config)
- Browser-based cookie caching via Supabase SSR wrapper
- No Redis/external cache detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: OAuth-ready authentication with email/password
  - Session management via secure cookies (handled by `@supabase/ssr`)
  - Email redirect callback: `/auth/callback` route at `src/app/auth/callback/route.ts`
  - User roles supported: guest, user, verified_user, broker_verified, insurer_verified, moderator, admin

**Protected Routes:**
- Auth context available at `src/contexts/AuthContext.tsx`
- User state includes: id, email, username
- Session refresh via `/api/v1/profile` endpoint

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or similar)

**Logs:**
- Console logging via `console.error()` and `console.log()`
- Health check endpoint: `GET /api/health` for database connectivity monitoring
- No structured logging framework detected

**Debugging:**
- Next.js dev mode: `npm run dev`
- Playwright test reports: Generated in `playwright-report/`

## CI/CD & Deployment

**Hosting:**
- Vercel (primary platform)
  - Configured via `vercel.json`
  - Build command: `next build`
  - Dev command: `next dev`
  - Install command: `npm install`

**CI Pipeline:**
- Playwright E2E tests with CI configuration
- Reporters: HTML report generation
- Retry policy: 2 retries in CI, 0 in development
- Workers: Serial (1 worker) in CI, parallel in development

**Scheduled Jobs:**
- Vercel Cron (configured in `vercel.json`):
  - Daily scraper: `0 2 * * *` (2 AM UTC) → `/api/cron/daily-scrape`
  - Paper publish: `0 7-18 * * *` (every hour 7 AM-6 PM UTC) → `/api/cron/paper-publish`
  - Auth: `Bearer ${process.env.CRON_SECRET}` header verification

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase instance URL (public, safe to expose)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (must be secret)
- `CRON_SECRET` - Bearer token for Vercel cron jobs

**Optional env vars:**
- `NEXT_PUBLIC_APP_URL` - Application base URL (defaults to http://localhost:3000)
- `SCRAPER_API_KEY` - API key for scraper endpoints (custom authentication)
- `ADMIN_API_KEY` - Admin operations API key
- `SCRAPER_DEV_MODE` - Set to `'true'` to skip robots.txt checks in development

**Secrets location:**
- `.env.local` file (not committed, listed in `.gitignore`)
- Vercel dashboard for production environment variables
- Service role key must never be exposed to client code

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` - OAuth/email callback from Supabase Auth
- `/api/cron/daily-scrape` - Vercel cron trigger (requires CRON_SECRET)
- `/api/cron/paper-publish` - Vercel cron trigger (requires CRON_SECRET)

**Outgoing:**
- Email redirects to `${NEXT_PUBLIC_APP_URL}/auth/callback` on signup
- Cron jobs invoke internal API endpoints (no external webhooks detected)

## API Routes (Internal)

**Authentication:**
- `POST /api/v1/auth/signup` - User registration with email/password
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signout` - User logout
- `GET /api/v1/profile` - Get current user profile

**Content Management:**
- `GET/POST /api/v1/posts` - Blog posts CRUD
- `GET /api/v1/posts/[id]` - Single post retrieval
- `POST /api/v1/comments` - Comment creation
- `POST /api/v1/reactions` - Post/comment reactions

**Scraper:**
- `POST /api/v1/scraper/init` - Initialize scraper with sources (auth required)
- `POST /api/v1/scraper/extract` - Extract content from URL (auth required)
- `POST /api/v1/scraper/batch` - Batch scraping operations (auth required)
- `POST /api/v1/scraper/review` - Content review/QA (auth required)
- `POST /api/v1/scraper/publish` - Publish scraped content (auth required)

**Data:**
- `GET /api/v1/categories` - Categories list
- `GET /api/v1/companies` - Companies list
- `GET /api/v1/companies/[id]` - Single company details
- `GET /api/v1/vessels` - User vessels list
- `POST /api/v1/bulk-import` - Bulk data import (admin only, auth required)

**Admin:**
- `POST /api/admin/backfill-company-contacts` - Backfill company contact data (requires ADMIN_API_KEY)

**Health:**
- `GET /api/health` - Application health check (tests database connectivity)

---

*Integration audit: 2026-03-02*
