import { test, expect } from '@playwright/test';

test.describe('Suite 2: Authentication, Cookie Persistence & RBAC Route Guards', () => {
  test('Candidate Registration and session initialization', async ({ page, context }) => {
    await page.goto('/register');
    await expect(page.locator('body')).toBeVisible();

    const uniquePhone = '01889' + Math.floor(100000 + Math.random() * 900000);
    const nameInput = page.locator('input[name="name"], input[placeholder*="নাম"], input[type="text"]').first();
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="মোবাইল"]').first();
    const passInput = page.locator('input[name="password"], input[type="password"]').first();

    await expect(nameInput).toBeVisible();
    await nameInput.fill('টেস্ট ক্যান্ডিডেট');
    await phoneInput.fill(uniquePhone);
    await passInput.fill('Pass123456');

    const submitBtn = page.locator('button[type="submit"], button:has-text("অ্যাকাউন্ট তৈরি করুন"), button:has-text("রেজিস্ট্রেশন")').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify true redirection to /dashboard
    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // Verify session persistence in cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'cs_session_token');
    expect(sessionCookie).toBeDefined();
  });

  test('Candidate Login with test credentials and session persistence', async ({ page, context }) => {
    // 1. Register a verified candidate via API to test real human login
    const testPhone = '01889' + Math.floor(100000 + Math.random() * 900000);
    const testPass = 'Password123';
    await page.request.post('/api/auth/register', {
      data: {
        name: 'লগইন টেস্ট প্রার্থী',
        phone: testPhone,
        password: testPass,
        district: 'ঢাকা'
      }
    });

    // Clear context cookies to ensure clean login test
    await context.clearCookies();

    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();

    // Verify login form elements
    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[type="text"]').first();
    const passInput = page.locator('input[type="password"]').first();

    await expect(phoneInput).toBeVisible();
    await expect(passInput).toBeVisible();

    // Fill registered candidate credentials
    await phoneInput.fill(testPhone);
    await passInput.fill(testPass);

    const submitBtn = page.locator('form button[type="submit"], button:has-text("লগইন করুন")').first();
    await submitBtn.click();

    // Verify true redirection to /dashboard
    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // Verify genuine session persistence in cookies
    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some(c => c.name === 'cs_session_token');
    expect(hasSessionCookie).toBeTruthy();
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
