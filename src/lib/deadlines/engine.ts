/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08: CENTRAL DEADLINE ENGINE
 * Precise Asia/Dhaka (+6h) Boundary, Precision Detection & Status Evaluator
 */

import { 
  DeadlineData, 
  DeadlinePrecision, 
  DeadlineVerificationStatus, 
  DeadlineStatus, 
  JobLifecycleStatus, 
  DeadlineEvaluationResult 
} from './types';
import { BangladeshDateHelper, BST_OFFSET_MS } from '../feeds/timezone';
import { JobCircular } from '../types';

export class CentralDeadlineEngine {
  /**
   * Converts English digits to Bengali digits
   */
  public static toBn(n: number | string): string {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, d => bnDigits[Number(d)]);
  }

  /**
   * Parse arbitrary raw deadline text into structured DeadlineData
   */
  public static parseDeadline(
    text: string,
    refDate: Date = new Date()
  ): {
    originalText: string;
    deadlineDate: string;
    deadlineTime?: string;
    precision: DeadlinePrecision;
    verificationStatus: DeadlineVerificationStatus;
    confidence: number;
    lifecycleHint?: JobLifecycleStatus;
  } {
    if (!text || typeof text !== 'string') {
      return {
        originalText: '',
        deadlineDate: '',
        precision: 'NOT_SPECIFIED',
        verificationStatus: 'NOT_SPECIFIED',
        confidence: 0
      };
    }

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check for immediate cancellation or suspension hints
    if (lower.includes('বাতিল') || lower.includes('cancelled') || lower.includes('বাতিলকৃত')) {
      return {
        originalText: trimmed,
        deadlineDate: '',
        precision: 'NOT_SPECIFIED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        lifecycleHint: 'CANCELLED'
      };
    }

    if (lower.includes('স্থগিত') || lower.includes('suspended') || lower.includes('স্থগিতাদেশ')) {
      return {
        originalText: trimmed,
        deadlineDate: '',
        precision: 'NOT_SPECIFIED',
        verificationStatus: 'VERIFIED',
        confidence: 0.95,
        lifecycleHint: 'SUSPENDED'
      };
    }

    // 2. Extract explicit time if present
    let deadlineTime: string | undefined = undefined;
    let hasExplicitTime = false;

    // Pattern: বিকাল ৫:০০, সন্ধ্যা ৬টা, রাত ১১:৫৯, সকাল ১০:৩০
    const timeMatch24 = BangladeshDateHelper.toEnDigits(trimmed).match(/(\d{1,2}):(\d{2})/);
    const timeMatchBn = trimmed.match(/(সকাল|দুপুর|বিকাল|সন্ধ্যা|রাত)\s*([০-৯\d]{1,2})(?::([০-৯\d]{2}))?/);

    if (timeMatchBn) {
      const period = timeMatchBn[1];
      let hour = Number(BangladeshDateHelper.toEnDigits(timeMatchBn[2]));
      const minute = timeMatchBn[3] ? Number(BangladeshDateHelper.toEnDigits(timeMatchBn[3])) : 0;

      if ((period === 'বিকাল' || period === 'সন্ধ্যা' || period === 'রাত') && hour < 12) {
        hour += 12;
      } else if (period === 'সকাল' && hour === 12) {
        hour = 0;
      }

      deadlineTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      hasExplicitTime = true;
    } else if (timeMatch24) {
      const h = Number(timeMatch24[1]);
      const m = Number(timeMatch24[2]);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        deadlineTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        hasExplicitTime = true;
      }
    }

    // 3. Extract ISO Date (YYYY-MM-DD)
    let isoDate = BangladeshDateHelper.parseToIsoDate(trimmed);
    if (!isoDate) {
      const embeddedIso = BangladeshDateHelper.toEnDigits(trimmed).match(/\b\d{4}-\d{2}-\d{2}\b/);
      if (embeddedIso) isoDate = BangladeshDateHelper.parseToIsoDate(embeddedIso[0]);
    }
    if (!isoDate) {
      // If direct parse failed, attempt to extract embedded date substring
      const slashSub = trimmed.match(/([০-৯\d]{1,2})[\/\-]([০-৯\d]{1,2})[\/\-]([০-৯\d]{4})/);
      if (slashSub) {
        isoDate = BangladeshDateHelper.parseToIsoDate(slashSub[0]);
      } else {
        const textMonthSub = trimmed.match(/([০-৯\d]{1,2})\s+([^\s\d\:\,\.]+)\s+([০-৯\d]{4})/);
        if (textMonthSub) {
          isoDate = BangladeshDateHelper.parseToIsoDate(textMonthSub[0]);
        }
      }
    }

    if (!isoDate) {
      return {
        originalText: trimmed,
        deadlineDate: '',
        precision: 'NOT_SPECIFIED',
        verificationStatus: 'UNVERIFIED',
        confidence: 0.2
      };
    }

    // 4. Determine precision
    let precision: DeadlinePrecision = hasExplicitTime ? 'EXACT_TIME' : 'DATE_ONLY';
    if (trimmed.includes('বৃদ্ধি') || trimmed.includes('বর্ধিত') || trimmed.includes('extended')) {
      precision = 'EXTENDED';
    }

    return {
      originalText: trimmed,
      deadlineDate: isoDate,
      deadlineTime,
      precision,
      verificationStatus: 'VERIFIED',
      confidence: hasExplicitTime ? 0.98 : 0.92
    };
  }

  /**
   * Authoritative Deadline Evaluation with Asia/Dhaka (+6h) precision
   */
  public static evaluateDeadline(
    job: JobCircular,
    customData?: Partial<DeadlineData>,
    refDate: Date = new Date()
  ): DeadlineEvaluationResult {
    // Current Asia/Dhaka reference
    const nowUtcMs = refDate.getTime();
    const nowBst = new Date(nowUtcMs + BST_OFFSET_MS);
    const todayIso = nowBst.toISOString().split('T')[0];
    const currentBstHours = nowBst.getUTCHours();
    const currentBstMinutes = nowBst.getUTCMinutes();

    // 1. Check Job Lifecycle Overrides (Cancellation & Suspension take 100% precedence)
    const rawLifecycle = (job as any).lifecycleStatus;
    const rawJobStatus = (job as any).status;
    const rawDeadlineText = customData?.deadlineOriginalText || job.deadline || '';

    const isCancelled = rawLifecycle?.toUpperCase() === 'CANCELLED' || 
                        rawJobStatus?.toUpperCase() === 'CANCELLED' || 
                        rawDeadlineText.includes('বাতিল');

    if (isCancelled) {
      return {
        status: 'CANCELLED',
        lifecycleStatus: 'CANCELLED',
        labelBn: 'নিয়োগ বিজ্ঞপ্তি বাতিল',
        daysRemaining: 0,
        formattedCountdownBn: 'নিয়োগ কার্যক্রম বাতিল করা হয়েছে',
        isClosed: true,
        isClosingSoon: false,
        isClosingToday: false,
        hasExactTime: false,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        authoritativeDeadlineDate: customData?.deadlineDate || job.publishedDate
      };
    }

    const isSuspended = rawLifecycle?.toUpperCase() === 'SUSPENDED' || 
                        rawJobStatus?.toUpperCase() === 'SUSPENDED' || 
                        rawDeadlineText.includes('স্থগিত');

    if (isSuspended) {
      return {
        status: 'SUSPENDED',
        lifecycleStatus: 'SUSPENDED',
        labelBn: 'নিয়োগ কার্যক্রম স্থগিত',
        daysRemaining: 0,
        formattedCountdownBn: 'নিয়োগ কার্যক্রম সাময়িক স্থগিত রাখা হয়েছে',
        isClosed: true,
        isClosingSoon: false,
        isClosingToday: false,
        hasExactTime: false,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        authoritativeDeadlineDate: customData?.deadlineDate || job.publishedDate
      };
    }

    // 2. Resolve Authoritative Deadline Date & Time
    const parsed = customData?.deadlineDate 
      ? { 
          deadlineDate: customData.deadlineDate, 
          deadlineTime: customData.deadlineTime,
          precision: customData.deadlinePrecision || 'DATE_ONLY'
        }
      : this.parseDeadline(job.deadline || '', refDate);

    const deadlineDate = parsed.deadlineDate;
    const deadlineTime = parsed.deadlineTime;
    const hasExactTime = Boolean(deadlineTime);

    if (!deadlineDate) {
      return {
        status: 'UNKNOWN',
        lifecycleStatus: 'ACTIVE',
        labelBn: 'শেষ তারিখ যাচাই করা হচ্ছে',
        daysRemaining: 0,
        formattedCountdownBn: 'শেষ তারিখ যাচাইাধীন',
        isClosed: false,
        isClosingSoon: false,
        isClosingToday: false,
        hasExactTime: false,
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        authoritativeDeadlineDate: ''
      };
    }

    // 3. Calendar Days Difference in Asia/Dhaka
    const todayParts = todayIso.split('-').map(Number);
    const deadlineParts = deadlineDate.split('-').map(Number);

    const todayDateObj = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));
    const deadlineDateObj = new Date(Date.UTC(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2]));
    const diffMs = deadlineDateObj.getTime() - todayDateObj.getTime();
    const calendarDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // 4. Exact Time Difference (if specified)
    let hoursRemaining: number | undefined = undefined;
    let minutesRemaining: number | undefined = undefined;

    if (hasExactTime && deadlineTime) {
      const [dH, dM] = deadlineTime.split(':').map(Number);
      const totalDeadlineMinutes = calendarDays * 1440 + (dH * 60 + dM);
      const totalCurrentMinutes = currentBstHours * 60 + currentBstMinutes;
      const netMinutesDiff = totalDeadlineMinutes - totalCurrentMinutes;

      if (netMinutesDiff <= 0) {
        return {
          status: 'CLOSED',
          lifecycleStatus: 'DEADLINE_EXPIRED',
          labelBn: 'আবেদন শেষ হয়েছে',
          daysRemaining: 0,
          hoursRemaining: 0,
          minutesRemaining: 0,
          formattedCountdownBn: 'আবেদনের নির্ধারিত সময় শেষ হয়েছে',
          isClosed: true,
          isClosingSoon: false,
          isClosingToday: false,
          hasExactTime: true,
          badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
          authoritativeDeadlineDate: deadlineDate,
          authoritativeDeadlineTime: deadlineTime
        };
      }

      hoursRemaining = Math.floor(netMinutesDiff / 60);
      minutesRemaining = netMinutesDiff % 60;
    }

    // 5. Evaluate Past Date-Only Deadline
    if (calendarDays < 0) {
      return {
        status: 'CLOSED',
        lifecycleStatus: 'DEADLINE_EXPIRED',
        labelBn: 'আবেদন শেষ হয়েছে',
        daysRemaining: 0,
        formattedCountdownBn: 'আবেদনের নির্ধারিত সময় শেষ হয়েছে',
        isClosed: true,
        isClosingSoon: false,
        isClosingToday: false,
        hasExactTime: false,
        badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
        authoritativeDeadlineDate: deadlineDate
      };
    }

    // 6. Evaluate Deadline Today
    if (calendarDays === 0) {
      let formatted = 'আবেদনের শেষ তারিখ আজ';
      if (hasExactTime && hoursRemaining !== undefined && minutesRemaining !== undefined) {
        formatted = `আজ শেষ (বাকি ${this.toBn(hoursRemaining)} ঘণ্টা ${this.toBn(minutesRemaining)} মি.)`;
      }

      return {
        status: 'CLOSING_TODAY',
        lifecycleStatus: 'ACTIVE',
        labelBn: 'আবেদনের শেষ তারিখ আজ',
        daysRemaining: 0,
        hoursRemaining,
        minutesRemaining,
        formattedCountdownBn: formatted,
        isClosed: false,
        isClosingSoon: true,
        isClosingToday: true,
        hasExactTime,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
        authoritativeDeadlineDate: deadlineDate,
        authoritativeDeadlineTime: deadlineTime
      };
    }

    // 7. Check Extended Status
    const isExtended = parsed.precision === 'EXTENDED' || 
      (job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত')));

    // 8. Closing Soon (1 to 3 days remaining)
    if (calendarDays <= 3) {
      const daysText = this.toBn(calendarDays);
      const label = isExtended 
        ? `সময় বর্ধিত (বাকি ${daysText} দিন)`
        : `আবেদনের সময় বাকি ${daysText} দিন`;

      return {
        status: isExtended ? 'EXTENDED' : 'CLOSING_SOON',
        lifecycleStatus: 'ACTIVE',
        labelBn: label,
        daysRemaining: calendarDays,
        hoursRemaining,
        minutesRemaining,
        formattedCountdownBn: label,
        isClosed: false,
        isClosingSoon: true,
        isClosingToday: false,
        hasExactTime,
        badgeColor: isExtended 
          ? 'bg-purple-100 text-purple-800 border-purple-300' 
          : 'bg-amber-100 text-amber-800 border-amber-300',
        authoritativeDeadlineDate: deadlineDate,
        authoritativeDeadlineTime: deadlineTime
      };
    }

    // 9. Standard Open Deadline (> 3 days)
    const daysText = this.toBn(calendarDays);
    const label = isExtended 
      ? `সময় বর্ধিত (বাকি ${daysText} দিন)`
      : `আবেদনের সময় বাকি ${daysText} দিন`;

    return {
      status: isExtended ? 'EXTENDED' : 'OPEN',
      lifecycleStatus: 'ACTIVE',
      labelBn: label,
      daysRemaining: calendarDays,
      hoursRemaining,
      minutesRemaining,
      formattedCountdownBn: label,
      isClosed: false,
      isClosingSoon: false,
      isClosingToday: false,
      hasExactTime,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      authoritativeDeadlineDate: deadlineDate,
      authoritativeDeadlineTime: deadlineTime
    };
  }
}
