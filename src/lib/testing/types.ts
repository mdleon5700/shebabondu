export type TestRunStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ScenarioStatus = 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_TESTED';

export interface TestRunConfig {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production-smoke';
  baseUrl: string;
  headless: boolean;
  browser: 'chrome' | 'msedge' | 'chromium';
  viewport: {
    width: number;
    height: number;
    isMobile?: boolean;
  };
  maxRetries: number;
  timeoutMs: number;
  syntheticTag: {
    isSynthetic: true;
    testRunId: string;
    testDataVersion: string;
    createdAt: string;
  };
}

export interface ScenarioResult {
  scenarioId: string;
  name: string;
  category: 'public' | 'user' | 'admin' | 'api' | 'security' | 'mobile';
  status: ScenarioStatus;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  pageUrl?: string;
  actionsPerformed: string[];
  assertions: Array<{
    assertion: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  errors: Array<{
    type: 'js_error' | 'network_error' | 'assertion_failure' | 'timeout' | 'interaction_failure';
    message: string;
    stack?: string;
    timestamp: string;
    url?: string;
  }>;
  screenshotRef?: string;
  evidenceNotes?: string;
}

export interface TestRunRecord {
  runId: string;
  config: TestRunConfig;
  status: TestRunStatus;
  startTime: string;
  endTime?: string;
  totalDurationMs?: number;
  scenarios: ScenarioResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    notTested: number;
    passRate: number;
    totalErrors: number;
  };
  browserErrors: Array<{
    message: string;
    source: string;
    timestamp: string;
  }>;
  networkFailures: Array<{
    url: string;
    status: number;
    statusText: string;
    timestamp: string;
  }>;
}

export interface SyntheticIdentity {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash?: string;
  district: string;
  division: string;
  isSynthetic: true;
  testRunId: string;
  createdAt: string;
}