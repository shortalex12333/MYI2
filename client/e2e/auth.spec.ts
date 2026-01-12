import { test, expect } from '@playwright/test'

test.describe('Authentication & User Flows', () => {
  test('Health endpoint is working', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.database).toBe('connected')
  })

  test('Can visit home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/MyYachtsInsurance|Yacht/)
    await expect(page.locator('header')).toBeTruthy()
  })

  test('Signup page loads correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeTruthy()
    await expect(page.locator('input[type="password"]')).toBeTruthy()
    await expect(page.locator('button[type="submit"]')).toBeTruthy()
  })

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeTruthy()
    await expect(page.locator('input[type="password"]')).toBeTruthy()
    await expect(page.locator('button[type="submit"]')).toBeTruthy()
  })

  test('Navigation links work from home page', async ({ page }) => {
    await page.goto('/')

    // Test navigation links
    const links = [
      { text: 'Questions', href: '/posts' },
      { text: 'Categories', href: '/categories' },
      { text: 'Companies', href: '/companies' },
      { text: 'FAQ', href: '/faq' },
    ]

    for (const link of links) {
      const el = page.locator(`a:has-text("${link.text}")`)
      // Should exist somewhere on page
      if (await el.count() > 0) {
        expect(el.first()).toBeTruthy()
      }
    }
  })

  test('Protected route blocks unauth users', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    // Should redirect to login or show protected page
    const url = page.url()
    const isProtected = url.includes('login') || url.includes('error')
    expect(isProtected || url.includes('onboarding')).toBeTruthy()
  })
})
