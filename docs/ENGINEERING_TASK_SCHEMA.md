# CHAKRI SHEBA — ENGINEERING TASK SCHEMA & API CONTRACT

> **Storage Target:** File-backed `serverDB` (`src/lib/db.ts`) under collection `engineeringTasks`  
> **Guarantees:** Atomic lease expiration, idempotency protection, immutable history.

---

## 1. Engineering Task Data Schema (TypeScript)

```typescript
export type EngineeringTaskStatus =
  | 'REPORTED'
  | 'QUEUED'
  | 'AUDITING'
  | 'DIAGNOSING'
  | 'AWAITING_APPROVAL'
  | 'REPAIRING'
  | 'TESTING'
  | 'VERIFIED'
  | 'READY_FOR_RELEASE'
  | 'DEPLOYED'
  | 'FAILED'
  | 'RETRY_PENDING'
  | 'NEEDS_HUMAN_REVIEW';

export type TaskPriority = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export interface EngineeringTask {
  taskId: string;                      // e.g. "TASK-20261108-001"
  taskType: 'CODE_AUDIT' | 'DB_AUDIT' | 'BROWSER_QA' | 'REPAIR' | 'REGRESSION' | 'SYNC_CHECK';
  title: string;
  description: string;
  priority: TaskPriority;
  affectedModules: string[];           // e.g. ["/dashboard/profile", "UniversalUserWorkspace.tsx"]
  status: EngineeringTaskStatus;
  assignedAgent: string;               // e.g. "Agent 4: Browser QA"
  idempotencyKey: string;              // SHA-256 of payload to prevent duplicate tasks
  
  // Lease & Concurrency Control
  leasedByWorker?: string;             // Worker identifier holding the lock
  leaseExpiresAt?: string;             // ISO Timestamp (default: 10 minutes)
  attemptCount: number;                // Incremented on lease acquisition (max: 3)
  
  // Audit & Checkpoint Records
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  checkpoints: Array<{
    timestamp: string;
    stage: EngineeringTaskStatus;
    message: string;
  }>;
  
  // Evidence & Artifact References
  resultSummary?: string;
  evidenceReferences?: string[];       // Paths to screenshots, logs, diffs
  errorDetails?: {
    message: string;
    stackTrace?: string;
    failedRoute?: string;
  };
  
  // Human Approval State
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
}
```

---

## 2. API Contract Endpoints

| Endpoint | Method | Caller | Purpose |
|---|---|---|---|
| `/api/admin/engineering/tasks` | `GET` | n8n / Admin | List, search, and filter active engineering tasks. |
| `/api/admin/engineering/tasks` | `POST` | n8n / Admin | Create a new engineering task with idempotency check. |
| `/api/worker/tasks/acquire` | `POST` | Local Worker | Atomically leases the next highest-priority task. |
| `/api/worker/tasks/[id]/heartbeat` | `POST` | Local Worker | Extends task lease by 10 minutes. |
| `/api/worker/tasks/[id]/complete` | `POST` | Local Worker | Submits results, test evidence, and updates status to `VERIFIED`. |
| `/api/worker/tasks/[id]/fail` | `POST` | Local Worker | Submits failure stack, manages retry attempts. |
| `/api/admin/engineering/tasks/[id]/approval` | `POST` | Human Admin | Records human decision (`APPROVED` or `REJECTED`). |
