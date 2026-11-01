/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 15: CENTRAL AUTOMATION & INTELLIGENT RULES TYPES
 * Centralized background task management, scheduler states, and safety-governed rule engine.
 */

export type AutomationTaskCategory =
  | 'collection'
  | 'verification'
  | 'publishing'
  | 'deadlines'
  | 'matching'
  | 'notifications'
  | 'maintenance'
  | 'analytics';

export type AutomationTaskStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRY_SCHEDULED'
  | 'BLOCKED';

export interface AutomationTaskDefinition {
  id: string;
  name: string;
  nameBn: string;
  descriptionBn: string;
  category: AutomationTaskCategory;
  cronSchedule: string;
  status: AutomationTaskStatus;
  lastExecutedAt?: string;
  lastSuccessAt?: string;
  nextScheduledAt?: string;
  executionDurationMs?: number;
  retryCount: number;
  maxRetries: number;
  errorSummary?: string;
  isManualTriggerable: boolean;
}

export type AutomationRuleCode =
  | 'RULE_A' // Repeated source failure
  | 'RULE_B' // Verification backlog
  | 'RULE_C' // Upcoming deadline
  | 'RULE_D' // Publication failure retry
  | 'RULE_E' // High AI usage
  | 'RULE_F' // Repeated zero-result search
  | 'RULE_G'; // Notification delivery failure

export interface AutomationRuleDefinition {
  id: string;
  code: AutomationRuleCode;
  name: string;
  nameBn: string;
  descriptionBn: string;
  triggerEvent: string;
  triggerEventBn: string;
  conditionDescriptionBn: string;
  actionDescriptionBn: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isEnabled: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  executionCount: number;
}

export interface AutomationExecutionRecord {
  id: string;
  ruleOrTaskId: string;
  type: 'SCHEDULED_TASK' | 'INTELLIGENT_RULE';
  nameBn: string;
  status: 'SUCCESS' | 'TRIGGERED' | 'FAILED' | 'SKIPPED_COOLDOWN';
  detailsBn: string;
  timestamp: string;
  actor: string;
  durationMs?: number;
}

export interface AutomationOverviewReport {
  generatedAt: string;
  totalTasks: number;
  activeTasks: number;
  pausedTasks: number;
  failedTasks: number;
  tasks: AutomationTaskDefinition[];
  rules: AutomationRuleDefinition[];
  recentExecutions: AutomationExecutionRecord[];
}
