export * from './types';
export * from './browser-controller';
export * from './human-interaction';
export * from './auth-test-module';
export * from './page-discovery';
export * from './api-verifier';
export * from './db-checker';
export * from './evidence-manager';
export * from './error-detector';
export * from './test-reporter';
export * from './recovery-controller';
export * from './test-isolation';
export * from './test-run-manager';

import { TestRunConfig, TestRunRecord, ScenarioResult } from './types';
import { BrowserController } from './browser-controller';
import { TestRunManager } from './test-run-manager';
import { TestReportingModule } from './test-reporter';

import { runScenario01 } from './scenarios/01-public-availability';
import { runScenario02 } from './scenarios/02-public-job-browsing';
import { runScenario03 } from './scenarios/03-registration-page';
import { runScenario04 } from './scenarios/04-login-page';
import { runScenario05 } from './scenarios/05-user-panel-protection';
import { runScenario06 } from './scenarios/06-admin-panel-protection';
import { runScenario07 } from './scenarios/07-api-health';
import { runScenario08 } from './scenarios/08-browser-error-audit';
import { runScenario09 } from './scenarios/09-mobile-viewport';
import { runScenario10 } from './scenarios/10-test-data-isolation';
import { runScenario11 } from './scenarios/11-nationwide-synthetic-personas';
import { runScenario12 } from './scenarios/12-browser-registration-lifecycle';
import { runScenario13 } from './scenarios/13-cross-panel-sync';
import { runScenario14 } from './scenarios/14-education-crud-lifecycle';
import { runScenario15 } from './scenarios/15-academic-document-security';
import { runScenario16 } from './scenarios/16-admin-education-review-sync';
import { runScenario17 } from './scenarios/17-academic-hierarchy-validation';
import { runScenario18 } from './scenarios/18-document-vault-browser-lifecycle';
import { runScenario19 } from './scenarios/19-document-security-vault-guard';
import { runScenario20 } from './scenarios/20-admin-document-review-sync';
import { runScenario21 } from './scenarios/21-document-replacement-integrity';
import { runScenario22 } from './scenarios/22-admin-job-creation-draft-persistence';
import { runScenario23 } from './scenarios/23-job-editing-content-studio-sync';
import { runScenario24 } from './scenarios/24-job-validation-approval-workflow';
import { runScenario25 } from './scenarios/25-publishing-public-website-sync';
import { runScenario26 } from './scenarios/26-job-lifecycle-user-panel-sync';
import { runScenario27 } from './scenarios/27-job-categories-subcategories-hierarchy-audit';
import { runScenario28 } from './scenarios/28-bilingual-search-normalization-scoring-audit';
import { runScenario29 } from './scenarios/29-bangladesh-location-filter-audit';
import { runScenario30 } from './scenarios/30-advanced-filter-combinations-audit';
import { runScenario31 } from './scenarios/31-sorting-pagination-user-panel-discovery-audit';
import { runScenario32 } from './scenarios/32-latest-jobs-and-publication-timestamps-audit';
import { runScenario33 } from './scenarios/33-daily-job-updates-calendar-archive-audit';
import { runScenario34 } from './scenarios/34-deadline-monitoring-state-machine-audit';
import { runScenario35 } from './scenarios/35-deadline-scheduler-cron-automation-audit';
import { runScenario36 } from './scenarios/36-freshness-user-panel-sync-alerts-audit';
import { runScenario37 } from './scenarios/37-mandatory-eligibility-vs-recommendation-separation-audit';
import { runScenario38 } from './scenarios/38-complete-education-matrix-subject-match-audit';
import { runScenario39 } from './scenarios/39-age-boundaries-reference-date-quota-audit';
import { runScenario40 } from './scenarios/40-experience-skills-64-district-matching-audit';
import { runScenario41 } from './scenarios/41-new-job-publishing-matching-profile-refresh-simulation';
import { runScenario42 } from './scenarios/42-matching-transparency-explainability-notifications-audit';
import { runScenario43 } from './scenarios/43-notification-catalog-event-lifecycle-audit';
import { runScenario44 } from './scenarios/44-64-district-personalized-job-alerts-eligibility-audit';
import { runScenario45 } from './scenarios/45-notification-preferences-channel-control-audit';
import { runScenario46 } from './scenarios/46-duplicate-prevention-and-idempotency-audit';
import { runScenario47 } from './scenarios/47-deadline-alerts-and-automated-reminders-audit';
import { runScenario48 } from './scenarios/48-user-panel-notification-experience-security-isolation-audit';
import { runScenario49 } from './scenarios/49-public-job-details-application-entry-eligibility-audit';
import { runScenario50 } from './scenarios/50-application-form-validation-cv-document-attachment-audit';
import { runScenario51 } from './scenarios/51-application-submission-persistence-duplicate-prevention-audit';
import { runScenario52 } from './scenarios/52-user-panel-applications-dashboard-tracking-audit';
import { runScenario53 } from './scenarios/53-admin-application-review-status-transition-audit';
import { runScenario54 } from './scenarios/54-application-status-notification-synchronization-audit';
import { runScenario55 } from './scenarios/55-role-based-access-control-security-boundary-audit';
import { runScenario56 } from './scenarios/56-admin-dashboard-analytics-integrity-audit';
import { runScenario57 } from './scenarios/57-admin-user-job-content-management-lifecycle-audit';
import { runScenario58 } from './scenarios/58-user-panel-comprehensive-profile-settings-audit';
import { runScenario59 } from './scenarios/59-cross-panel-full-synchronization-audit';
import { runScenario60 } from './scenarios/60-responsive-viewports-accessibility-seo-permanently-free-audit';
import { runScenario61 } from './scenarios/61-nationwide-64-district-full-user-journey-simulation';
import { runScenario62 } from './scenarios/62-comprehensive-security-vulnerability-hardening-audit';
import { runScenario63 } from './scenarios/63-high-concurrency-performance-scalability-audit';
import { runScenario64 } from './scenarios/64-gemini-independence-operational-resilience-regression-audit';

