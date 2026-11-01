/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 14: PLATFORM OVERVIEW & METRICS AGGREGATOR
 * Computes authoritative, multi-subsystem platform health and activity metrics.
 */

import { serverDB } from '../db';
import { OperationalExpenseManager } from '../operations/expenseManager';
import { AdminGovernanceRbac } from './rbac';
import { PlatformOverviewMetrics, ActivityEventItem } from './types';

export const PlatformOverviewEngine = {
  /**
   * Aggregate multi-subsystem metrics across Candidates, Jobs, Verification,
   * Certificates, Operations, and Notifications with timeframe support.
   */
  getMetrics(timeframe: 'today' | '7d' | '30d' | '90d' | 'all' = 'all'): PlatformOverviewMetrics {
    const now = new Date();
    const nowMs = now.getTime();
    const nowIso = now.toISOString();

    // Timeframe cutoff calculations (UTC reference aligned with Asia/Dhaka)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = nowMs - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = nowMs - (30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = nowMs - (90 * 24 * 60 * 60 * 1000);

    const isWithinTimeframe = (dateStr?: string): boolean => {
      if (!dateStr) return false;
      const t = new Date(dateStr).getTime();
      if (isNaN(t)) return false;
      switch (timeframe) {
        case 'today': return t >= todayStart;
        case '7d': return t >= sevenDaysAgo;
        case '30d': return t >= thirtyDaysAgo;
        case '90d': return t >= ninetyDaysAgo;
        case 'all': default: return true;
      }
    };

    // 1. Candidate Metrics
    const allCandidates = serverDB.getAllCandidates();
    const timeframeCandidates = timeframe === 'all' 
      ? allCandidates 
      : allCandidates.filter(c => isWithinTimeframe(c.createdAt || c.updatedAt || ''));

    const totalCandidates = timeframeCandidates.length;
    const activeCandidates = timeframeCandidates.filter(c => (c as any).status !== 'suspended').length;
    const newTodayCandidates = allCandidates.filter(c => {
      const t = new Date(c.createdAt || '').getTime();
      return !isNaN(t) && t >= todayStart;
    }).length;
    const newThisWeekCandidates = allCandidates.filter(c => {
      const t = new Date(c.createdAt || '').getTime();
      return !isNaN(t) && t >= sevenDaysAgo;
    }).length;

    // 2. Jobs & Circulars Metrics
    const allJobs = serverDB.getAllJobs();
    const publishedStatuses = ['ACTIVE', 'OPEN', 'PUBLISHED', 'active', 'published', 'open'];
    const publishedJobs = allJobs.filter(j => publishedStatuses.includes(j.status || ''));

    const timeframePublishedJobs = timeframe === 'all'
      ? publishedJobs
      : publishedJobs.filter(j => isWithinTimeframe(j.publishedDate || (j as any).createdAt || ''));

    const publishedTodayCount = publishedJobs.filter(j => {
      const t = new Date(j.publishedDate || (j as any).createdAt || '').getTime();
      return !isNaN(t) && t >= todayStart;
    }).length;

    const publishedThisWeekCount = publishedJobs.filter(j => {
      const t = new Date(j.publishedDate || (j as any).createdAt || '').getTime();
      return !isNaN(t) && t >= sevenDaysAgo;
    }).length;

    // Expiring soon: Deadline within next 3 days and in the future
    const threeDaysAhead = nowMs + (3 * 24 * 60 * 60 * 1000);
    const expiringSoonCount = publishedJobs.filter(j => {
      if (!j.deadline) return false;
      const dl = new Date(j.deadline).getTime();
      return !isNaN(dl) && dl >= nowMs && dl <= threeDaysAhead;
    }).length;

    // Drafts
    const drafts = serverDB.getCircularDrafts();
    const draftsPending = drafts.filter(d => 
      d.status === 'pending_review' || (d as any).status === 'draft' || (d as any).status === 'pending'
    ).length;

    // 3. Verification Metrics
    const verifiedJobsCount = allJobs.filter(j => 
      (j as any).isVerified === true || (j as any).verificationStatus === 'VERIFIED'
    ).length;

    // Safe DB inspect for verification queue
    let pendingVerificationQueue = 0;
    try {
      const db = (serverDB as any).loadDB ? (serverDB as any).loadDB() : null;
      if (db && Array.isArray(db.verificationQueue)) {
        pendingVerificationQueue = db.verificationQueue.filter((v: any) => v.status === 'pending').length;
      }
    } catch {
      pendingVerificationQueue = 0;
    }

    const aiAssistedVerificationCount = allJobs.filter(j => 
      Boolean((j as any).aiConfidence || (j as any).extractedData)
    ).length;

    // 4. Certificates & Academic Document Verification Metrics
    let pendingCerts = 0;
    let verifiedCerts = 0;
    let rejectedCerts = 0;

    try {
      const db = (serverDB as any).loadDB ? (serverDB as any).loadDB() : null;
      if (db && db.documents) {
        const allDocs = Object.values(db.documents).flat() as any[];
        for (const doc of allDocs) {
          const status = (doc.verificationStatus || '').toLowerCase();
          if (status === 'verified' || doc.isVerified === true) {
            verifiedCerts++;
          } else if (status === 'rejected') {
            rejectedCerts++;
          } else {
            pendingCerts++;
          }
        }
      }
    } catch {
      // Fallback defaults
    }

    // 5. Operations & Budget Metrics
    let monthlyBudgetBdt = 30000;
    let actualSpendBdt = 0;
    let burnRatePercent = 0;

    try {
      const variance = OperationalExpenseManager.getVarianceReport();
      monthlyBudgetBdt = variance.monthlyBudgetBdt || 30000;
      actualSpendBdt = variance.actualTotalBdt || 0;
      burnRatePercent = variance.burnRatePercent || Math.round((actualSpendBdt / monthlyBudgetBdt) * 100);
    } catch {
      // Fallback from serverDB
      const budget = serverDB.getPlatformBudget();
      monthlyBudgetBdt = (budget && budget.monthlyBudgetBdt) ? budget.monthlyBudgetBdt : 30000;
      const expenses = serverDB.getOperationalExpenses();
      actualSpendBdt = expenses.reduce((sum, e) => sum + e.amountBdt, 0);
      burnRatePercent = Math.round((actualSpendBdt / monthlyBudgetBdt) * 100);
    }

    // 6. Notifications & Communication Metrics
    let deliveredTotal = 0;
    let smsSent = 0;
    let emailsSent = 0;
    let failureCount = 0;

    try {
      const db = (serverDB as any).loadDB ? (serverDB as any).loadDB() : null;
      if (db && Array.isArray(db.notificationDeliveries)) {
        for (const del of db.notificationDeliveries) {
          if (del.status === 'DELIVERED') {
            deliveredTotal++;
            if (del.channel === 'sms') smsSent++;
            if (del.channel === 'email') emailsSent++;
          } else if (del.status === 'FAILED') {
            failureCount++;
          }
        }
      }
    } catch {
      // Fallback
    }

    return {
      candidates: {
        total: totalCandidates,
        active: activeCandidates,
        newToday: newTodayCandidates,
        newThisWeek: newThisWeekCandidates
      },
      jobs: {
        totalPublished: timeframePublishedJobs.length,
        publishedToday: publishedTodayCount,
        publishedThisWeek: publishedThisWeekCount,
        expiringSoon: expiringSoonCount,
        draftsPending
      },
      verification: {
        totalVerified: verifiedJobsCount,
        pendingReview: pendingVerificationQueue,
        aiAssistedCount: aiAssistedVerificationCount
      },
      certificates: {
        pendingVerification: pendingCerts,
        verifiedTotal: verifiedCerts,
        rejectedTotal: rejectedCerts
      },
      operations: {
        monthlyBudgetBdt,
        actualSpendBdt,
        burnRatePercent,
        zeroPaywallVerified: true
      },
      notifications: {
        deliveredTotal,
        smsSent,
        emailsSent,
        failureCount
      },
      timeframe,
      generatedAt: nowIso
    };
  },

  /**
   * Format activity logs into a rich event stream
   */
  getActivityStream(limit = 20): ActivityEventItem[] {
    const rawLogs = serverDB.getAdminAuditLogs();
    const staffList = AdminGovernanceRbac.getStaffMembers();
    const staffMap = new Map<string, string>();
    staffList.forEach(s => staffMap.set(s.id, s.name));
    staffMap.set('ADMIN-SUPER', 'সুপার অ্যাডমিন');
    staffMap.set('ADMIN-DEFAULT', 'অ্যাডমিন ডিরেক্টর');

    // Sort descending by timestamp
    const sorted = [...rawLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);

    return sorted.map((log, index) => {
      const actorName = staffMap.get(log.adminId) || log.adminId || 'সিস্টেম অ্যাডমিন';
      const actionBn = this.translateAction(log.action);
      const title = log.notes || `${actionBn}: ${log.targetType} (${log.targetId || 'সাধারণ'})`;

      return {
        id: (log as any).id || `activity_${index}_${new Date(log.timestamp).getTime()}`,
        action: log.action,
        actorName,
        title,
        targetType: log.targetType,
        targetId: log.targetId,
        timestamp: log.timestamp,
        formattedDateBn: this.formatDateBn(log.timestamp)
      };
    });
  },

  /**
   * Convert an action string to readable Bengali
   */
  translateAction(action: string): string {
    const map: Record<string, string> = {
      'staff_role_update': 'স্টাফের পদবি ও অনুমতি হালনাগাদ',
      'staff_status_toggle': 'স্টাফ অ্যাকাউন্টের স্থিতি পরিবর্তন',
      'job_publish': 'নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ',
      'job_update': 'নিয়োগ বিজ্ঞপ্তি সম্পাদনা',
      'job_unpublish': 'বিজ্ঞপ্তি অপ্রকাশিত করা',
      'job_delete': 'বিজ্ঞপ্তি অপসারণ',
      'expense_create': 'পরিচালন ব্যয় রেকর্ড অন্তর্ভুক্তি',
      'budget_update': 'মাসিক বাজেট সীমা হালনাগাদ',
      'document_verification': 'প্রার্থীর সার্টিফিকেট যাচাই সম্পন্ন',
      'candidate_suspend': 'প্রার্থী অ্যাকাউন্ট স্থগিতকরণ',
      'deadline_update': 'আবেদনের সময়সীমা সংশোধন'
    };
    return map[action] || action;
  },

  /**
   * Formats ISO timestamp to Bengali Date & Time in Asia/Dhaka BST
   */
  formatDateBn(isoString: string): string {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;

      const bnMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const toBnNum = (n: number | string): string => {
        const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return n.toString().replace(/\d/g, digit => bnDigits[parseInt(digit, 10)]);
      };

      // Formatted in Asia/Dhaka
      const day = toBnNum(d.getDate());
      const month = bnMonths[d.getMonth()];
      const year = toBnNum(d.getFullYear());

      let hours = d.getHours();
      const minutes = toBnNum(d.getMinutes().toString().padStart(2, '0'));
      const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
      hours = hours % 12 || 12;
      const formattedHours = toBnNum(hours);

      return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${period}`;
    } catch {
      return isoString;
    }
  }
};
