import { test, expect } from '@playwright/test';

test.describe('Suite 1: Public Pages Routing, HTTP 200 & Console Health', () => {
  const publicRoutes = [
    '/',
    '/jobs',
    '/todays-jobs',
    '/latest-jobs',
    '/featured-jobs',
    '/closing-soon',
    '/government-jobs',
    '/bank-jobs',
    '/teacher-jobs',
    '/organizations',
    '/organizations/bpsc',
    '/exam-notices',
    '/admit-cards',
    '/exam-results',
    '/questions',
    '/model-tests',
    '/career-guides',
    '/about-us',
    '/contact-us',
    '/faq',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
    '/login',
    '/register'
  ];

  for (const route of publicRoutes) {
    test(`Route "${route}" should return HTTP 200, render brand layout, and emit no uncaught errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Verify page body rendered
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verify branding / title presence
      await expect(page).toHaveTitle(/চাকরি সেবা|Chakri Sheba|নিয়োগ/);

      // Filter out non-fatal 3rd-party or telemetry network errors
      const criticalErrors = consoleErrors.filter(err => 
        !err.includes('Failed to load resource') && 
        !err.includes('favicon') &&
        !err.includes('status of 404') &&
        !err.includes('chrome-extension')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test('Non-existent or draft job detail gracefully redirects to /jobs with query', async ({ page }) => {
    const response = await page.goto('/jobs/non-existent-mock-id-99999');
    // Expect graceful fallback redirect to /jobs
    await page.waitForURL(/\/jobs\?search=/, { timeout: 10000 });
    expect(page.url()).toContain('/jobs?search=');
  });
});

