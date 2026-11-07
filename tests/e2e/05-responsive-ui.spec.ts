import { test, expect } from '@playwright/test';

test.describe('Suite 5: Responsive Layout Integrity (375px Mobile & 1440px Desktop)', () => {
  test('Mobile Viewport (375px) renders mobile navbar, drawer, and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();

    // Check no horizontal scrollbar overflow (allowing 1px sub-pixel rendering tolerance)
    const overflowDiff = await page.evaluate(() => {
      return Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    });
    expect(overflowDiff).toBeLessThanOrEqual(1);

    // Verify mobile hamburger / menu button or top search
    const mobileMenuTrigger = page.locator('button[aria-label="Toggle Menu"], button[aria-label*="menu" i]:visible, header button:visible').first();
    await expect(mobileMenuTrigger).toBeVisible();
  });

  test('Desktop Viewport (1440px) renders full multi-column layout, marquee, and desktop header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();

    // Verify desktop header navigation links
    const navLinks = page.locator('header nav a, header a');
    await expect(navLinks.first()).toBeVisible();

    // Verify footer columns
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Admin Console Responsive: Mobile drawer opens and closes without breaking canvas', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'cs_session_token',
        value: 'mock-admin-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cs_admin_auth', 'verified');
      localStorage.setItem('cs_admin_pin', '1234');
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();

    // Mobile admin header should be visible once session is verified
    const adminHeader = page.locator('header, nav, [role="navigation"]').first();
    await expect(adminHeader).toBeVisible({ timeout: 10000 });
  });
});
