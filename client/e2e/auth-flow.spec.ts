import { test, expect } from '@playwright/test'

test.describe.skip('Supabase Auth Flow', () => {
  test('signup → login → profile', async ({ request }) => {
    const suffix = Date.now()
    const email = `e2e-${suffix}@example.com`
    const password = 'Test1234!'
    const username = `user_${suffix}`

    // 1) Create user via admin route in non-production to avoid email limits
    // Compile can lag; retry admin route until it exists and succeeds
    let adminStatus = 0
    for (let i = 0; i < 10; i++) {
      const res = await request.post('/api/test/admin-create-user', {
        data: { email, password, username },
      })
      adminStatus = res.status()
      if (adminStatus !== 404) break
      await new Promise((r) => setTimeout(r, 500))
    }
    expect([200]).toContain(adminStatus)

    // 2) Login
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email, password },
    })
    expect(loginRes.status()).toBe(200)
    const loginJson = await loginRes.json()
    expect(loginJson.user?.email).toBe(email)

    // 3) Profile should be readable with session cookies set in this context
    const profileRes = await request.get('/api/v1/profile')
    expect([200]).toContain(profileRes.status())
    if (profileRes.status() === 200) {
      const profileJson = await profileRes.json()
      expect(profileJson.email).toBe(email)
      expect(profileJson.username).toBe(username)
    }
  })
})
