/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 13: OPERATIONAL EXPENSE & BUDGET MANAGER
 * Tracks real platform infrastructure costs (Hosting, DB, Storage, AI, SMS, APIs)
 * and compares them against administrative budgets with automated threshold alerting.
 */

import { serverDB } from '../db';
import {
  OperationalExpenseCategory,
  OperationalExpenseRecord,
  PlatformBudgetConfig,
  BudgetVarianceReport,
  CategoryExpenseBreakdown,
  CostNature,
  ExpensePaymentStatus
} from './types';

export const USD_TO_BDT_RATE = 122.0; // Standard baseline exchange rate

export const CATEGORY_NAMES_BN: Record<OperationalExpenseCategory, string> = {
  hosting: 'ওয়েব হোস্টিং ও সিডিএন (Vercel/Cloudflare)',
  server: 'সার্ভার ও কম্পিউট ইনফ্রাস্ট্রাকচার',
  database: 'ডাটাবেজ সার্ভিস ও ব্যাকআপ ক্লাউড',
  storage: 'ডকুমেন্ট ও ফাইল স্টোরেজ (S3/Cloudinary)',
  bandwidth: 'ব্যান্ডউইথ ও ট্রাফিক ইগ্রেস',
  email: 'ট্রানজেকশনাল ইমেইল সার্ভিস (Resend/Sendgrid)',
  sms: 'মোবাইল এসএমএস গেটওয়ে (Greenweb/Onnorokom)',
  ai_api: 'এআই ও এলএলএম এপিআই (Google Gemini/Vertex)',
  ocr: 'ডকুমেন্ট ওসিআর ও ভিশন প্রসেসিং',
  external_api: 'এক্সটার্নাল সার্কুলার স্পাইডার ও স্ক্র্যাপার',
  domain_infra: 'ডোমেইন, ডিএনএস ও এসএসএল সার্টিফিকেট',
  maintenance: 'প্ল্যাটফর্ম সিকিউরিটি ও মেইনটেন্যান্স',
  other: 'অন্যান্য অপারেশনাল সার্ভিস'
};

export const DEFAULT_BUDGET_CONFIG: PlatformBudgetConfig = {
  monthlyBudgetBdt: 45000, // 45,000 BDT default monthly operational budget
  annualBudgetBdt: 540000,
  categoryBudgetsBdt: {
    hosting: 6000,
    server: 7000,
    database: 5000,
    storage: 4000,
    bandwidth: 3000,
    email: 2000,
    sms: 6000,
    ai_api: 7000,
    ocr: 2000,
    external_api: 1500,
    domain_infra: 500,
    maintenance: 1000,
    other: 0
  },
  alertThresholdPercent: 80,
  criticalThresholdPercent: 100,
  updatedAt: new Date().toISOString(),
  updatedBy: 'ADMIN-SUPER'
};

