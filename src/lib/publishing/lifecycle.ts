/**
 * CHAKRI SHEBA — STEP 05: JOB LIFECYCLE MANAGER
 * Handles Unpublish, Expire, Archive, Restore, and Cancellation Notice lifecycles.
 */

import { PublicationStatus, PublicationStatusTransition, PublicationAuditLog } from './types';
import { executeStatusTransition } from './status_machine';
import { serverDB } from '@/lib/db';
import { JobCircular } from '@/lib/types';

export interface LifecycleActionResult {
  success: boolean;
  jobId: string;
  previousStatus?: PublicationStatus;
  newStatus?: PublicationStatus;
  job?: JobCircular;
  error?: string;
}

export function unpublishJob(
  jobId: string,
  reason: string,
  adminId = 'ADMIN'
): LifecycleActionResult {
  const job = serverDB.getJobById(jobId);
  if (!job) {
    return { success: false, jobId, error: 'চাকরির রেকর্ডটি পাওয়া যায়নি।' };
  }

  const currentStatus = ((job as any).publicationStatus || 'PUBLISHED') as PublicationStatus;
  const transition = executeStatusTransition(currentStatus, 'UNPUBLISHED', adminId, reason || 'প্রশাসনিক প্রয়োজনে অপ্রকাশ');

  if (!transition.success) {
    return { success: false, jobId, error: transition.error };
  }

  (job as any).publicationStatus = 'UNPUBLISHED';
  (job as any).unpublishReason = reason;
  (job as any).unpublishAt = new Date().toISOString();
  (job as any).statusHistory = (job as any).statusHistory || [];
  if (transition.transition) {
    (job as any).statusHistory.push(transition.transition);
  }

  serverDB.saveJob(job, adminId);

  // Log audit
  if (serverDB.addPublicationAuditLog) {
    serverDB.addPublicationAuditLog({
      id: 'aud-' + Date.now().toString(36),
      jobId,
      action: 'UNPUBLISH',
      actor: adminId,
      timestamp: new Date().toISOString(),
      details: { reason, previousStatus: currentStatus }
    });
  }

  return {
    success: true,
    jobId,
    previousStatus: currentStatus,
    newStatus: 'UNPUBLISHED',
    job
  };
}

export function expireJob(
  jobId: string,
  adminId = 'SYSTEM'
): LifecycleActionResult {
  const job = serverDB.getJobById(jobId);
  if (!job) {
    return { success: false, jobId, error: 'চাকরির রেকর্ডটি পাওয়া যায়নি।' };
  }

  const currentStatus = ((job as any).publicationStatus || 'PUBLISHED') as PublicationStatus;
  const transition = executeStatusTransition(currentStatus, 'EXPIRED', adminId, 'আবেদনের সময়সীমা সমাপ্তি');

  if (!transition.success) {
    return { success: false, jobId, error: transition.error };
  }

  (job as any).publicationStatus = 'EXPIRED';
  (job as any).expiredAt = new Date().toISOString();
  (job as any).statusHistory = (job as any).statusHistory || [];
  if (transition.transition) {
    (job as any).statusHistory.push(transition.transition);
  }

  serverDB.saveJob(job, adminId);

  if (serverDB.addPublicationAuditLog) {
    serverDB.addPublicationAuditLog({
      id: 'aud-' + Date.now().toString(36),
      jobId,
      action: 'EXPIRE',
      actor: adminId,
      timestamp: new Date().toISOString(),
      details: { deadline: job.deadline }
    });
  }

  return {
    success: true,
    jobId,
    previousStatus: currentStatus,
    newStatus: 'EXPIRED',
    job
  };
}

export function archiveJob(
  jobId: string,
  reason = 'পুরোনো সার্কুলার আর্কাইভকরণ',
  adminId = 'ADMIN'
): LifecycleActionResult {
  const job = serverDB.getJobById(jobId);
  if (!job) {
    return { success: false, jobId, error: 'চাকরির রেকর্ডটি পাওয়া যায়নি।' };
  }

  const currentStatus = ((job as any).publicationStatus || 'PUBLISHED') as PublicationStatus;
  const transition = executeStatusTransition(currentStatus, 'ARCHIVED', adminId, reason);

  if (!transition.success) {
    return { success: false, jobId, error: transition.error };
  }

  (job as any).publicationStatus = 'ARCHIVED';
  (job as any).archivedAt = new Date().toISOString();
  (job as any).archiveReason = reason;
  (job as any).statusHistory = (job as any).statusHistory || [];
  if (transition.transition) {
    (job as any).statusHistory.push(transition.transition);
  }

  serverDB.saveJob(job, adminId);

  if (serverDB.addPublicationAuditLog) {
    serverDB.addPublicationAuditLog({
      id: 'aud-' + Date.now().toString(36),
      jobId,
      action: 'ARCHIVE',
      actor: adminId,
      timestamp: new Date().toISOString(),
      details: { reason }
    });
  }

  return {
    success: true,
    jobId,
    previousStatus: currentStatus,
    newStatus: 'ARCHIVED',
    job
  };
}

export function restoreJob(
  jobId: string,
  adminId = 'ADMIN'
): LifecycleActionResult {
  const job = serverDB.getJobById(jobId);
  if (!job) {
    return { success: false, jobId, error: 'চাকরির রেকর্ডটি পাওয়া যায়নি।' };
  }

  const currentStatus = ((job as any).publicationStatus || 'UNPUBLISHED') as PublicationStatus;
  const transition = executeStatusTransition(currentStatus, 'PUBLISHED', adminId, 'আর্কাইভ/অপ্রকাশ থেকে পুনঃপ্রকাশ');

  if (!transition.success) {
    return { success: false, jobId, error: transition.error };
  }

  (job as any).publicationStatus = 'PUBLISHED';
  (job as any).restoredAt = new Date().toISOString();
  (job as any).statusHistory = (job as any).statusHistory || [];
  if (transition.transition) {
    (job as any).statusHistory.push(transition.transition);
  }

  serverDB.saveJob(job, adminId);

  if (serverDB.addPublicationAuditLog) {
    serverDB.addPublicationAuditLog({
      id: 'aud-' + Date.now().toString(36),
      jobId,
      action: 'RESTORE',
      actor: adminId,
      timestamp: new Date().toISOString(),
      details: { restoredFrom: currentStatus }
    });
  }

  return {
    success: true,
    jobId,
    previousStatus: currentStatus,
    newStatus: 'PUBLISHED',
    job
  };
}
