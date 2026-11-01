import { Page, Locator } from 'playwright';

export class HumanInteractionEngine {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Human typing with natural micro-intervals
  async typeText(locator: Locator | string, text: string, options: { delayMs?: number } = {}): Promise<void> {
    const el = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await el.waitFor({ state: 'visible', timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await el.click();
    await el.fill(''); // clear existing

    const delay = options.delayMs || 25;
    for (const char of text) {
      await el.pressSequentially(char, { delay });
    }
  }

  // Human-like smooth scroll
  async smoothScrollTo(locator: Locator | string): Promise<void> {
    const el = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await el.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(100);
  }

  // Click with auto-retry and visibility check
  async clickElement(locator: Locator | string, options: { timeout?: number } = {}): Promise<void> {
    const el = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await el.waitFor({ state: 'visible', timeout: options.timeout || 8000 });
    await el.scrollIntoViewIfNeeded();
    await el.click({ timeout: options.timeout || 8000 });
    await this.page.waitForTimeout(150); // settle
  }

  // Select dropdown option
  async selectOption(locator: Locator | string, valueOrLabel: string): Promise<void> {
    const el = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await el.waitFor({ state: 'visible', timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await el.selectOption({ label: valueOrLabel }).catch(async () => {
      await el.selectOption(valueOrLabel);
    });
  }

  // Checkbox or Radio toggle
  async setChecked(locator: Locator | string, checked = true): Promise<void> {
    const el = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await el.waitFor({ state: 'visible', timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await el.setChecked(checked);
  }

  // Fill standard form
  async fillForm(fields: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
      await this.typeText(selector, value);
    }
  }

  // Wait for page state (load, domcontentloaded, or networkidle)
  async waitForState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.waitForLoadState(state);
  }
}