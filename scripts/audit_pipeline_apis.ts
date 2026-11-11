export {};

const BASE_URL = 'http://localhost:3000';

interface ApiCheck {
  endpoint: string;
  method: string;
  expectedStatus: number;
}

const API_CHECKS: ApiCheck[] = [
  { endpoint: '/api/jobs', method: 'GET', expectedStatus: 200 },
  { endpoint: '/api/categories', method: 'GET', expectedStatus: 200 },
  { endpoint: '/api/contact', method: 'GET', expectedStatus: 200 },
  { endpoint: '/api/platform/settings', method: 'GET', expectedStatus: 200 },
  { endpoint: '/api/job-alerts', method: 'GET', expectedStatus: 200 },
  { endpoint: '/api/jobs/report', method: 'GET', expectedStatus: 200 }
];

async function runApiAudit() {
  console.log('📡 Running Critical System APIs Audit...\n');

  let passed = 0;
  for (const check of API_CHECKS) {
    try {
      const res = await fetch(`${BASE_URL}${check.endpoint}`, { method: check.method });
      const ok = res.status === check.expectedStatus;
      console.log(`[API] ${check.method} ${check.endpoint} -> HTTP ${res.status} ${ok ? '✅ PASS' : '❌ FAIL'}`);
      if (ok) passed++;
    } catch (err: any) {
      console.error(`[API] ${check.method} ${check.endpoint} -> ERROR: ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log(`API Audit Summary: ${passed} / ${API_CHECKS.length} Passed!`);
  console.log('======================================================');

  if (passed !== API_CHECKS.length) {
    process.exit(1);
  }
}

runApiAudit();

