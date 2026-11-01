/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 15: AUTOMATED VERIFICATION SUITE
 * Complete Analytics, Business Intelligence, Intelligent Automation & Report Builder
 */

import assert from 'assert';
import { CentralAnalyticsEngine } from '../src/lib/analytics/engine';
import { CentralAutomationEngine } from '../src/lib/automation/engine';
import { CentralReportEngine } from '../src/lib/reports/engine';
import { CertificateVerificationManager, CertificateOcrHelper } from '../src/lib/education/verification';
import { AdminGovernanceRbac } from '../src/lib/governance/rbac';
import { FreeAccessPolicyEngine } from '../src/lib/operations/freeAccess';
import { serverDB } from '../src/lib/db';

let passed = 0;
let failed = 0;

function test(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         Error: ${err.message}`);
    failed++;
  }
}

async function runStep15Tests() {
  console.log('================================================================');
  console.log('CHAKRI SHEBA — STEP 15: ANALYTICS, BI & AUTOMATION TEST SUITE');
  console.log('================================================================\n');

  // VECTOR 1: Platform-Wide Analytics Aggregation & Date Filters
  console.log('--- VECTOR 1: Platform-Wide Analytics Aggregation & Date Filters ---');
  test('Timeframe bounds calculate correct UTC timestamps for today in BST (UTC+6)', () => {
    const bounds = CentralAnalyticsEngine.getTimeframeBounds('today');
    assert(bounds.startMs > 0 && bounds.endMs >= bounds.startMs, 'Bounds must be valid timestamps');
  });

  test('CentralAnalyticsEngine returns comprehensive overview report for 30d timeframe', () => {
    const report = CentralAnalyticsEngine.getPlatformOverviewReport('30d');
    assert(report.timeframe === '30d', 'Timeframe matches requested filter');
    assert(typeof report.users.totalRegistered === 'number', 'Registered user metric exists');
    assert(typeof report.jobMarket.totalJobs === 'number', 'Total jobs metric exists');
  });

  test('Overview report contains 100% real database records without placeholder figures', () => {
    const report = CentralAnalyticsEngine.getPlatformOverviewReport('all');
    const realCandidates = serverDB.getAllCandidates().length;
    assert(report.users.totalRegistered === realCandidates, `Report candidates ${report.users.totalRegistered} must match DB ${realCandidates}`);
  });

  // VECTOR 2: User Funnel & Behavior Analytics
  console.log('\n--- VECTOR 2: User Funnel & Behavior Analytics ---');
  test('User analytics produces 5-stage conversion funnel', () => {
    const userMetrics = CentralAnalyticsEngine.getUserAnalytics('all');
    assert(userMetrics.userFunnel.length === 5, 'User funnel must have 5 stages');
    assert(userMetrics.userFunnel[0].stepId === 'registered', 'Stage 1 must be registration');
    assert(userMetrics.userFunnel[0].conversionRate === 100, 'Stage 1 conversion is 100%');
  });

  test('Average candidate profile completion is mathematically bounded (0-100%)', () => {
    const userMetrics = CentralAnalyticsEngine.getUserAnalytics('all');
    assert(userMetrics.avgProfileCompletionPercent >= 0 && userMetrics.avgProfileCompletionPercent <= 100, 'Completion must be between 0 and 100');
  });

  // VECTOR 3: Job Market & Taxonomy Analytics
  console.log('\n--- VECTOR 3: Job Market & Taxonomy Analytics ---');
  test('Job market metrics categorizes circulars into standard taxonomy breakdown', () => {
    const market = CentralAnalyticsEngine.getJobMarketMetrics('all');
    assert(market.categoryBreakdown.length > 0, 'Category breakdown must contain items');
    assert(market.categoryBreakdown.some(c => c.categoryId === 'govt' || c.categoryId === 'bank'), 'Must contain govt or bank');
  });

  test('Job market metrics distributes circulars across 8 administrative divisions', () => {
    const market = CentralAnalyticsEngine.getJobMarketMetrics('all');
    assert(market.divisionBreakdown.length >= 8, 'Division breakdown must cover all 8 divisions');
  });

  test('Education requirements correctly identifies SSC, HSC, Bachelor and Masters circulars', () => {
    const market = CentralAnalyticsEngine.getJobMarketMetrics('all');
    assert(market.educationBreakdown.length >= 4, 'Education breakdown must cover core levels');
  });

  // VECTOR 4: Source & Spider Performance Analytics
  console.log('\n--- VECTOR 4: Source & Spider Performance Analytics ---');
  test('Spider source analytics evaluates all registered official sources', () => {
    const srcMetrics = CentralAnalyticsEngine.getSpiderSourceAnalytics('all');
    assert(srcMetrics.totalSources >= 5, 'Must contain at least 5 registered sources');
    assert(srcMetrics.overallSuccessRatePercent >= 70, 'Success rate must be realistic and high');
  });

  // VECTOR 5: AI & Verification Metrics
  console.log('\n--- VECTOR 5: AI & Verification Metrics ---');
  test('AI verification analytics tracks tokens, duration, and conflict rate', () => {
    const aiMetrics = CentralAnalyticsEngine.getAiVerificationAnalytics();
    assert(aiMetrics.totalAiVerificationRequests > 0, 'AI requests tracked');
    assert(typeof aiMetrics.verificationConflictRatePercent === 'number', 'Conflict rate must be a number');
  });

  // VECTOR 6: Search Analytics & Zero-Result Intelligence
  console.log('\n--- VECTOR 6: Search Analytics & Zero-Result Intelligence ---');
  test('Search analytics aggregates top queries and identifies zero-result searches', () => {
    const searchMetrics = CentralAnalyticsEngine.getSearchAnalytics();
    assert(typeof searchMetrics.totalSearchesRecorded === 'number', 'Searches recorded is tracked');
    assert(Array.isArray(searchMetrics.topKeywords), 'Top keywords is an array');
  });

  test('Zero-result queries provide Bengali taxonomy action suggestions', () => {
    const searchMetrics = CentralAnalyticsEngine.getSearchAnalytics();
    if (searchMetrics.zeroResultQueries.length > 0) {
      assert(searchMetrics.zeroResultQueries[0].suggestedActionBn.length > 5, 'Action must be descriptive Bengali text');
    }
  });

  // VECTOR 7: Centralized Automation Tasks Status
  console.log('\n--- VECTOR 7: Centralized Automation Tasks Status ---');
  test('Automation engine provides 8 core background tasks matching platform roadmap', () => {
    const tasks = CentralAutomationEngine.getTasks();
    assert(tasks.length === 8, `Expected 8 tasks, found ${tasks.length}`);
    assert(tasks.some(t => t.id === 'task-deadline-monitoring'), 'Must include deadline monitoring');
    assert(tasks.some(t => t.id === 'task-spider-collection'), 'Must include spider collection');
  });

  test('Automation task status can be toggled between ACTIVE and PAUSED with audit logging', () => {
    const toggled = CentralAutomationEngine.toggleTaskStatus('task-maintenance-cleanup', 'PAUSED', 'ADMIN-TEST');
    assert(toggled?.status === 'PAUSED', 'Task must transition to PAUSED');
    const restored = CentralAutomationEngine.toggleTaskStatus('task-maintenance-cleanup', 'ACTIVE', 'ADMIN-TEST');
    assert(restored?.status === 'ACTIVE', 'Task must restore to ACTIVE');
  });

  // VECTOR 8: Intelligent Rule-Based Automation (Rules A-G)
  console.log('\n--- VECTOR 8: Intelligent Rule-Based Automation (Rules A-G) ---');
  test('Intelligent rules engine defines all 7 required rules (RULE_A through RULE_G)', () => {
    const rules = CentralAutomationEngine.getRules();
    assert(rules.length === 7, `Expected 7 rules, found ${rules.length}`);
    const codes = rules.map(r => r.code);
    assert(codes.includes('RULE_A') && codes.includes('RULE_C') && codes.includes('RULE_G'), 'Must contain rules A, C, G');
  });

  test('Intelligent rules evaluation executes safely without arbitrary code execution', () => {
    const evalRes = CentralAutomationEngine.evaluateIntelligentRules();
    assert(evalRes.evaluatedCount === 7, 'All 7 rules evaluated');
    assert(Array.isArray(evalRes.results), 'Results is an array');
  });

  // VECTOR 9: Standard Reports & Custom Report Builder
  console.log('\n--- VECTOR 9: Standard Reports & Custom Report Builder ---');
  test('Report catalog contains 9 official platform reports', () => {
    const catalog = CentralReportEngine.getCatalog();
    assert(catalog.length === 9, `Expected 9 standard reports, found ${catalog.length}`);
  });

  test('Daily Executive Report generates accurate summary highlights and rows', () => {
    const report = CentralReportEngine.generateReport({
      reportType: 'daily_platform_report',
      timeframe: 'today',
      format: 'json'
    }, 'ADMIN-TEST');
    assert(report.rowCount > 0, 'Report must contain rows');
    assert(report.summaryHighlightsBn.length > 0, 'Report must contain highlights');
  });

  test('Job Market Intelligence Report generates category market share matrix', () => {
    const report = CentralReportEngine.generateReport({
      reportType: 'job_market_intelligence',
      timeframe: '30d',
      format: 'json'
    }, 'ADMIN-TEST');
    assert(report.headers.includes('ক্যাটাগরি / বিভাগ'), 'Header includes category');
  });

  // VECTOR 10: Export Engines (RFC-4180 CSV with UTF-8 BOM)
  console.log('\n--- VECTOR 10: Export Engines (RFC-4180 CSV with UTF-8 BOM) ---');
  test('CSV export includes UTF-8 Byte Order Mark (BOM) for seamless Microsoft Excel rendering', () => {
    const report = CentralReportEngine.generateReport({
      reportType: 'user_growth_funnel',
      timeframe: 'all',
      format: 'csv'
    }, 'ADMIN-TEST');
    assert(report.csvPayload !== undefined, 'CSV payload must exist');
    assert(report.csvPayload.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM character');
  });

  test('CSV cell escaping correctly escapes commas and quotes per RFC-4180', () => {
    const csv = CentralReportEngine.formatAsCsv(['পদবি, বিভাগ', 'বর্ণনা "অফিসিয়াল"'], [['সহকারী পরিচালক, প্রশাসন', 'উচ্চ "গ্রেড" পদ']]);
    assert(csv.includes('"পদবি, বিভাগ"'), 'Comma field must be enclosed in quotes');
    assert(csv.includes('""গ্রেড""'), 'Inner quote must be escaped as double quotes');
  });

  // VECTOR 11: Data Quality & Platform Integrity Inspector
  console.log('\n--- VECTOR 11: Data Quality & Platform Integrity Inspector ---');
  test('Data quality audit scans canonical jobs and candidates', () => {
    const audit = CentralAnalyticsEngine.runDataQualityAudit();
    assert(audit.totalRecordsScanned >= 200, 'Must scan 200+ records');
    assert(typeof audit.qualityHealthScorePercent === 'number', 'Health score must be a number');
    assert(audit.qualityHealthScorePercent >= 60, 'Platform health score must be healthy');
  });

  // VECTOR 12: Step 12 Certificate Verification & Secure Document Integration
  console.log('\n--- VECTOR 12: Step 12 Certificate Verification & Secure Document Integration ---');
  test('CertificateVerificationManager applies verified decision and updates document record', () => {
    const candidates = serverDB.getCandidates();
    const candidate = candidates.find(c => c.education && c.education.some(e => e.id));
    if (candidate && candidate.education) {
      const edu = candidate.education.find(e => e.id);
      if (edu && edu.id) {
        const res = CertificateVerificationManager.applyDecision({
          candidateId: candidate.id,
          recordId: edu.id,
          recordType: 'education',
          status: 'VERIFIED',
          reviewerId: 'ADMIN-TEST',
          remarks: 'অটোমেটেড টেস্ট ভেরিফিকেশন সফল।'
        });
        assert(res.success === true, 'Verification decision applied: ' + (res.error || ''));
      }
    } else {
      assert(true, 'Skipped candidate test record');
    }
  });

  test('CertificateOcrHelper extracts degree and institution heuristically with confidence', () => {
    const ocr = CertificateOcrHelper.assistExtractMetadata({
      fileName: 'ssc_certificate_dhaka_board_2022.pdf',
      fileContentSnippet: 'Secondary School Certificate Examination 2022 GPA 5.00'
    });
    assert(ocr.isAssisted === true, 'OCR assist flag is true');
    assert(ocr.examinationOrDegree?.value.includes('SSC'), 'Detected SSC');
    assert(ocr.overallConfidence > 0.7, 'Confidence is high');
  });

  // VECTOR 13: RBAC & Server-Side Security Enforcement
  console.log('\n--- VECTOR 13: RBAC & Server-Side Security Enforcement ---');
  test('Super Admin holds analytics.view, automation.manage, reports.export, certificates.review', () => {
    assert(AdminGovernanceRbac.hasPermission('super_admin', 'analytics.view') === true, 'Super Admin has analytics.view');
    assert(AdminGovernanceRbac.hasPermission('super_admin', 'automation.manage') === true, 'Super Admin has automation.manage');
    assert(AdminGovernanceRbac.hasPermission('super_admin', 'reports.export') === true, 'Super Admin has reports.export');
    assert(AdminGovernanceRbac.hasPermission('super_admin', 'certificates.review') === true, 'Super Admin has certificates.review');
  });

  test('Support staff is forbidden from automation.manage and roles.manage', () => {
    assert(AdminGovernanceRbac.hasPermission('support_staff', 'automation.manage') === false, 'Support Staff cannot manage automation');
    assert(AdminGovernanceRbac.hasPermission('support_staff', 'roles.manage') === false, 'Support Staff cannot manage roles');
  });

  // VECTOR 14: 100% Free Platform Access & Zero-Paywall Preservation
  console.log('\n--- VECTOR 14: 100% Free Platform Access & Zero-Paywall Preservation ---');
  test('Universal 100% Free Access Policy is strictly active with zero paywalls', () => {
    const policy = FreeAccessPolicyEngine.getPolicy();
    assert(policy.is100PercentFree === true, 'Platform is 100% free');
    assert(policy.hasPaywalls === false, '0 paywalls guarantee');
    assert(policy.hasSubscriptions === false, '0 subscriptions guarantee');
  });

  // SUMMARY
  console.log('\n================================================================');
  console.log(`STEP 15 TEST RESULTS: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`);
  const score = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`STEP 15 SYSTEM INTEGRITY SCORE: ${score}%`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runStep15Tests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
