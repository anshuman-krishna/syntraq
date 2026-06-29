import { test, expect } from '@playwright/test'

// critical-path smoke: a fresh visitor can register and land in the authed app.
// extend with shift creation + replay once those flows have stable selectors.
test('register lands an authenticated user in the dashboard', async ({ page }) => {
  const email = `e2e+${Date.now()}@syntraq.test`
  const password = 'e2e-password-123'

  await page.goto('/register')
  await page.fill('input[autocomplete="organization"]', 'E2E Co')
  await page.fill('input[autocomplete="name"]', 'E2E Tester')
  await page.fill('input[autocomplete="email"]', email)
  await page.fill('input[autocomplete="new-password"]', password)
  await page.getByRole('button', { name: 'create account' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

  // the authed shell renders the sidebar nav
  await expect(page.getByRole('link', { name: 'roster' })).toBeVisible()

  // and a protected module is reachable
  await page.getByRole('link', { name: 'roster' }).click()
  await expect(page).toHaveURL(/\/roster/)
})
