# MyYachtsInsurance - QA Runbook

## Overview

This runbook provides step-by-step instructions for running QA tests, verifying database correctness, and troubleshooting the MyYachtsInsurance platform.

---

## Setup & Environment

### Prerequisites

- Node.js 18+ installed
- Supabase account (remote) or local Supabase instance
- Git installed
- Playwright browsers (auto-installed on first run)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

**Required variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SCRAPER_API_KEY=your_scraper_api_key
```

### Database Setup

#### Option 1: Use Remote Supabase

```bash
# Ensure your Supabase credentials are in .env.local
# No additional setup needed
```

#### Option 2: Use Local Supabase (Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Get local credentials and update .env.local
supabase status
```

### Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14.2.5
- Supabase SDK
- Playwright (test automation)
- TypeScript
- Tailwind CSS
- Form validation (Zod, React Hook Form)

---

## Building & Running

### Development Mode

```bash
npm run dev
```

Starts Next.js dev server on `http://localhost:3000` with hot-reload.

### Production Build

```bash
npm run build
```

Creates optimized production build in `.next/` directory. Verifies:
- All routes can be resolved
- TypeScript compiles correctly
- No dynamic server usage violations (warnings acceptable for API routes)

### Production Server

```bash
npm run build
npm start
```

Runs production build (faster than dev mode).

---

## Testing

### Health Check

Verify the app is running and database is connected:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2024-01-12T..."
}
```

### E2E Tests (Playwright)

**Install Playwright browsers (one-time):**

```bash
npx playwright install
```

**Run all tests:**

```bash
npm run test:e2e
```

**Run tests with UI (browser view):**

```bash
npm run test:e2e:ui
```

**Run specific test:**

```bash
npx playwright test e2e/auth.spec.ts
```

**Run tests in debug mode:**

```bash
npx playwright test --debug
```

**Test files:**

- `e2e/auth.spec.ts` - Authentication, navigation, route protection
- `e2e/content.spec.ts` - Content browsing, page loading, empty states

#### What Tests Cover

1. **Authentication**
   - Health endpoint
   - Home page loads
   - Signup/Login pages are accessible
   - Navigation works from home
   - Protected routes are blocked for unauth users

2. **Content Browsing**
   - All public pages load without errors
   - Posts, categories, companies pages render
   - Knowledge base loads
   - FAQ, contact, terms, privacy pages work
   - Back button preserves state
   - Search input is present
   - No console errors on empty states

#### Test Results

Tests automatically generate HTML report at `playwright-report/index.html`. Open in browser to view:

```bash
npx playwright show-report
```

### Link Integrity Check

Crawls the site to verify all internal links work:

```bash
npm run check:links
```

**What it checks:**

- Crawls all public routes from home
- Follows internal links up to 100 pages
- Verifies each link returns 200 status
- Reports broken links (404, 500, timeouts)
- Tracks referrer (which page the broken link was on)

**Expected output:**

```
═══════════════════════════════════════════════════════════
LINK INTEGRITY REPORT
═══════════════════════════════════════════════════════════
Total pages crawled: 15
External links found: 42
Broken links: 0

✅ All internal links are working!
═══════════════════════════════════════════════════════════
```

---

## Database Schema Verification

### Verify Tables Exist

Connect to your Supabase database using the SQL editor:

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected tables:**

- profiles
- posts
- comments
- reactions
- post_tags
- categories
- tags
- companies
- vessels
- locations
- follows
- notifications
- faqs
- qa_entries
- qa_candidates
- sources
- scrape_runs

### Verify Key Columns

```sql
-- Check profiles table has required columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' ORDER BY ordinal_position;
```

**Expected columns in profiles:**

- id (uuid)
- email (text)
- username (text)
- bio (text)
- role (user_role enum)
- reputation (integer)
- yachts_owned (integer)
- primary_vessel (text)
- created_at (timestamp)
- updated_at (timestamp)

### Verify Row-Level Security (RLS)

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### Test RLS Policies

```sql
-- Verify public profiles can be read
SELECT * FROM profiles LIMIT 1;

