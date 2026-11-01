/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: NOTIFICATION TEMPLATES ENGINE
 * Multi-channel, Bengali-first notification templates with safe variable interpolation.
 */

import { NotificationEventType, NotificationChannel, NotificationTemplate } from './types';

export const DEFAULT_NOTIFICATION_TEMPLATES: Record<string, Partial<NotificationTemplate>> = {
  'JOB_PUBLISHED:in_app': {
    titleTemplate: '{{organization}} এ নতুন নিয়োগ: {{job_title}}',
    bodyTemplate: '{{organization}} এর অধীনে {{job_title}} পদে নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আবেদনের শেষ তারিখ: {{deadline}}।',
    supportedVariables: ['organization', 'job_title', 'deadline', 'link']
  },
  'JOB_DEADLINE_APPROACHING:in_app': {
    titleTemplate: 'আবেদনের সময় শেষ হচ্ছে: {{job_title}}',
    bodyTemplate: '{{job_title}} পদে আবেদনের সময় আর মাত্র {{days_remaining}} দিন বাকি রয়েছে। দ্রুত আবেদন সম্পন্ন করুন।',
    supportedVariables: ['job_title', 'organization', 'days_remaining', 'deadline', 'link']
  },
  'JOB_DEADLINE_TODAY:in_app': {
    titleTemplate: 'জরুরি: আবেদনের শেষ দিন আজ! ({{job_title}})',
    bodyTemplate: '{{organization}} এর {{job_title}} পদে আবেদনের সময়সীমা আজই শেষ হবে। সুযোগ হাতছাড়া করবেন না।',
    supportedVariables: ['job_title', 'organization', 'link']
  },
  'JOB_DEADLINE_EXTENDED:in_app': {
    titleTemplate: 'আবেদনের সময় বাড়ানো হয়েছে: {{job_title}}',
    bodyTemplate: '{{organization}} এর নিয়োগ বিজ্ঞপ্তির আবেদনের সময়সীমা বাড়িয়ে {{new_deadline}} পর্যন্ত নির্ধারণ করা হয়েছে।',
    supportedVariables: ['job_title', 'organization', 'new_deadline', 'link']
  },
  'JOB_CANCELLED:in_app': {
    titleTemplate: 'নিয়োগ বিজ্ঞপ্তি বাতিল: {{job_title}}',
    bodyTemplate: '{{organization}} কর্তৃক {{job_title}} নিয়োগ বিজ্ঞপ্তিটি অনিবার্য কারণে বাতিল ঘোষণা করা হয়েছে।',
    supportedVariables: ['job_title', 'organization', 'link']
  },
  'RECOMMENDED_JOB_MATCH:in_app': {
    titleTemplate: 'আপনার প্রোফাইলের উপযুক্ত নতুন চাকরি ({{match_score}}% মিল)',
    bodyTemplate: 'আপনার শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার সাথে মানানসই {{organization}} এর {{job_title}} পদে আবেদন করতে পারেন।',
    supportedVariables: ['job_title', 'organization', 'match_score', 'link']
  },
  'APPLICATION_STATUS_CHANGED:in_app': {
    titleTemplate: 'আবেদনের স্ট্যাটাস আপডেট: {{job_title}}',
    bodyTemplate: 'আপনার আবেদনটির বর্তমান অবস্থা: {{status}}। বিস্তারিত জানতে ট্র্যাকিং দেখুন।',
    supportedVariables: ['job_title', 'status', 'tracking_id', 'link']
  },
  'ACCOUNT_SECURITY_ALERT:in_app': {
    titleTemplate: 'নিরাপত্তা সতর্কবার্তা: {{action}}',
    bodyTemplate: 'আপনার চাকরি সেবা অ্যাকাউন্টে {{action}} পরিলক্ষিত হয়েছে। কোনো অসঙ্গতি দেখলে পাসওয়ার্ড পরিবর্তন করুন।',
    supportedVariables: ['action', 'time', 'device']
  },
  'DAILY_DIGEST:in_app': {
    titleTemplate: 'আজকের চাকরির দৈনিক ডাইজেস্ট ({{count}} টি নতুন বিজ্ঞপ্তি)',
    bodyTemplate: 'আপনার পছন্দের ক্যাটাগরিতে আজ {{count}} টি নতুন সরকারি ও ব্যাংক নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    supportedVariables: ['count', 'date', 'link']
  }
};

export class NotificationTemplateManager {
  /**
   * Render a template by replacing variables safely
   */
  public static render(
    templateStr: string, 
    variables: Record<string, string | number | undefined | null>
  ): string {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const val = variables[key];
      return val !== undefined && val !== null ? String(val) : '';
    });
  }

  /**
   * Get template for event type and channel
   */
  public static getTemplate(
    eventType: NotificationEventType, 
    channel: NotificationChannel = 'in_app'
  ): { titleTemplate: string; bodyTemplate: string } {
    const key = `${eventType}:${channel}`;
    const found = DEFAULT_NOTIFICATION_TEMPLATES[key] || DEFAULT_NOTIFICATION_TEMPLATES[`${eventType}:in_app`];

    if (found && found.titleTemplate && found.bodyTemplate) {
      return {
        titleTemplate: found.titleTemplate,
        bodyTemplate: found.bodyTemplate
      };
    }

    // Default fallback
    return {
      titleTemplate: 'চাকরি সেবা নোটিফিকেশন',
      bodyTemplate: 'আপনার অ্যাকাউন্টে একটি নতুন নোটিফিকেশন এসেছে।'
    };
  }
}
