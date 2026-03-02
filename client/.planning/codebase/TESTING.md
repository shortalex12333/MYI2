# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Playwright `1.40.1` - End-to-end testing framework
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright's built-in expect() API

**Run Commands:**
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui          # Run E2E tests with UI
```

## Test File Organization

**Location:**
- E2E tests stored in `e2e/` directory at project root
- Pattern: Separate from source code, co-located at project level
- No unit test framework detected (no Jest, Vitest, or similar)

**Naming:**
- Pattern: `[feature].spec.ts`
- Examples: `auth.spec.ts`, `content.spec.ts`, `auth-flow.spec.ts`

**Structure:**
```
client/
├── e2e/
│   ├── auth.spec.ts
│   ├── auth-flow.spec.ts
│   └── content.spec.ts
└── playwright.config.ts
```

## Playwright Configuration

**Location:** `playwright.config.ts`

**Key Settings:**
```typescript
{
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  baseURL: 'http://localhost:3000',
  trace: 'on-first-retry'
}
```

**Browsers:**
- Chromium (Desktop)
- Firefox (Desktop)

**Web Server:**
- Auto-starts via `npm run dev`
- URL: `http://localhost:3000`
- Reuses existing server in non-CI environments

## Test Structure

**Suite Organization:**

Tests use `test.describe()` to group related tests:

```typescript
test.describe('Authentication & User Flows', () => {
  test('Health endpoint is working', async ({ request }) => {
    // ...
  })

  test('Can visit home page', async ({ page }) => {
    // ...
  })
})
```

**Patterns:**

1. **Setup:** Tests automatically receive fixtures (`page`, `request`, etc.) from Playwright
2. **Navigation:** Use `page.goto(url)` to navigate
3. **Assertions:** Use `await expect()` with Playwright matchers
4. **Waits:** Use `page.waitForNavigation()`, `page.waitForTimeout()` for synchronization
5. **Teardown:** Automatic cleanup via Playwright context isolation

## Test Types

**E2E Tests (Primary):**
- Scope: Full user workflows across pages and features
- Approach: Real browser, real backend, real database
- Examples in codebase:
  - `auth.spec.ts`: Authentication flows, navigation, protected routes
  - `content.spec.ts`: Page loads, content browsing, navigation

**Health Checks:**
- Pattern: Verify API endpoints return expected status codes
- Example from `auth.spec.ts`:
  ```typescript
  test('Health endpoint is working', async ({ request }) => {
    const response = await request.get('/api/health')
    const status = response.status()
    const data = await response.json().catch(() => ({}))
    if (status === 200) {
      expect(data.status).toBe('healthy')
    }
  })
  ```

**Navigation Tests:**
- Verify links work correctly
- Test back/forward button behavior
- Check page titles and headings

**Skipped Tests:**
- `auth-flow.spec.ts` marked with `test.describe.skip()` - currently disabled for local development

## Common Testing Patterns

**Soft Assertions (Graceful Failures):**

Tests avoid being environment-dependent by using soft checks:

```typescript
test('Posts page loads and displays content', async ({ page }) => {
  await page.goto('/posts')

  // Try multiple selectors; pass if ANY exist
  const postsList = page.locator('[data-testid="posts-list"]')
  const noPosts = page.locator('text=/no questions|no posts|empty/i')
  const anyHeading = page.locator('h1, h2').first()

  if (await postsList.count()) {
    await expect(postsList).toBeVisible()
  } else if (await noPosts.count()) {
    await expect(noPosts.first()).toBeVisible()
  } else if (await anyHeading.count()) {
    await expect(anyHeading).toBeVisible()
  }
})
```

**Request API Testing:**

Making direct API calls without page navigation:

```typescript
test('Health endpoint is working', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const data = await response.json()
  expect(data.status).toBe('healthy')
})
```

**Console Error Monitoring:**

Detect and track console errors during tests:

```typescript
test('Empty state is clean (no console errors)', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  await page.goto('/knowledge')

  const criticalErrors = errors.filter(
    (e) => !e.includes('react') && !e.includes('next') && !e.includes('supabase')
  )
  expect(criticalErrors.length).toBeLessThanOrEqual(1)
})
```

**Conditional Navigation:**

Handle optional elements gracefully:

```typescript
test('Can navigate back from posts detail', async ({ page }) => {
  await page.goto('/posts')

  const postLink = page.locator('a[href*="/posts/"]').first()
  const postCount = await postLink.count()

  if (postCount > 0) {
    const href = await postLink.getAttribute('href')
    if (href) {
      await postLink.click()
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
      await page.goBack()
      expect(page.url()).toContain('/posts')
    }
  }
})
```

**Authentication Flow Testing:**

Skipped test showing user registration → login → profile flow:

```typescript
test('signup → login → profile', async ({ request }) => {
  const email = `e2e-${Date.now()}@example.com`
  const password = 'Test1234!'

  // Create user via admin endpoint
  const res = await request.post('/api/test/admin-create-user', {
    data: { email, password }
  })
  expect([200]).toContain(res.status())

  // Login
  const loginRes = await request.post('/api/v1/auth/login', {
    data: { email, password }
  })
  expect(loginRes.status()).toBe(200)

  // Verify profile accessible
  const profileRes = await request.get('/api/v1/profile')
  expect([200]).toContain(profileRes.status())
})
```

## Locator Strategies

**Patterns Used:**

- `page.locator('h1, h2')` - CSS selector with element matching
- `page.locator('a[href*="/posts/"]')` - Attribute selectors
- `page.locator('text=/pattern/i')` - Regex text matching
- `page.locator('input[type="email"]')` - Input type selectors
- `page.locator('[data-testid="posts-list"]')` - Data test IDs (recommended best practice)

## What Is NOT Being Tested

**Unit Tests:** No unit test framework detected
- No Jest, Vitest, or similar test runner in dependencies
- No `.test.ts` or `.spec.ts` files in `src/` directory
- Individual functions and components are not isolated unit tested

**Integration Tests:** Not explicitly separated from E2E
- Database interactions tested via E2E (no isolated integration layer)
- Service layer (Supabase client) tested via E2E only

**API Route Testing:** Limited direct testing
- Mostly verified through E2E page interactions
- Some direct request testing in E2E (see health endpoint)

## Test Environment

**Local Development:**
- Auto-starts dev server on port 3000
- Uses real Supabase instance configured in `.env.local`
- Retries: 0 (fail fast)
- Workers: Unlimited (parallel tests)

**CI Environment:**
- Detected via `process.env.CI`
- Retries: 2 (lenient for network flakiness)
- Workers: 1 (single-threaded to avoid race conditions)
- `forbidOnly: true` - Fails if `.only` tests left in code

## Coverage

**Requirements:** No coverage requirements enforced

**View Results:**
- HTML report generated after test run
- Located in `playwright-report/` directory (auto-generated)
- Open: `npx playwright show-report`

## Best Practices Observed

1. **Avoid strict DOM coupling** - Tests use multiple selector strategies
2. **Handle missing elements gracefully** - Use `.count()` before assertions
3. **Disable flaky tests appropriately** - `auth-flow.spec.ts` uses `.skip()`
4. **Log environment state** - Tests check HTTP status first, then validate content
5. **Use data-testid attributes** - When testing specific UI components
6. **Catch navigation failures** - `.catch(() => {})` for optional navigations

---

*Testing analysis: 2026-03-02*
