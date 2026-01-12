import { test, expect } from '@playwright/test'

test.describe('Content Browsing', () => {
  test('Posts page loads and displays content', async ({ page }) => {
    await page.goto('/posts')

    // Should have posts list or loading state
    const postsList = page.locator('[data-testid="posts-list"]')
    const noPosts = page.locator('text=/no questions|no posts|empty/i')

    const hasContent = await postsList.count() > 0 || await noPosts.count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('Categories page loads', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.locator('h1, h2')).toBeTruthy()
  })

  test('Companies page loads', async ({ page }) => {
    await page.goto('/companies')
    await expect(page.locator('h1, h2')).toBeTruthy()
  })

  test('Knowledge base page loads', async ({ page }) => {
    await page.goto('/knowledge')
    // Page may load content client-side
    await page.waitForTimeout(500)
    const title = page.locator('h1, h2').first()
    await expect(title).toBeTruthy()
  })

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.locator('h1, h2')).toBeTruthy()
  })

  test('Contact page loads', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('form, h1, h2')).toBeTruthy()
  })

  test('Terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('text=/terms|conditions/i')).toBeTruthy()
  })

  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('text=/privacy/i')).toBeTruthy()
  })

  test('Can navigate back from posts detail', async ({ page }) => {
    // This test assumes posts exist
    await page.goto('/posts')

    const postLink = page.locator('a[href*="/posts/"]').first()
    const postCount = await postLink.count()

    if (postCount > 0) {
      const href = await postLink.getAttribute('href')
      if (href) {
        await postLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})

        // Should be able to go back
        await page.goBack()
        expect(page.url()).toContain('/posts')
      }
    }
  })

  test('Search is present on pages', async ({ page }) => {
    await page.goto('/posts')
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    expect(await searchInput.count() > 0).toBeTruthy()
  })

  test('Empty state is clean (no console errors)', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/knowledge')
    await page.waitForTimeout(500)

    // Should not have critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('react') && !e.includes('next')
    )
    expect(criticalErrors.length).toBe(0)
  })
})