export const OperationalExpenseManager = {
  /**
   * Get all expenses, optionally filtered by period or category
   */
  getExpenses(filters?: {
    category?: OperationalExpenseCategory;
    billingPeriod?: string;
    costNature?: CostNature;
    paymentStatus?: ExpensePaymentStatus;
    provider?: string;
  }): OperationalExpenseRecord[] {
    const all = serverDB.getOperationalExpenses();
    if (!filters) return all;

    return all.filter(exp => {
      if (filters.category && exp.category !== filters.category) return false;
      if (filters.billingPeriod && exp.billingPeriod !== filters.billingPeriod) return false;
      if (filters.costNature && exp.costNature !== filters.costNature) return false;
      if (filters.paymentStatus && exp.paymentStatus !== filters.paymentStatus) return false;
      if (filters.provider && !exp.provider.toLowerCase().includes(filters.provider.toLowerCase())) return false;
      return true;
    });
  },

  /**
   * Add a new operational expense record
   */
  addExpense(data: Omit<OperationalExpenseRecord, 'id' | 'createdAt' | 'updatedAt' | 'amountBdt'> & {
    amountBdt?: number;
  }): OperationalExpenseRecord {
    const id = `EXP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const normalizedBdt =
      data.amountBdt !== undefined
        ? data.amountBdt
        : data.currency === 'USD'
        ? Math.round(data.amount * USD_TO_BDT_RATE)
        : data.amount;

    const record: OperationalExpenseRecord = {
      ...data,
      id,
      amountBdt: normalizedBdt,
      createdAt: now,
      updatedAt: now
    };

    serverDB.saveOperationalExpense(record);

    // Audit log
    serverDB.recordAdminAudit({
      adminId: data.createdBy || 'ADMIN-SUPER',
      action: 'cost_expense_add',
      targetId: id,
      targetType: 'system',
      changes: {
        title: { new: record.title },
        amount: { new: record.amount },
        amountBdt: { new: record.amountBdt },
        category: { new: record.category },
        provider: { new: record.provider }
      },
      notes: `Operational expense recorded: ${record.title} (${record.amountBdt} BDT)`
    });

    // Check budget alert
    this.checkBudgetAlerts(record.billingPeriod);

    return record;
  },

  /**
   * Update an existing expense record
   */
  updateExpense(id: string, updates: Partial<OperationalExpenseRecord>, adminId = 'ADMIN-SUPER'): OperationalExpenseRecord | null {
    const existing = serverDB.getOperationalExpenseById(id);
    if (!existing) return null;

    let normalizedBdt = existing.amountBdt;
    const amount = updates.amount !== undefined ? updates.amount : existing.amount;
    const currency = updates.currency !== undefined ? updates.currency : existing.currency;

    if (updates.amountBdt !== undefined) {
      normalizedBdt = updates.amountBdt;
    } else if (updates.amount !== undefined || updates.currency !== undefined) {
      normalizedBdt = currency === 'USD' ? Math.round(amount * USD_TO_BDT_RATE) : amount;
    }

    const updated: OperationalExpenseRecord = {
      ...existing,
      ...updates,
      id,
      amount,
      currency,
      amountBdt: normalizedBdt,
      updatedAt: new Date().toISOString()
    };

    serverDB.saveOperationalExpense(updated);

    serverDB.recordAdminAudit({
      adminId,
      action: 'cost_expense_update',
      targetId: id,
      targetType: 'system',
      changes: {
        updates: { old: existing, new: updates }
      },
      notes: `Operational expense updated: ${updated.title}`
    });

    this.checkBudgetAlerts(updated.billingPeriod);

    return updated;
  },

  /**
   * Delete an expense record
   */
  deleteExpense(id: string, adminId = 'ADMIN-SUPER'): boolean {
    const existing = serverDB.getOperationalExpenseById(id);
    if (!existing) return false;

    serverDB.deleteOperationalExpense(id);

    serverDB.recordAdminAudit({
      adminId,
      action: 'cost_expense_delete',
      targetId: id,
      targetType: 'system',
      changes: { deletedId: { old: id } },
      notes: `Operational expense removed: ${existing.title}`
    });

    return true;
  },

  /**
   * Retrieve platform budget config
   */
  getBudgetConfig(): PlatformBudgetConfig {
    const stored = serverDB.getPlatformBudget();
    return stored || DEFAULT_BUDGET_CONFIG;
  },

  /**
   * Update platform budget configuration
   */
  updateBudgetConfig(updates: Partial<PlatformBudgetConfig>, adminId = 'ADMIN-SUPER'): PlatformBudgetConfig {
    const current = this.getBudgetConfig();
    const updated: PlatformBudgetConfig = {
      ...current,
      ...updates,
      categoryBudgetsBdt: {
        ...current.categoryBudgetsBdt,
        ...(updates.categoryBudgetsBdt || {})
      },
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };

    serverDB.savePlatformBudget(updated);

    serverDB.recordAdminAudit({
      adminId,
      action: 'budget_config_update',
      targetId: 'GLOBAL_PLATFORM_BUDGET',
      targetType: 'system',
      changes: {
        budget: { old: current.monthlyBudgetBdt, new: updated.monthlyBudgetBdt }
      },
      notes: `Platform operational budget updated: Monthly BDT ${updated.monthlyBudgetBdt}`
    });

    return updated;
  },

  /**
   * Compute variance and expense breakdown for a given period (default: current month)
   */
  getVarianceReport(period?: string): BudgetVarianceReport {
    const targetPeriod = period || new Date().toISOString().slice(0, 7); // e.g. '2026-10'
    const budgetConfig = this.getBudgetConfig();
    const expenses = this.getExpenses({ billingPeriod: targetPeriod });

    let actualTotalBdt = 0;
    let estimatedTotalBdt = 0;

    const catMap: Partial<Record<OperationalExpenseCategory, { actual: number; estimated: number; count: number }>> = {};
    const providerMap: Record<string, { totalBdt: number; count: number }> = {};

    for (const exp of expenses) {
      if (exp.costNature === 'ACTUAL_BILLED') {
        actualTotalBdt += exp.amountBdt;
      } else {
        estimatedTotalBdt += exp.amountBdt;
      }

      // Category map
      if (!catMap[exp.category]) {
        catMap[exp.category] = { actual: 0, estimated: 0, count: 0 };
      }
      if (exp.costNature === 'ACTUAL_BILLED') {
        catMap[exp.category]!.actual += exp.amountBdt;
      } else {
        catMap[exp.category]!.estimated += exp.amountBdt;
      }
      catMap[exp.category]!.count += 1;

      // Provider map
      const prov = exp.provider.trim() || 'Other';
      if (!providerMap[prov]) {
        providerMap[prov] = { totalBdt: 0, count: 0 };
      }
      providerMap[prov].totalBdt += exp.amountBdt;
      providerMap[prov].count += 1;
    }

    const projectedTotalBdt = actualTotalBdt + estimatedTotalBdt;
    const monthlyBudget = budgetConfig.monthlyBudgetBdt || 1;
    const varianceBdt = monthlyBudget - projectedTotalBdt;
    const burnRatePercent = Math.round((projectedTotalBdt / monthlyBudget) * 100);

    const isOverBudget = projectedTotalBdt > monthlyBudget;
    const isNearThreshold = burnRatePercent >= budgetConfig.alertThresholdPercent;

    // Build category breakdowns
    const allCategories: OperationalExpenseCategory[] = [
      'hosting',
      'server',
      'database',
      'storage',
      'bandwidth',
      'email',
      'sms',
      'ai_api',
      'ocr',
      'external_api',
      'domain_infra',
      'maintenance',
      'other'
    ];

    const categoryBreakdown: CategoryExpenseBreakdown[] = allCategories.map(cat => {
      const catBudget = (budgetConfig.categoryBudgetsBdt && budgetConfig.categoryBudgetsBdt[cat]) || 0;
      const stats = catMap[cat] || { actual: 0, estimated: 0, count: 0 };
      const totalBdt = stats.actual + stats.estimated;
      const variance = catBudget - totalBdt;
      const burn = catBudget > 0 ? Math.round((totalBdt / catBudget) * 100) : totalBdt > 0 ? 100 : 0;

      return {
        category: cat,
        categoryNameBn: CATEGORY_NAMES_BN[cat],
        budgetBdt: catBudget,
        actualBdt: stats.actual,
        estimatedBdt: stats.estimated,
        totalBdt,
        varianceBdt: variance,
        burnPercent: burn,
        itemCount: stats.count
      };
    });

    const activeAlerts: string[] = [];
    if (isOverBudget) {
      activeAlerts.push(`বাজেট অতিক্রম সতর্কতা: চলতি মাসের অপারেশনাল খরচ বাজেট থেকে ${Math.abs(varianceBdt)} টাকা বেশি হয়েছে (${burnRatePercent}%)।`);
    } else if (isNearThreshold) {
      activeAlerts.push(`বাজেট সতর্কতা: চলতি মাসের অপারেশনাল খরচ বাজেটের ${burnRatePercent}% স্পর্শ করেছে।`);
    }

    const providerBreakdown = Object.entries(providerMap).map(([provider, data]) => ({
      provider,
      totalBdt: data.totalBdt,
      count: data.count
    }));

    return {
      period: targetPeriod,
      monthlyBudgetBdt: monthlyBudget,
      actualTotalBdt,
      estimatedTotalBdt,
      projectedTotalBdt,
      varianceBdt,
      burnRatePercent,
      isOverBudget,
      isNearThreshold,
      categoryBreakdown,
      providerBreakdown,
      activeAlerts
    };
  },

  /**
   * Check budget alerts and dispatch notification if threshold reached
   */
  checkBudgetAlerts(period?: string): void {
    const report = this.getVarianceReport(period);
    if (!report.isNearThreshold && !report.isOverBudget) return;

    try {
      const notificationTitle = report.isOverBudget ? '⚠️ অপারেশনাল বাজেট অতিক্রম!' : '🔔 অপারেশনাল বাজেট সতর্কবার্তা';
      const notificationBody = report.isOverBudget
        ? `চলতি মাস (${report.period})-এর মোট অপারেশনাল খরচ BDT ${report.projectedTotalBdt} ছুঁয়েছে, যা বরাদ্দকৃত বাজেট BDT ${report.monthlyBudgetBdt} অতিক্রম করেছে।`
        : `চলতি মাস (${report.period})-এর মোট অপারেশনাল খরচ বাজেটের ${report.burnRatePercent}% স্পর্শ করেছে।`;

      serverDB.addAdminNotification(notificationTitle, notificationBody);
    } catch (e) {
      console.warn('Budget notification dispatch error:', e);
    }
  }
};
