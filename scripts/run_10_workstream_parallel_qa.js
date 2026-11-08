/**
 * CHAKRI SHEBA — 10-WORKSTREAM PARALLEL QA & TASK DISPATCHER
 * Architecture: Supervised Hybrid AI Engineering System
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHAKRISEBA_SECURE_ADMIN_2026';

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
};

const workstreamTasks = [
  {
    workstream: 'WORKSTREAM_A_FRONTEND',
    taskType: 'BROWSER_QA',
    title: 'Verify Candidate Profile Responsiveness and Typography',
    description: 'Playwright browser verification of profile form and SolaimanLipi fallback',
    priority: 'P1_HIGH',
    affectedModules: ['/dashboard/profile'],
    assignedAgent: 'Agent 4: Browser QA',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_B_BACKEND',
    taskType: 'CODE_AUDIT',
    title: 'Verify Dynamic Candidate Workspace Route Integrity',
    description: 'Ensure /api/admin/candidates/[id]/route.ts exists and compiles cleanly',
    priority: 'P1_HIGH',
    affectedModules: ['src/app/api/admin/candidates/[id]/route.ts'],
    assignedAgent: 'Agent 2: Code Audit',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_C_DATABASE',
    taskType: 'DB_AUDIT',
    title: 'Local Database JSON Integrity & Schema Validation',
    description: 'Verify all top-level collections in src/db/local_store.json',
    priority: 'P1_HIGH',
    affectedModules: ['src/db/local_store.json'],
    assignedAgent: 'Agent 3: DB & API Audit',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_D_AUTH',
    taskType: 'SECURITY_AUDIT',
    title: 'Verify Admin API Route Protection against Unauthorized Requests',
    description: 'Probe /api/admin/engineering/tasks without secret, verify HTTP 403',
    priority: 'P0_CRITICAL',
    affectedModules: ['/api/admin/engineering/tasks'],
    assignedAgent: 'Agent 4: Security & Permissions',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_E_SYNC',
    taskType: 'SYNC_CHECK',
    title: 'Bidirectional User/Admin Candidate Data Synchronization Audit',
    description: 'Check candidate records between profile and admin candidate workspace',
    priority: 'P1_HIGH',
    affectedModules: ['src/app/api/profile/route.ts', 'src/app/api/admin/candidates/route.ts'],
    assignedAgent: 'Agent 3: DB & API Audit',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_F_AUTOMATION',
    taskType: 'CODE_AUDIT',
    title: 'Spider Queue and Circular Ingestion Route Verification',
    description: 'Verify spider runs route handler exists and is accessible to admin',
    priority: 'P2_MEDIUM',
    affectedModules: ['src/app/api/admin/spiders/route.ts'],
    assignedAgent: 'Agent 2: Code Audit',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_G_CMS',
    taskType: 'PERF_AUDIT',
    title: 'CMS Page Builder Homepage Latency and Payload Audit',
    description: 'Measure time to first byte and payload size for dynamic CMS homepage',
    priority: 'P2_MEDIUM',
    affectedModules: ['/'],
    assignedAgent: 'Agent 4: Browser QA',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_H_SECURITY',
    taskType: 'SECURITY_AUDIT',
    title: 'Platform System Settings Unauthorized Access Protection',
    description: 'Ensure /api/admin/settings rejects unauthenticated requests with 403',
    priority: 'P0_CRITICAL',
    affectedModules: ['/api/admin/settings'],
    assignedAgent: 'Agent 4: Security',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_I_PERFORMANCE',
    taskType: 'PERF_AUDIT',
    title: 'Public Jobs API Latency and Response Performance Audit',
    description: 'Verify /api/jobs responds rapidly with force-dynamic caching headers',
    priority: 'P2_MEDIUM',
    affectedModules: ['/api/jobs'],
    assignedAgent: 'Agent 2: Performance',
    requiresHumanApproval: false
  },
  {
    workstream: 'WORKSTREAM_J_QA',
    taskType: 'BROWSER_QA',
    title: 'Job Circulars Search & Listing Browser QA',
    description: 'Verify /jobs renders search bar, filters, and job cards in Playwright',
    priority: 'P1_HIGH',
    affectedModules: ['/jobs'],
    assignedAgent: 'Agent 4: Browser QA',
    requiresHumanApproval: false
  }
];

async function dispatchAll() {
  console.log('--- DISPATCHING 10 WORKSTREAM QA TASKS ---');
  const taskIds = [];

  for (const t of workstreamTasks) {
    const idempotencyKey = `qa_${t.workstream}_${t.taskType}_${Date.now()}_${Math.random()}`;
    const res = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ ...t, idempotencyKey })
    });
    const data = await res.json();
    if (data.success && data.task) {
      console.log(`[QUEUED] ${data.task.taskId} | ${t.workstream} | ${t.title}`);
      taskIds.push(data.task.taskId);
    } else {
      console.error(`Failed to queue ${t.title}:`, data.error);
    }
  }

  console.log(`\nSuccessfully queued ${taskIds.length} tasks across Workstreams A through J.`);
  console.log('Ready for Local Worker execution.');
}

dispatchAll().catch(err => {
  console.error('Fatal dispatch error:', err);
  process.exit(1);
});