-- Verify users can only edit their own profile
-- (This requires being authenticated as a specific user in the client)
```

---

## Common Issues & Troubleshooting

### Issue: Build fails with "Dynamic server usage" error

**Symptom:**
```
Dynamic server usage: Route /api/v1/categories couldn't be
rendered statically because it used `cookies`.
```

**Solution:** This is a warning, not an error. API routes that use `cookies()` for session validation must be dynamic. Build completes successfully.

### Issue: "SUPABASE_SERVICE_ROLE_KEY not defined"

**Symptom:**
```
Error: SUPABASE_SERVICE_ROLE_KEY is not defined
```

**Solution:**
1. Ensure `.env.local` has the key set
2. Restart dev server: `npm run dev`
3. Verify with: `echo $SUPABASE_SERVICE_ROLE_KEY`

### Issue: Tests fail with "Connection refused"

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:**
1. Ensure dev server is running: `npm run dev` (in another terminal)
2. Wait 3 seconds for server to fully start
3. Run tests again: `npm run test:e2e`

### Issue: Playwright tests timeout

**Symptom:**
```
TimeoutError: Waiting for locator failed: Timeout 30000ms exceeded
```

**Solution:**
1. Ensure network is not congested
2. Increase timeout in `playwright.config.ts`: change `timeout: 30000` to `60000`
3. Check if page actually loaded: add `await page.screenshot()` to debug

### Issue: Database connection error in health check

**Symptom:**
```
{"status": "degraded", "database": "disconnected", ...}
```

**Solution:**
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active (not paused)
3. Test connection: `curl $NEXT_PUBLIC_SUPABASE_URL`
4. Restart dev server to reconnect

### Issue: Onboarding fails silently

**Symptom:** Clicking "Complete Setup" does nothing, no error in console.

**Solution:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Attempt onboarding again
4. Check if `/api/v1/profile` and `/api/v1/vessels` return errors
5. Verify Supabase session is valid

---

## Manual Testing Checklist

Use this checklist for manual QA when code changes:

### Authentication & User Setup

- [ ] User can navigate to signup page
- [ ] Signup form validates email
- [ ] Signup form validates password (min length)
- [ ] Signup creates user in Supabase auth
- [ ] User is redirected to onboarding after signup
- [ ] Onboarding form accepts bio, yacht count, vessel name
- [ ] Onboarding saves profile data
- [ ] Onboarding can add multiple vessels
- [ ] User is redirected to home after onboarding

### Navigation & Page Loading

- [ ] Header displays on all pages
- [ ] Logo links to home
- [ ] All navbar links work
- [ ] Search bar is present (doesn't need to work)
- [ ] Auth links change based on login state
- [ ] No console errors on any page
- [ ] No layout shifts when loading
- [ ] Mobile view is responsive

### Content Pages

- [ ] Posts page loads with or without posts
- [ ] Categories page displays
- [ ] Companies page displays
- [ ] Knowledge base displays Q&A entries
- [ ] FAQ section loads
- [ ] Contact page has form
- [ ] Terms page loads
- [ ] Privacy page loads

### Database & Data Integrity

- [ ] New posts appear immediately after creation
- [ ] Comments appear immediately after posting
- [ ] Vote counts update correctly
- [ ] Bookmarks persist after refresh
- [ ] User profile data persists
- [ ] Session persists across browser refresh

### Admin Features

- [ ] Q&A Review page loads (with valid API key)
- [ ] Bulk import page loads (with valid API key)
- [ ] Invalid API key blocks access

---

## Continuous Integration (CI/CD)

### GitHub Actions Setup

Add `.github/workflows/qa.yml`:

```yaml
name: QA Tests

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run lint

  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Performance & Monitoring

### Lighthouse Audit

```bash
# Build for production
npm run build

# Run Lighthouse (requires Chrome installed)
npx lighthouse http://localhost:3000 --output=json
```

Target scores:

- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Bundle Size Analysis

```bash
npm run build -- --analyze
```

Check Next.js output for chunk sizes. Each route should be < 200KB.

### Database Performance

Monitor slow queries in Supabase dashboard:

```
Dashboard → Logs → Slow Queries
```

Queries should complete in < 100ms for data retrieval.

---

## Release Checklist

Before deploying to production:

- [ ] `npm run build` passes without errors
- [ ] `npm run test:e2e` passes all tests
- [ ] `npm run check:links` reports no broken links
- [ ] No critical security warnings: `npm audit`
- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Supabase RLS policies reviewed
- [ ] Analytics tracking configured
- [ ] Error monitoring configured
- [ ] CDN cache cleared (if applicable)

---

## Support & Debugging

### Enable Debug Logging

```bash
# In your terminal before running dev server
DEBUG=* npm run dev
```

### View Supabase Logs

Supabase Dashboard → Logs → API Usage

### Check API Response Times

Supabase Dashboard → Database → Monitoring

### Test API Manually

```bash
# Health check
curl http://localhost:3000/api/health

# Get posts (requires running server)
curl http://localhost:3000/api/v1/posts

# Get categories
curl http://localhost:3000/api/v1/categories
```

---

## Version History

| Date       | Version | Changes |
|------------|---------|---------|
| 2024-01-12 | 0.1.0   | Initial QA runbook, E2E tests, link checker |
| -          | -       | -       |

---

## Contact & Questions

For issues or questions:

1. Check this runbook first
2. Check GitHub issues
3. Contact engineering team

---

Generated: 2024-01-12
Last Updated: 2024-01-12
Maintained By: QA/Engineering Team
