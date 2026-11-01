import { Page } from 'playwright';
import { HumanInteractionEngine } from './human-interaction';
import { SyntheticIdentity } from './types';

export class AuthTestModule {
  private page: Page;
  private human: HumanInteractionEngine;
  private baseUrl: string;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.human = new HumanInteractionEngine(page);
    this.baseUrl = baseUrl;
  }

  // Test unauthenticated access redirect
  async testProtectedAccess(targetRoute: string, expectedRedirectPath: string): Promise<{
    allowed: boolean;
    finalUrl: string;
    redirected: boolean;
  }> {
    const targetUrl = `${this.baseUrl}${targetRoute}`;
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(500);

    const finalUrl = this.page.url();
    const redirected = finalUrl.includes(expectedRedirectPath) || finalUrl.includes('/login');

    return {
      allowed: !redirected,
      finalUrl,
      redirected
    };
  }

  // Inspect registration form fields and validation
  async inspectRegistrationForm(): Promise<{
    hasNameField: boolean;
    hasPhoneField: boolean;
    hasPasswordField: boolean;
    hasSubmitButton: boolean;
    validationTriggered: boolean;
  }> {
    await this.page.goto(`${this.baseUrl}/register`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(300);

    const hasNameField = await this.page.locator('input[type="text"], input[name*="name"], input[placeholder*="নাম"]').first().isVisible().catch(() => false);
    const hasPhoneField = await this.page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="01"]').first().isVisible().catch(() => false);
    const hasPasswordField = await this.page.locator('input[type="password"]').first().isVisible().catch(() => false);
    const submitBtn = this.page.locator('button[type="submit"], button:has-text("নিবন্ধন"), button:has-text("অ্যাকাউন্ট খুলুন")').first();
    const hasSubmitButton = await submitBtn.isVisible().catch(() => false);

    // Test form submission with empty fields to trigger validation
    let validationTriggered = false;
    if (hasSubmitButton) {
      await submitBtn.click().catch(() => {});
      await this.page.waitForTimeout(300);
      const errors = await this.page.locator('.text-rose-500, .text-red-500, [role="alert"], :invalid').count().catch(() => 0);
      validationTriggered = errors > 0 || (await this.page.url()).includes('/register');
    }

    return {
      hasNameField,
      hasPhoneField,
      hasPasswordField,
      hasSubmitButton,
      validationTriggered
    };
  }

  // Inspect login form fields and invalid credential rejection
  async inspectLoginForm(): Promise<{
    hasPhoneOrEmail: boolean;
    hasPassword: boolean;
    hasLoginButton: boolean;
    rejectsInvalidAuth: boolean;
  }> {
    await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(300);

    const hasPhoneOrEmail = await this.page.locator('input[type="tel"], input[type="text"], input[name*="phone"], input[name*="email"]').first().isVisible().catch(() => false);
    const hasPassword = await this.page.locator('input[type="password"]').first().isVisible().catch(() => false);
    const loginBtn = this.page.locator('button[type="submit"], button:has-text("লগইন"), button:has-text("প্রবেশ করুন")').first();
    const hasLoginButton = await loginBtn.isVisible().catch(() => false);

    // Test invalid login
    let rejectsInvalidAuth = false;
    if (hasPhoneOrEmail && hasPassword && hasLoginButton) {
      await this.human.typeText(this.page.locator('input[type="tel"], input[type="text"]').first(), '01700000000');
      await this.human.typeText(this.page.locator('input[type="password"]').first(), 'WrongPassword123!');
      await loginBtn.click();
      await this.page.waitForTimeout(800);

      // Check for error text or staying on login page
      const currentUrl = this.page.url();
      const hasErrorAlert = await this.page.locator('.text-rose-500, .text-red-500, [role="alert"], text="ভুল", text="সঠিক নয়"').count().catch(() => 0) > 0;
      rejectsInvalidAuth = currentUrl.includes('/login') && (!currentUrl.includes('/dashboard') || hasErrorAlert);
    }

    return {
      hasPhoneOrEmail,
      hasPassword,
      hasLoginButton,
      rejectsInvalidAuth
    };
  }
}