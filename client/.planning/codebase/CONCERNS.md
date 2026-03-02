# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

**TypeScript Type Safety Issues:**
- Issue: `next.config.js` sets `typescript.ignoreBuildErrors: true`, suppressing all TypeScript errors during build
- Files: `/Users/celeste7/Documents/MYI2/client/next.config.js`
- Impact: Build-time type errors go undetected; developers rely on editor warnings which may be missed; regressions in type safety will deploy to production silently
- Fix approach: Remove `ignoreBuildErrors: true`, fix all underlying TypeScript errors incrementally, use TypeScript strict mode

**Explicit Type Bypass Comments:**
- Issue: Multiple files use `@ts-ignore` comments instead of proper type fixes
- Files:
  - `src/app/faq/page.tsx` (line 1 comment about Supabase type inference)
  - `src/app/api/v1/companies/route.ts` (type inference bypass)
  - `src/app/api/v1/companies/[id]/route.ts` (blanket ts-ignore)
  - `src/categories/page.tsx` (Supabase type inference issue)
- Impact: Hidden type mismatches; future code changes may break assumptions; makes refactoring dangerous
- Fix approach: Understand actual Supabase return types, define proper interfaces instead of `any`

**Widespread Use of `any` Type:**
- Issue: 7 instances of `any[]` arrays plus multiple component state using `any` (e.g., `useState<any>([])`)
- Files:
  - `src/app/posts/new/page.tsx` (categories typed as `any[]`)
  - `src/app/posts/[id]/page.tsx` (multiple `any` casts)
  - `src/app/admin/qa-review/page.tsx` (state typed as `any`)
  - `src/app/admin/bulk-import/page.tsx` (result state as `any`)
  - `src/app/knowledge/page.tsx` (entities as `any`)
- Impact: Lost type safety at component boundaries; autocomplete fails; refactoring cannot detect breakage
- Fix approach: Define explicit interfaces for each data structure; export shared types from `src/types/`

---

## Security Concerns

**API Key Validation Too Permissive:**
- Issue: `src/app/api/v1/scraper/_utils/auth.ts` verifies API key length only (minimum 20 chars), accepts any non-empty string as valid
- Files: `src/app/api/v1/scraper/_utils/auth.ts` (lines 15-29), `src/app/api/v1/scraper/init/route.ts` (line 17)
- Impact: Invalid/fake API keys pass header validation and attempt database operations; relies entirely on Supabase RLS (row-level security) to reject invalid keys; no early rejection
- Fix approach: Validate API key format (JWT prefix, expiration if applicable); maintain allowlist of valid keys in database or secure store; add rate limiting per key

**Service Role Key Exposure in Environment:**
- Issue: `SUPABASE_SERVICE_ROLE_KEY` used directly in API routes for data mutations; multiple environment variable fallbacks (`SERVICE_ROLE`, `SUPABASE_SERVICE_KEY`)
- Files:
  - `src/app/api/v1/auth/signup/route.ts` (line 55 uses SERVICE_ROLE or SUPABASE_SERVICE_ROLE_KEY)
  - `src/app/api/v1/companies/route.ts` (multiple fallback keys)
  - `src/app/api/v1/bulk-import/route.ts` (uses passed API key as Supabase key)
  - `src/app/api/v1/scraper/batch/route.ts`
  - `src/app/api/cron/paper-publish/route.ts`
- Impact: If `.env` is compromised, all database operations are compromised; multiple key names increases attack surface; no audit trail of which key was used
- Fix approach: Use only `SUPABASE_SERVICE_ROLE_KEY`, never accept user-supplied API key as Supabase credential, implement key rotation policy, consider using Supabase's built-in service keys

**Admin Routes Without Role Verification:**
- Issue: `src/app/admin/qa-review/page.tsx` and `src/app/admin/bulk-import/page.tsx` are accessible via client-side credential checking only
- Files:
  - `src/app/admin/qa-review/page.tsx` (client-side input of SCRAPER_API_KEY)
  - `src/app/admin/bulk-import/page.tsx`
