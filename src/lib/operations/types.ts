/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 13: FREE ACCESS & OPERATIONAL COST MANAGEMENT TYPES
 * Strict 100% Free Platform Access, Infrastructure Expense Tracking, Budgeting & Usage Analytics
 */

export type OperationalExpenseCategory =
  | 'hosting'
  | 'server'
  | 'database'
  | 'storage'
  | 'bandwidth'
  | 'email'
  | 'sms'
  | 'ai_api'
  | 'ocr'
  | 'external_api'
  | 'domain_infra'
  | 'maintenance'
  | 'other';

export type CostNature = 'ACTUAL_BILLED' | 'ESTIMATED_USAGE';

export type ExpensePaymentStatus = 'paid' | 'pending' | 'scheduled' | 'cancelled';

export interface OperationalExpenseRecord {
  id: string;
  title: string;
  category: OperationalExpenseCategory;
  provider: string; // e.g. "Google Cloud", "Vercel", "SendGrid", "Greenweb SMS"
  billingPeriod: string; // e.g. "2026-10", "2026-Q3", "2026-10-01 to 2026-10-31"
  amount: number;
  currency: 'BDT' | 'USD';
  amountBdt: number; // Normalized to BDT for consistent aggregation (e.g. 1 USD = 122 BDT)
  costNature: CostNature;
  paymentStatus: ExpensePaymentStatus;
  expenseDate: string; // YYYY-MM-DD
  invoiceNumber?: string;
  supportingDocUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PlatformBudgetConfig {
  monthlyBudgetBdt: number;
  annualBudgetBdt: number;
  categoryBudgetsBdt: Partial<Record<OperationalExpenseCategory, number>>;
  alertThresholdPercent: number; // e.g. 80
  criticalThresholdPercent: number; // e.g. 100
  updatedAt: string;
  updatedBy: string;
}

export interface CategoryExpenseBreakdown {
  category: OperationalExpenseCategory;
  categoryNameBn: string;
  budgetBdt: number;
  actualBdt: number;
  estimatedBdt: number;
  totalBdt: number;
  varianceBdt: number; // budget - total
  burnPercent: number;
  itemCount: number;
}

export interface BudgetVarianceReport {
  period: string;
  monthlyBudgetBdt: number;
  actualTotalBdt: number;
  estimatedTotalBdt: number;
  projectedTotalBdt: number;
  varianceBdt: number; // positive = under budget, negative = over budget
  burnRatePercent: number;
  isOverBudget: boolean;
  isNearThreshold: boolean;
  categoryBreakdown: CategoryExpenseBreakdown[];
  providerBreakdown: { provider: string; totalBdt: number; count: number }[];
  activeAlerts: string[];
}

export interface PlatformUsageSnapshot {
  totalCandidates: number;
  activeCandidates: number;
  newCandidatesThisMonth: number;
  totalPublishedJobs: number;
  publishedJobsThisMonth: number;
  totalApplicationsAssisted: number;
  totalSearchQueriesRun: number;
  totalMatchingScansRun: number;
  totalNotificationsDelivered: number;
  
  // Infrastructure unit meters
  aiTokensUsed: number;
  aiEstimatedCostBdt: number;
  smsMessagesSent: number;
  smsEstimatedCostBdt: number;
  emailsSent: number;
  emailEstimatedCostBdt: number;
  storageBytesUsed: number;
  storageFormatted: string;
  storageEstimatedCostBdt: number;
  
  totalEstimatedMonthlyCostBdt: number;
  lastCalculatedAt: string;
}

export interface UniversalAccessPolicy {
  is100PercentFree: true;
  hasPaidTiers: false;
  hasPaywalls: false;
  hasSubscriptions: false;
  activeRestrictions: string[];
  approvedFreeFeatures: {
    id: string;
    nameBn: string;
    descriptionBn: string;
    status: 'ACTIVE_UNIVERSAL_FREE';
  }[];
  policyStatementBn: string;
  verifiedAt: string;
}

export const USD_TO_BDT_RATE = 122.0;

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
