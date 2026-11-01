/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: NOTIFICATION EVENT CATALOG
 * Authoritative Event Registry, Default Priorities, Channel Rules & Rate Limits
 */

import { NotificationEventDefinition, NotificationEventType } from './types';

export const NOTIFICATION_EVENT_CATALOG: Record<NotificationEventType, NotificationEventDefinition> = {
  JOB_PUBLISHED: {
    type: 'JOB_PUBLISHED',
    name: 'New Job Circular Published',
    nameBn: 'নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশিত',
    category: 'jobs',
    defaultPriority: 'NORMAL',
    allowedChannels: ['in_app', 'email', 'web_push'],
    isTransactional: false,
    requiresAuth: false,
    rateLimitPerHour: 10
  },
  JOB_UPDATED: {
    type: 'JOB_UPDATED',
    name: 'Job Circular Details Updated',
    nameBn: 'নিয়োগ বিজ্ঞপ্তির তথ্য হালনাগাদ',
    category: 'jobs',
    defaultPriority: 'NORMAL',
    allowedChannels: ['in_app'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  JOB_DEADLINE_APPROACHING: {
    type: 'JOB_DEADLINE_APPROACHING',
    name: 'Application Deadline Approaching',
    nameBn: 'আবেদনের শেষ সময় ঘনিয়ে এসেছে',
    category: 'deadlines',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app', 'email', 'sms', 'web_push'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  JOB_DEADLINE_TODAY: {
    type: 'JOB_DEADLINE_TODAY',
    name: 'Application Deadline Closing Today',
    nameBn: 'আবেদনের শেষ তারিখ আজ',
    category: 'deadlines',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app', 'email', 'sms', 'web_push'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 3
  },
  JOB_DEADLINE_EXTENDED: {
    type: 'JOB_DEADLINE_EXTENDED',
    name: 'Application Deadline Extended',
    nameBn: 'আবেদনের সময়সীমা বৃদ্ধি করা হয়েছে',
    category: 'deadlines',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app', 'email', 'web_push'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  JOB_CANCELLED: {
    type: 'JOB_CANCELLED',
    name: 'Job Circular Cancelled',
    nameBn: 'নিয়োগ বিজ্ঞপ্তি বাতিল নোটিশ',
    category: 'deadlines',
    defaultPriority: 'CRITICAL',
    allowedChannels: ['in_app', 'email', 'sms'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  JOB_SUSPENDED: {
    type: 'JOB_SUSPENDED',
    name: 'Job Recruitment Suspended',
    nameBn: 'নিয়োগ কার্যক্রম সাময়িক স্থগিত',
    category: 'deadlines',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app', 'email'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  RECOMMENDED_JOB_MATCH: {
    type: 'RECOMMENDED_JOB_MATCH',
    name: 'Smart Job Recommendation Match',
    nameBn: 'আপনার প্রোফাইলের সাথে নতুন উপযুক্ত চাকরি',
    category: 'recommendations',
    defaultPriority: 'NORMAL',
    allowedChannels: ['in_app', 'email'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 5
  },
  APPLICATION_STATUS_CHANGED: {
    type: 'APPLICATION_STATUS_CHANGED',
    name: 'Job Application Status Updated',
    nameBn: 'চাকরি আবেদনের স্ট্যাটাস পরিবর্তন',
    category: 'applications',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app', 'email', 'sms'],
    isTransactional: true,
    requiresAuth: true,
    rateLimitPerHour: 10
  },
  ACCOUNT_SECURITY_ALERT: {
    type: 'ACCOUNT_SECURITY_ALERT',
    name: 'Account & Security Alert',
    nameBn: 'অ্যাকাউন্ট ও নিরাপত্তা সতর্কবার্তা',
    category: 'security',
    defaultPriority: 'CRITICAL',
    allowedChannels: ['in_app', 'email', 'sms'],
    isTransactional: true, // Cannot be unsubscribed
    requiresAuth: true,
    rateLimitPerHour: 20
  },
  DAILY_DIGEST: {
    type: 'DAILY_DIGEST',
    name: 'Daily Job Digest',
    nameBn: 'আজকের চাকরির দৈনিক ডাইজেস্ট',
    category: 'digest',
    defaultPriority: 'LOW',
    allowedChannels: ['in_app', 'email'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 1
  },
  WEEKLY_DIGEST: {
    type: 'WEEKLY_DIGEST',
    name: 'Weekly Job Summary Digest',
    nameBn: 'সাপ্তাহিক চাকরির নির্বাচিত ডাইজেস্ট',
    category: 'digest',
    defaultPriority: 'LOW',
    allowedChannels: ['in_app', 'email'],
    isTransactional: false,
    requiresAuth: true,
    rateLimitPerHour: 1
  },
  ADMIN_SYSTEM_ALERT: {
    type: 'ADMIN_SYSTEM_ALERT',
    name: 'Admin Operational Incident',
    nameBn: 'অ্যাডমিন অপারেশনাল সিস্টেম অ্যালার্ট',
    category: 'admin',
    defaultPriority: 'HIGH',
    allowedChannels: ['in_app'],
    isTransactional: true,
    requiresAuth: true,
    rateLimitPerHour: 50
  }
};

export class NotificationCatalogHelper {
  public static getDefinition(type: NotificationEventType): NotificationEventDefinition {
    return NOTIFICATION_EVENT_CATALOG[type] || {
      type,
      name: type,
      nameBn: 'সিস্টেম নোটিফিকেশন',
      category: 'jobs',
      defaultPriority: 'NORMAL',
      allowedChannels: ['in_app'],
      isTransactional: false,
      requiresAuth: true,
      rateLimitPerHour: 10
    };
  }

  public static isChannelAllowed(type: NotificationEventType, channel: any): boolean {
    const def = this.getDefinition(type);
    return def.allowedChannels.includes(channel);
  }
}