- Impact: No server-side role validation; authenticated users can attempt admin operations; relies on client-side secrecy of API key; compromised client can bypass protection
- Fix approach: Implement server-side role check in API routes; use session-based admin verification instead of API key reentry; implement proper RBAC (Role-Based Access Control)

**Missing CORS and CSRF Protection:**
- Issue: No explicit CORS configuration in `next.config.js`; no CSRF token validation in state-changing operations
- Files: `next.config.js`, all POST/PUT/DELETE routes
- Impact: API endpoints may be callable from any origin; state-changing requests (create post, delete comment) lack CSRF protection
- Fix approach: Configure explicit CORS allowlist, add CSRF token to form submissions, use SameSite cookies

---

## Performance Bottlenecks

**Multiple Supabase Queries Per Page Load:**
- Issue: `src/app/posts/[id]/page.tsx` makes separate queries for posts, comments, and nested comment structure
- Files: `src/app/posts/[id]/page.tsx` (lines 19-50)
- Impact: 2+ round-trips to database per post view; nested comment rendering loops through arrays twice (lines 56-69); high latency on slow networks
- Improvement path: Use single query with nested `select()` to fetch posts + comments + authors in one request; preload author data in database join

**Force-Dynamic Pages Impact on CDN Caching:**
- Issue: `src/app/papers/page.tsx`, `src/app/topics/page.tsx`, `src/app/topics/[slug]/page.tsx` all set `export const dynamic = 'force-dynamic'`
- Files:
  - `src/app/papers/page.tsx`
  - `src/app/topics/page.tsx`
  - `src/app/topics/[slug]/page.tsx`
- Impact: Pages re-render on every request; cannot be cached by CDN or edge networks; increases server load and TTFB (Time To First Byte)
- Improvement path: Use ISR (Incremental Static Regeneration) with `revalidate` for acceptable staleness window; trigger revalidation on content updates

**N+1 Query Risk in Comment Threading:**
- Issue: `src/app/posts/[id]/page.tsx` (lines 56-69) builds comment tree client-side with nested lookups
- Files: `src/app/posts/[id]/page.tsx`
- Impact: If comments table grows large, in-memory tree construction becomes expensive; `commentMap.get()` lookups scale poorly
- Improvement path: Sort comments server-side by `parent_id`; use cursor-based pagination; return pre-calculated nesting structure from API

---

## Fragile Areas

**Auth Flow Lacking Logout Propagation:**
- Issue: `src/contexts/AuthContext.tsx` implements `signOut()` but does not handle session invalidation across tabs
- Files: `src/contexts/AuthContext.tsx` (lines 33-35)
- Impact: User logs out in one tab but remains authenticated in another; multiple profile refresh calls may hit stale cache; vulnerable to session fixation
- Safe modification: Implement `useEffect` to listen to storage events (logout in another tab); add `Cache-Control: no-store` to profile endpoint
- Test coverage: E2E test for multi-tab logout (logged in Tab 1, log out in Tab 2, verify Tab 1 detects logout)

**Supabase Client Initialization Repeated in API Routes:**
- Issue: Every API route re-creates Supabase client with `createServerClient()` or `createClient()`
- Files:
  - `src/app/api/v1/auth/signup/route.ts` (lines 18-32)
  - `src/app/api/v1/profile/route.ts` (lines 8-23, 55-70)
  - `src/app/api/v1/posts/route.ts`
  - Multiple other routes
- Impact: Duplicated boilerplate; initialization bugs propagate across codebase; cookie handling inconsistency between routes
- Safe modification: Create `src/lib/supabase/server.ts` with factory function that handles cookies, reuse across all routes
- Test coverage: Unit test that verifies all routes use consistent client initialization

