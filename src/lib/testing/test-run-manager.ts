import fs from 'fs';
import path from 'path';
import { TestRunRecord, TestRunConfig, ScenarioResult, TestRunStatus } from './types';

export class TestRunManager {
  private static storePath = path.join(process.cwd(), 'src', 'db', 'test_runs_store.json');

  private static loadStore(): Record<string, TestRunRecord> {
    if (!fs.existsSync(this.storePath)) {
      return {};
    }
    try {
      const raw = fs.readFileSync(this.storePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private static saveStore(store: Record<string, TestRunRecord>): void {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(store, null, 2), 'utf8');
  }

  static createRun(config: Partial<TestRunConfig> = {}): TestRunRecord {
    const runId = `RUN-2026-${Date.now().toString().slice(-6)}`;
    const fullConfig: TestRunConfig = {
      id: runId,
      name: config.name || 'Autonomous Human-Like Browser Spider Audit',
      environment: config.environment || 'development',
      baseUrl: config.baseUrl || 'http://localhost:3000',
      headless: config.headless !== undefined ? config.headless : true,
      browser: config.browser || 'chrome',
      viewport: config.viewport || { width: 1280, height: 800 },
      maxRetries: config.maxRetries || 2,
      timeoutMs: config.timeoutMs || 30000,
      syntheticTag: {
        isSynthetic: true,
        testRunId: runId,
        testDataVersion: '1.0',
        createdAt: new Date().toISOString()
      }
    };

    const record: TestRunRecord = {
      runId,
      config: fullConfig,
      status: 'IDLE',
      startTime: new Date().toISOString(),
      scenarios: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        notTested: 0,
        passRate: 0,
        totalErrors: 0
      },
      browserErrors: [],
      networkFailures: []
    };

    const store = this.loadStore();
    store[runId] = record;
    this.saveStore(store);
    return record;
  }

  static updateRun(record: TestRunRecord): void {
    const store = this.loadStore();
    store[record.runId] = record;
    this.saveStore(store);
  }

  static getRun(runId: string): TestRunRecord | null {
    const store = this.loadStore();
    return store[runId] || null;
  }

  static listRuns(): TestRunRecord[] {
    const store = this.loadStore();
    return Object.values(store).sort((a, b) => b.startTime.localeCompare(a.startTime));
  }

  static getLatestRun(): TestRunRecord | null {
    const runs = this.listRuns();
    return runs[0] || null;
  }
}