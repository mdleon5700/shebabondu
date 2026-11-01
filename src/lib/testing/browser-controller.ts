import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { TestRunConfig } from './types';

export class BrowserController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: TestRunConfig;

  constructor(config: TestRunConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.browser) return;

    const launchOptions: any = {
      headless: this.config.headless !== false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=' + this.config.viewport.width + ',' + this.config.viewport.height
      ]
    };

    // Use system Chrome or Edge channel
    if (this.config.browser === 'chrome' || this.config.browser === 'msedge') {
      launchOptions.channel = this.config.browser;
    } else {
      launchOptions.channel = 'chrome'; // default to system chrome
    }

    try {
      this.browser = await chromium.launch(launchOptions);
    } catch (err: any) {
      console.warn(`[BrowserController] Failed to launch with channel '${launchOptions.channel}', falling back to default chromium:`, err.message);
      delete launchOptions.channel;
      this.browser = await chromium.launch(launchOptions);
    }
  }

  async createContext(customViewport?: { width: number; height: number; isMobile?: boolean }): Promise<{ context: BrowserContext; page: Page }> {
    if (!this.browser) {
      await this.initialize();
    }

    const vp = customViewport || this.config.viewport;
    this.context = await this.browser!.newContext({
      viewport: {
        width: vp.width,
        height: vp.height
      },
      isMobile: vp.isMobile || false,
      hasTouch: vp.isMobile || false,
      userAgent: vp.isMobile 
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1 ChakriShebaTestingSpider/1.0'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ChakriShebaTestingSpider/1.0',
      locale: 'bn-BD',
      timezoneId: 'Asia/Dhaka'
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeoutMs || 15000);
    this.page.setDefaultNavigationTimeout(this.config.timeoutMs || 15000);

    return { context: this.context, page: this.page };
  }

  async takeScreenshot(scenarioId: string, stepName = 'evidence'): Promise<string> {
    if (!this.page) return '';

    const dir = path.join(process.cwd(), 'test-evidence', this.config.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${scenarioId}_${stepName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.png`;
    const fullPath = path.join(dir, filename);

    await this.page.screenshot({ path: fullPath, fullPage: true });
    return `test-evidence/${this.config.id}/${filename}`;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (err: any) {
      console.warn('[BrowserController] Error during cleanup:', err.message);
    }
  }

  getPage(): Page | null {
    return this.page;
  }

  getContext(): BrowserContext | null {
    return this.context;
  }
}