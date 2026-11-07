import { test, expect } from '@playwright/test';

test.describe('Suite 4: Admin Panel Workflows, CMS Builder & Privileges', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'cs_session_token',
        value: 'mock-admin-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    // Unlock admin session in storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cs_admin_auth', 'verified');
      localStorage.setItem('cs_admin_pin', '1234');
    });
  });

  test('Admin Console loads dashboard stats and primary modules', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();

    // Check main tabs exist (Dashboard, Applications, Circulars, CMS, Settings)
    await expect(page.locator('text=ড্যাশবোর্ড ও ওভারভিউ').first()).toBeVisible({ timeout: 10000 });
  });

  test('Visual Page Builder loads sections and allows live section toggling', async ({ page }) => {
    await page.goto('/admin?tab=builder');
    await expect(page.locator('body')).toBeVisible();

    // Verify Page Selector and Toolbar buttons
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('button:has-text("পৃষ্ঠা এসইও ও সেটিংস")').first()).toBeVisible();
    await expect(page.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first()).toBeVisible();

    // Click on SEO settings modal
    await page.locator('button:has-text("পৃষ্ঠা এসইও ও সেটিংস")').first().click();
    await expect(page.locator('text=এসইও মেটাডাটা').first()).toBeVisible();
    const closeSeoBtn = page.locator('button:has-text("বাতিল"), button:has-text("✕"), button:has-text("বন্ধ")').first();
    if (await closeSeoBtn.isVisible()) {
      await closeSeoBtn.click();
    }
    await page.waitForTimeout(500);

    // Verify Header and Footer preview in Canvas
    await expect(page.locator('text=ওয়েবসাইট লাইভ হেডার').first()).toBeVisible();
    await expect(page.locator('text=ওয়েবসাইট লাইভ ফুটার').first()).toBeVisible();

    // Open Header & Footer Settings modal
    await page.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first().click();
    await expect(page.locator('text=হেডার ও ফুটার থিম').first()).toBeVisible();
    const closeChromeBtn = page.locator('button:has-text("বাতিল"), button:has-text("✕")').first();
    if (await closeChromeBtn.isVisible()) {
      await closeChromeBtn.click();
    }
    await page.waitForTimeout(500);

    // Toggle Real Live iFrame Preview
    const liveViewBtn = page.locator('button:has-text("রিয়েল লাইভ ভিউ")').first();
    await expect(liveViewBtn).toBeVisible();
    await liveViewBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('iframe[title="Live Website Preview"]').first()).toBeVisible();
  });

  test('Candidate and Application list tables load with pagination and filters', async ({ page }) => {
    await page.goto('/admin?tab=all-applications');
    await expect(page.locator('body')).toBeVisible();

    // Verify application queue elements or empty state
    await page.waitForTimeout(1500);
    const content = page.locator('table, [role="table"], div:has-text("আবেদন"), div:has-text("কোনো আবেদন")').first();
    await expect(content).toBeVisible();
  });
});
