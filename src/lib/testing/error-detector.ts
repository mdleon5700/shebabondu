import { Page } from 'playwright';

export interface CapturedError {
  type: 'pageerror' | 'console_error' | 'network_4xx' | 'network_5xx';
  message: string;
  source?: string;
  timestamp: string;
  url?: string;
}

export class ErrorDetector {
  private errors: CapturedError[] = [];

  attachToPage(page: Page): void {
    // 1. Uncaught JS exceptions in browser
    page.on('pageerror', (err) => {
      this.errors.push({
        type: 'pageerror',
        message: err.message,
        source: err.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 2. Console error logs
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console_error',
          message: msg.text(),
          source: msg.location().url,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 3. Failed network requests (4xx / 5xx)
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        // Exclude expected test 401s on protected probes if needed
        this.errors.push({
          type: status >= 500 ? 'network_5xx' : 'network_4xx',
          message: `HTTP ${status}: ${response.statusText()}`,
          url: response.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  getErrors(): CapturedError[] {
    return [...this.errors];
  }

  getFatalErrors(): CapturedError[] {
    return this.errors.filter(e => e.type === 'pageerror' || e.type === 'network_5xx');
  }

  clear(): void {
    this.errors = [];
  }
}