**Type Casting with `as any` Bypasses Safety:**
- Issue: `src/app/faq/page.tsx` (line 20) uses `.reduce((acc: any, ...)` to build category map
- Files: `src/app/faq/page.tsx`
- Impact: Object shape assumptions not validated; adding/removing properties in FAQs will not trigger type errors
- Safe modification: Define `interface FAQsByCategory { [category: string]: FAQ[] }` and type the accumulator explicitly
- Test coverage: Test with missing/unexpected FAQ properties to verify type safety

**Missing Error Recovery in Async Operations:**
- Issue: `src/contexts/AuthContext.tsx` (line 26) catches all errors silently with empty `catch` block
- Files: `src/contexts/AuthContext.tsx` (lines 26-27)
- Impact: Network failures, server errors, auth failures all treated the same (set user to null); no user feedback; difficult to debug
- Safe modification: Distinguish between auth errors (401 Unauthorized), server errors (500), and network errors; log errors for monitoring
- Test coverage: E2E test for profile endpoint returning 500; verify user sees appropriate error message

---

## Missing Critical Features

**No Audit Logging for Admin Operations:**
- Issue: Admin routes (`src/app/admin/qa-review/page.tsx`, `src/app/admin/bulk-import/page.tsx`) do not log who performed what action
- Files: Admin routes and their API consumers
- Impact: Cannot trace bulk imports back to user; no accountability for QA approvals/rejections; compliance risk
- Blocking: Regulatory audits; user investigation of data changes
- Fix approach: Create `audit_logs` table, record user ID + action + timestamp in all admin operations

**No Cron Job Execution Monitoring:**
- Issue: `src/app/api/cron/daily-scrape.ts` and `src/app/api/cron/paper-publish/route.ts` use console.log only
- Files:
  - `src/app/api/cron/daily-scrape.ts`
  - `src/app/api/cron/paper-publish/route.ts`
- Impact: Failed cron jobs go unnoticed; no alerting; data may not be published/scraped on schedule; debugging requires log access
- Blocking: Production monitoring; data refresh reliability
- Fix approach: Send cron status to monitoring service (Sentry, DataDog, custom); implement health check endpoint

**Missing Email Verification Enforcement:**
- Issue: Signup flow creates profile immediately regardless of email confirmation status
- Files: `src/app/api/v1/auth/signup/route.ts` (lines 50-72 creates profile regardless of auth state)
- Impact: Unverified emails can access full platform; spam accounts possible; GDPR compliance risk
- Fix approach: Add `email_verified` flag to profiles table; gate features behind verification check

---

## Test Coverage Gaps

**E2E Tests Marked as Skipped:**
- Issue: `e2e/auth-flow.spec.ts` uses `test.describe.skip()` - entire authentication flow test is disabled
- Files: `e2e/auth-flow.spec.ts` (line 3)
- Impact: Authentication changes are not caught by automated tests; can deploy broken auth without detection
- Risk: High - auth is foundational to platform security
- Priority: **Critical**
- Fix approach: Remove `.skip()`, ensure admin-create-user endpoint exists in all environments, run E2E suite in CI

**Missing Tests for Admin Operations:**
- Issue: No E2E tests for bulk import or QA review workflows
- Files: No test coverage for `src/app/admin/*`
- Impact: Admin bugs deploy untested; data corruption from bad imports goes unnoticed
- Risk: Medium - affects content quality but not core app functionality
- Priority: **High**
- Fix approach: Add E2E tests for bulk import success/failure cases, QA review approval/rejection

**Missing Tests for Error Scenarios:**
- Issue: E2E tests cover happy path; no tests for network failures, server errors (500), database errors
- Files: `e2e/*.spec.ts`
- Impact: Unexpected error handling paths untested; UI crashes on error responses; no error boundary testing
- Risk: Medium - users see broken UI in production
- Priority: **High**
- Fix approach: Add tests for profile endpoint returning 500, bulk import with invalid data, API timeouts

**No Integration Tests for Database Constraints:**
- Issue: No tests verify foreign key constraints, unique constraints, or RLS policies
- Files: No integration test suite
- Impact: Data integrity issues slip through; RLS misconfigurations go undetected; can violate foreign key constraints
- Risk: High - data corruption possible
- Priority: **Critical**
- Fix approach: Create integration test suite with real Supabase instance; test RLS with different user roles