export async function runAutonomousSpiderAudit(configOverrides: Partial<TestRunConfig> = {}): Promise<TestRunRecord> {
  const runRecord = TestRunManager.createRun(configOverrides);
  runRecord.status = 'RUNNING';
  TestRunManager.updateRun(runRecord);

  console.log(`\n================================================================`);
  console.log(`CHAKRI SHEBA AUTONOMOUS TESTING SPIDER — RUN [${runRecord.runId}]`);
  console.log(`Environment: ${runRecord.config.environment} | BaseUrl: ${runRecord.config.baseUrl}`);
  console.log(`================================================================\n`);

  const browserCtrl = new BrowserController(runRecord.config);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  const scenarios: ScenarioResult[] = [];

  const scenarioFns = [
    { id: 'SCENARIO-01', fn: runScenario01 },
    { id: 'SCENARIO-02', fn: runScenario02 },
    { id: 'SCENARIO-03', fn: runScenario03 },
    { id: 'SCENARIO-04', fn: runScenario04 },
    { id: 'SCENARIO-05', fn: runScenario05 },
    { id: 'SCENARIO-06', fn: runScenario06 },
    { id: 'SCENARIO-07', fn: runScenario07 },
    { id: 'SCENARIO-08', fn: runScenario08 },
    { id: 'SCENARIO-09', fn: runScenario09 },
    { id: 'SCENARIO-10', fn: runScenario10 },
    { id: 'SCENARIO-11', fn: runScenario11 },
    { id: 'SCENARIO-12', fn: runScenario12 },
    { id: 'SCENARIO-13', fn: runScenario13 },
    { id: 'SCENARIO-14', fn: runScenario14 },
    { id: 'SCENARIO-15', fn: runScenario15 },
    { id: 'SCENARIO-16', fn: runScenario16 },
    { id: 'SCENARIO-17', fn: runScenario17 },
    { id: 'SCENARIO-18', fn: runScenario18 },
    { id: 'SCENARIO-19', fn: runScenario19 },
    { id: 'SCENARIO-20', fn: runScenario20 },
    { id: 'SCENARIO-21', fn: runScenario21 },
    { id: 'SCENARIO-22', fn: runScenario22 },
    { id: 'SCENARIO-23', fn: runScenario23 },
    { id: 'SCENARIO-24', fn: runScenario24 },
    { id: 'SCENARIO-25', fn: runScenario25 },
    { id: 'SCENARIO-26', fn: runScenario26 },
    { id: 'SCENARIO-27', fn: runScenario27 },
    { id: 'SCENARIO-28', fn: runScenario28 },
    { id: 'SCENARIO-29', fn: runScenario29 },
    { id: 'SCENARIO-30', fn: runScenario30 },
    { id: 'SCENARIO-31', fn: runScenario31 },
    { id: 'SCENARIO-32', fn: runScenario32 },
    { id: 'SCENARIO-33', fn: runScenario33 },
    { id: 'SCENARIO-34', fn: runScenario34 },
    { id: 'SCENARIO-35', fn: runScenario35 },
    { id: 'SCENARIO-36', fn: runScenario36 },
    { id: 'SCENARIO-37', fn: runScenario37 },
    { id: 'SCENARIO-38', fn: runScenario38 },
    { id: 'SCENARIO-39', fn: runScenario39 },
    { id: 'SCENARIO-40', fn: runScenario40 },
    { id: 'SCENARIO-41', fn: runScenario41 },
    { id: 'SCENARIO-42', fn: runScenario42 },
    { id: 'SCENARIO-43', fn: runScenario43 },
    { id: 'SCENARIO-44', fn: runScenario44 },
    { id: 'SCENARIO-45', fn: runScenario45 },
    { id: 'SCENARIO-46', fn: runScenario46 },
    { id: 'SCENARIO-47', fn: runScenario47 },
    { id: 'SCENARIO-48', fn: runScenario48 },
    { id: 'SCENARIO-49', fn: runScenario49 },
    { id: 'SCENARIO-50', fn: runScenario50 },
    { id: 'SCENARIO-51', fn: runScenario51 },
    { id: 'SCENARIO-52', fn: runScenario52 },
    { id: 'SCENARIO-53', fn: runScenario53 },
    { id: 'SCENARIO-54', fn: runScenario54 },
    { id: 'SCENARIO-55', fn: runScenario55 },
    { id: 'SCENARIO-56', fn: runScenario56 },
    { id: 'SCENARIO-57', fn: runScenario57 },
    { id: 'SCENARIO-58', fn: runScenario58 },
    { id: 'SCENARIO-59', fn: runScenario59 },
    { id: 'SCENARIO-60', fn: runScenario60 },
    { id: 'SCENARIO-61', fn: runScenario61 },
    { id: 'SCENARIO-62', fn: runScenario62 },
    { id: 'SCENARIO-63', fn: runScenario63 },
    { id: 'SCENARIO-64', fn: runScenario64 },
  ];

  for (const item of scenarioFns) {
    console.log(`[SPIDER] Executing ${item.id}...`);
    try {
      const result = await item.fn(page, runRecord.config.baseUrl, browserCtrl);
      scenarios.push(result);
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`[SPIDER] ${icon} ${result.scenarioId}: ${result.status} (${result.durationMs || 0}ms)`);
    } catch (err: any) {
      console.error(`[SPIDER] Fatal error in ${item.id}:`, err.message);
      scenarios.push({
        scenarioId: item.id,
        name: 'Unhandled Execution Failure',
        category: 'public',
        status: 'FAIL',
        startTime: new Date().toISOString(),
        actionsPerformed: [],
        assertions: [],
        errors: [{
          type: 'interaction_failure',
          message: err.message,
          timestamp: new Date().toISOString()
        }]
      });
    }
  }

  await browserCtrl.cleanup();

  // Finalize run stats
  runRecord.scenarios = scenarios;
  runRecord.endTime = new Date().toISOString();
  runRecord.totalDurationMs = Date.now() - new Date(runRecord.startTime).getTime();

  const total = scenarios.length;
  const passed = scenarios.filter(s => s.status === 'PASS').length;
  const failed = scenarios.filter(s => s.status === 'FAIL').length;
  const blocked = scenarios.filter(s => s.status === 'BLOCKED').length;
  const notTested = scenarios.filter(s => s.status === 'NOT_TESTED').length;
  const passRate = total > 0 ? (passed / total) * 100 : 0;
  const totalErrors = scenarios.reduce((acc, s) => acc + s.errors.length, 0);

  runRecord.summary = {
    total,
    passed,
    failed,
    blocked,
    notTested,
    passRate,
    totalErrors
  };
  runRecord.status = failed === 0 ? 'COMPLETED' : 'FAILED';

  TestRunManager.updateRun(runRecord);
  TestReportingModule.saveReport(runRecord);

  console.log(`\n================================================================`);
  console.log(`AUDIT RUN COMPLETED: ${passed}/${total} PASSED (${passRate.toFixed(1)}%)`);
  console.log(`================================================================\n`);

  return runRecord;
}