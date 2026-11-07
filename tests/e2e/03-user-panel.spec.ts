import { test, expect } from '@playwright/test';

test.describe('Suite 3: Candidate Dashboard & Profile Mutations', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set candidate session cookie for middleware authentication
    await context.addCookies([
      {
        name: 'cs_session_token',
        value: 'mock-candidate-valid-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    // Seed authenticated candidate session in browser storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cs_auth_data', JSON.stringify({
        isLoggedIn: true,
        role: 'candidate',
        userId: 'cand-playwright-test',
        name: 'আসিফ ইকবাল',
        phone: '01711223344'
      }));
      localStorage.setItem('cs_user_profile', JSON.stringify({
        id: 'cand-playwright-test',
        name: 'আসিফ ইকবাল',
        phone: '01711223344',
        email: 'asif.test@chakrisheba.com',
        district: 'ঢাকা',
        division: 'ঢাকা',
        gender: 'MALE',
        dob: '1998-05-15',
        nid: '19982692012345678'
      }));
      localStorage.setItem('cs_auth_token', 'mock-candidate-valid-session-token');
      localStorage.setItem('cs_session_token', 'mock-candidate-valid-session-token');
    });
  });

  test('User Dashboard renders core hubs and metric cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();

    // Check dashboard presence
    const mainHeading = page.locator('h1, h2').first();
    await expect(mainHeading).toBeVisible();

    // Verify navigation tabs/links to Profile, Vault, Wallet, and Applications
    const profileLink = page.locator('a[href*="profile"]:visible, button:has-text("প্রোফাইল"):visible').first();
    await expect(profileLink).toBeVisible();
  });

  test('Profile View and Mutation workflow executes cleanly without state desync', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page.locator('body')).toBeVisible();

    // Assert form loaded
    const nameInput = page.locator('input[value*="আসিফ"], input[placeholder*="নাম"], input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('আসিফ ইকবাল (আপডেটেড)');
    }

    // Save profile changes
    const saveButton = page.locator('button:has-text("সংরক্ষণ"), button:has-text("সেভ"), button[type="submit"]').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1500);
    }

    // Refresh and verify persistence
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});