---

## Scaling Limits

**Synchronous Paper Publishing via Cron:**
- Issue: `src/app/api/cron/paper-publish/route.ts` publishes papers synchronously in cron job
- Files: `src/app/api/cron/paper-publish/route.ts`
- Current capacity: ~50 papers/day (guess based on typical cron window)
- Limit: Cron job timeout (900s on Vercel) = max ~5 minutes work; if paper publishing takes 2s/paper, max 150 papers in 5-minute window
- Scaling path: Queue paper publishing jobs asynchronously (use Bull, AWS SQS); implement retry logic for failed publishes

**N+1 Risk if User Base Grows:**
- Issue: `src/app/posts/[id]/page.tsx` fetches comments then loops to build tree in memory
- Files: `src/app/posts/[id]/page.tsx`
- Current capacity: ~1000 comments per post (memory becomes issue; rendering becomes slow)
- Limit: If single post reaches 10,000 comments, page will timeout or crash
- Scaling path: Implement comment pagination; fetch top-level comments only, lazy-load replies; consider materialized view for comment trees

---

## Dependencies at Risk

**Supabase SDK Version Mismatch:**
- Issue: Multiple files check for different environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE`, `SUPABASE_SERVICE_KEY`)
- Files: `src/app/api/v1/auth/signup/route.ts`, `src/app/api/v1/companies/route.ts`, `src/app/api/cron/paper-publish/route.ts`
- Risk: Inconsistent key names could lead to silent failures or security gaps
- Impact: Code depends on which env var is set; migrating to new naming requires coordinating across multiple files
- Migration plan: Standardize on single `SUPABASE_SERVICE_ROLE_KEY`, remove all fallbacks, update deployment instructions

**Unspecified Playwright Version Vulnerability:**
- Issue: `package.json` pins `@playwright/test` to `^1.40.1` (from January 2024)
- Files: `package.json`
- Risk: 1.40.1 is ~14 months old; no known vulnerabilities but missing browser engine updates
- Impact: Browser compatibility issues if Playwright patch required; E2E tests may not represent modern browser behavior
- Migration plan: Update to `^1.45.0` (latest stable), run full E2E suite on upgrade, review breaking changes

---

## Known Issues

**Slow Post Detail Page Load (Unconfirmed):**
- Symptoms: Posts with many comments (100+) may load slowly
- Files: `src/app/posts/[id]/page.tsx`
- Trigger: Navigate to post with high comment count
- Workaround: Use browser DevTools to verify if bottleneck is database query or rendering
- Root cause: Client-side tree building; no pagination on comments

**API Route Cookie Management Inconsistency:**
- Symptoms: Some routes lose session context between requests
- Files: Multiple API routes using `createServerClient` vs `createClient`
- Trigger: Logout followed by immediate profile fetch; may return 401 in some routes, 200 in others
- Workaround: Clear all cookies manually in browser
- Root cause: Different cookie handling strategies across routes; `cookies()` async function not always awaited correctly

---

## Recommendations (Priority Order)

1. **Remove TypeScript `ignoreBuildErrors` setting** - Currently hiding all type errors; blocks path to type safety
2. **Skip E2E auth-flow test is ACTIVE** - Re-enable `e2e/auth-flow.spec.ts` by removing `.skip()`
3. **Define shared type interfaces** - Replace `any` with explicit types; extract to `src/types/`
4. **Standardize Supabase client initialization** - Create `src/lib/supabase/middleware.ts` to share cookie handling logic
5. **Implement audit logging for admin operations** - Add database table + logging middleware
6. **Add integration tests for RLS policies** - Verify row-level security works as expected
7. **Consolidate environment variable names** - Pick single naming convention for Supabase keys
8. **Implement cron job monitoring** - Send status to external service (Sentry, DataDog)

---

*Concerns audit: 2026-03-02*
