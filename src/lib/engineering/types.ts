/**
 * CHAKRI SHEBA — ENGINEERING TASK SYSTEM TYPES
 * Supervised Hybrid AI Engineering & QA System
 */

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

export type EngineeringWorkstream =
  | 'WORKSTREAM_A_FRONTEND'
  | 'WORKSTREAM_B_BACKEND'
  | 'WORKSTREAM_C_DATABASE'
  | 'WORKSTREAM_D_AUTH'
  | 'WORKSTREAM_E_SYNC'
  | 'WORKSTREAM_F_AUTOMATION'
  | 'WORKSTREAM_G_CMS'
  | 'WORKSTREAM_H_SECURITY'
  | 'WORKSTREAM_I_PERFORMANCE'
  | 'WORKSTREAM_J_QA';

export type TaskType =
  | 'CODE_AUDIT'
  | 'DB_AUDIT'
  | 'BROWSER_QA'
  | 'REPAIR'
  | 'REGRESSION'
  | 'SYNC_CHECK'
  | 'PERF_AUDIT'
  | 'SECURITY_AUDIT';

export interface EngineeringCheckpoint {
  timestamp: string;
  stage: EngineeringTaskStatus;
  message: string;
}

export interface EngineeringTaskErrorDetails {
  message: string;
  stackTrace?: string;
  failedRoute?: string;
  exitCode?: number;
}

export interface EngineeringTask {
  taskId: string;                      // e.g. "TASK-20261108-001"
  workstream: EngineeringWorkstream;
  taskType: TaskType;
  title: string;
  description: string;
  priority: TaskPriority;
  affectedModules: string[];           // e.g. ["/dashboard/profile", "UniversalUserWorkspace.tsx"]
  status: EngineeringTaskStatus;
  assignedAgent: string;               // e.g. "Agent 4: Browser QA"
  idempotencyKey: string;              // Unique hash to avoid duplicate creation
  
  // Lease & Concurrency Control
  leasedByWorker?: string;             // Worker identifier holding the lock
  leaseExpiresAt?: string;             // ISO Timestamp (default: 10 minutes)
  attemptCount: number;                // Incremented on lease acquisition (max: 3)
  maxAttempts: number;
  
  // Timestamps & Checkpoints
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  checkpoints: EngineeringCheckpoint[];
  
  // Evidence & Artifact References
  resultSummary?: string;
  evidenceReferences?: string[];       // Paths to screenshots, logs, diffs
  errorDetails?: EngineeringTaskErrorDetails;
  
  // Human Approval State (Supervised Autonomy)
  requiresHumanApproval: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
}

export interface TaskFilterOptions {
  status?: EngineeringTaskStatus;
  priority?: TaskPriority;
  workstream?: EngineeringWorkstream;
  taskType?: TaskType;
  requiresHumanApproval?: boolean;
}

