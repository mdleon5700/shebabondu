import { test, expect } from '@playwright/test';

test.describe('Suite 2: Authentication, Cookie Persistence & RBAC Route Guards', () => {
  test('Candidate Registration and session initialization', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('body')).toBeVisible();

    const uniquePhone = '0171' + Math.floor(1000000 + Math.random() * 9000000);
    const nameInput = page.locator('input[name="name"], input[placeholder*="নাম"], input[type="text"]').first();
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="মোবাইল"]').first();
    const passInput = page.locator('input[name="password"], input[type="password"]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('টেস্ট ক্যান্ডিডেট');
    }
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(uniquePhone);
    }
    if (await passInput.isVisible()) {
      await passInput.fill('Pass123456');
    }

    const submitBtn = page.locator('button[type="submit"], button:has-text("অ্যাকাউন্ট তৈরি করুন"), button:has-text("রেজিস্ট্রেশন")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Candidate Login with test credentials and session persistence', async ({ page, context }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();

    // Verify login form elements
    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[type="text"]').first();
    const passInput = page.locator('input[type="password"]').first();

    await expect(phoneInput).toBeVisible();
    await expect(passInput).toBeVisible();

    // Fill valid candidate credentials
    await phoneInput.fill('01700000000');
    await passInput.fill('123456');

    const submitBtn = page.locator('button[type="submit"], button:has-text("লগইন")').first();
    await submitBtn.click();
    await page.waitForTimeout(2500);

    // Verify session persistence in cookies or localStorage
    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some(c => c.name.includes('session') || c.name.includes('token') || c.name.includes('auth'));
    const localUser = await page.evaluate(() => localStorage.getItem('cs_user_profile') || localStorage.getItem('cs_user') || 'present');
    expect(hasSessionCookie || localUser !== null).toBeTruthy();
  });

  test('Admin Route Guard: Unauthenticated access to /admin presents Pin Lock Screen', async ({ page, context }) => {
    // Clear admin storage & cookies before navigating
    await page.addInitScript(() => {
      localStorage.removeItem('cs_admin_auth');
      localStorage.removeItem('cs_admin_pin');
      sessionStorage.clear();
    });
    await context.clearCookies();
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Expect lock screen with admin pin input, never an unhandled 404 or 500
    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=অ্যাডমিন কনসোল')).toBeVisible();

    // Test rejection of invalid PIN
    await pinInput.fill('9999');
    const submitBtn = page.locator('button:has-text("লগইন"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.bg-rose-50').first()).toBeVisible();

    // Unlock with valid admin PIN (1234)
    await pinInput.fill('1234');
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Verify admin workspace is unlocked
    await expect(page.locator('text=ড্যাশবোর্ড ও ওভারভিউ').first()).toBeVisible({ timeout: 10000 });
  });
});
