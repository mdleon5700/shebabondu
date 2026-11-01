/**
 * CHAKRI SHEBA — STEP 05: PUBLICATION LIFECYCLE STATE MACHINE
 * Centralized state transition service enforcing auditable, valid publishing status transitions.
 */

import { PublicationStatus, PublicationStatusTransition } from './types';

// Strict State Transition Matrix
const ALLOWED_TRANSITIONS: Record<PublicationStatus, PublicationStatus[]> = {
  DRAFT: ['CONTENT_IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
  CONTENT_IN_PROGRESS: ['PENDING_REVIEW', 'DRAFT'],
  PENDING_REVIEW: ['CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'DRAFT'],
  CHANGES_REQUESTED: ['CONTENT_IN_PROGRESS', 'PENDING_REVIEW', 'DRAFT'],
  APPROVED: ['SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'PUBLISHED_WITH_WARNINGS', 'DRAFT'],
  SCHEDULED: ['PUBLISHING', 'PUBLISHED', 'PUBLISHED_WITH_WARNINGS', 'APPROVED', 'PUBLICATION_FAILED'],
  PUBLISHING: ['PUBLISHED', 'PUBLISHED_WITH_WARNINGS', 'PUBLICATION_FAILED'],
  PUBLISHED: ['UPDATE_PENDING', 'UNPUBLISH_PENDING', 'UNPUBLISHED', 'EXPIRED', 'ARCHIVED'],
  PUBLISHED_WITH_WARNINGS: ['UPDATE_PENDING', 'UNPUBLISH_PENDING', 'UNPUBLISHED', 'EXPIRED', 'ARCHIVED'],
  UPDATE_PENDING: ['PENDING_REVIEW', 'APPROVED', 'PUBLISHING', 'PUBLISHED'],
  UNPUBLISH_PENDING: ['UNPUBLISHED', 'PUBLISHED'],
  UNPUBLISHED: ['APPROVED', 'PUBLISHING', 'PUBLISHED', 'ARCHIVED'],
  EXPIRED: ['ARCHIVED', 'UPDATE_PENDING', 'PUBLISHED'],
  ARCHIVED: ['UNPUBLISHED', 'PUBLISHED'],
  REJECTED: ['DRAFT', 'PENDING_REVIEW'],
  PUBLICATION_FAILED: ['SCHEDULED', 'PUBLISHING', 'APPROVED', 'DRAFT']
};

export interface TransitionResult {
  success: boolean;
  fromStatus: PublicationStatus;
  toStatus: PublicationStatus;
  transition?: PublicationStatusTransition;
  error?: string;
}

export function canTransition(from: PublicationStatus, to: PublicationStatus): boolean {
  if (from === to) return true; // Idempotent no-op
  const allowed = ALLOWED_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

export function executeStatusTransition(
  currentStatus: PublicationStatus,
  targetStatus: PublicationStatus,
  actor: string,
  reason: string,
  meta?: { revisionId?: string; queueId?: string }
): TransitionResult {
  if (!canTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      error: `অবৈধ স্ট্যাটাস ট্রানজিশন: ${currentStatus} থেকে সরাসরি ${targetStatus}-এ পরিবর্তন করার নিয়ম নেই।`
    };
  }

  const transition: PublicationStatusTransition = {
    fromStatus: currentStatus,
    toStatus: targetStatus,
    actor: actor || 'SYSTEM',
    timestamp: new Date().toISOString(),
    reason: reason || 'স্ট্যাটাস আপডেট',
    revisionId: meta?.revisionId,
    queueId: meta?.queueId
  };

  return {
    success: true,
    fromStatus: currentStatus,
    toStatus: targetStatus,
    transition
  };
}

export function getBengaliStatusLabel(status: PublicationStatus): string {
  const map: Record<PublicationStatus, string> = {
    DRAFT: 'ড্রাফট (Draft)',
    CONTENT_IN_PROGRESS: 'কন্টেন্ট তৈরির কাজ চলছে',
    PENDING_REVIEW: 'রিভিউ অপেক্ষায় (Pending Review)',
    CHANGES_REQUESTED: 'সংশোধন অনুরোধকৃত',
    APPROVED: 'অনুমোদিত (Approved)',
    SCHEDULED: 'শিডিউলকৃত (Scheduled)',
    PUBLISHING: 'প্রকাশনা চলমান (Publishing)',
    PUBLISHED: 'প্রকাশিত (Published)',
    PUBLISHED_WITH_WARNINGS: 'সতর্কতাসহ প্রকাশিত',
    UPDATE_PENDING: 'হালনাগাদ অপেক্ষায়',
    UNPUBLISH_PENDING: 'অপ্রকাশ অপেক্ষায়',
    UNPUBLISHED: 'অপ্রকাশিত (Unpublished)',
    EXPIRED: 'মেয়াদোত্তীর্ণ (Expired)',
    ARCHIVED: 'আর্কাইভকৃত (Archived)',
    REJECTED: 'প্রত্যাখ্যাত (Rejected)',
    PUBLICATION_FAILED: 'প্রকাশনা ব্যর্থ (Failed)'
  };
  return map[status] || status;
}
