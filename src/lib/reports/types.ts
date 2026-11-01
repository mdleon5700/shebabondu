/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 15: REPORT BUILDER & EXPORT TYPES
 * Standardized reporting categories, dynamic report generation, and multi-format exports.
 */

export type StandardReportCategory =
  | 'daily_platform_report'
  | 'weekly_platform_report'
  | 'monthly_platform_report'
  | 'job_market_intelligence'
  | 'spider_source_performance'
  | 'search_trends_zero_results'
  | 'user_growth_funnel'
  | 'data_quality_audit'
  | 'operational_expense_breakdown';

export type ReportExportFormat = 'json' | 'csv' | 'table';

export interface ReportDefinitionMetadata {
  id: StandardReportCategory;
  title: string;
  titleBn: string;
  descriptionBn: string;
  defaultTimeframe: string;
  supportedFormats: ReportExportFormat[];
}

export interface ReportGenerationFilterPayload {
  reportType: StandardReportCategory | 'custom';
  timeframe: string;
  format: ReportExportFormat;
  categoryFilter?: string;
  divisionFilter?: string;
  statusFilter?: string;
}

export interface GeneratedPlatformReport {
  reportId: string;
  reportType: string;
  title: string;
  titleBn: string;
  timeframe: string;
  generatedAt: string;
  generatedBy: string;
  rowCount: number;
  summaryHighlightsBn: string[];
  headers: string[];
  rows: (string | number)[][];
  csvPayload?: string;
}
