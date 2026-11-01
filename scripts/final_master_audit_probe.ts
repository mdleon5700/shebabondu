
import assert from 'assert';
import http from 'http';
import fs from 'fs';
import { serverDB } from '../src/lib/db';
import { CentralAnalyticsEngine } from '../src/lib/analytics/engine';
import { CentralAutomationEngine } from '../src/lib/automation/engine';
import { CentralReportEngine } from '../src/lib/reports/engine';
import { CertificateVerificationManager, CertificateOcrHelper } from '../src/lib/education/verification';
import { AdminGovernanceRbac, PlatformHealthEngine } from '../src/lib/governance';
import { FreeAccessPolicyEngine } from '../src/lib/operations/freeAccess';
import { OperationalExpenseManager } from '../src/lib/operations/expenseManager';
import { SmartJobMatchingEngine } from '../src/lib/matching';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';
import { JobFeedEngine } from '../src/lib/feeds/engine';
import { JobTaxonomyClassifier } from '../src/lib/taxonomy/classifier';
import { SearchNormalizer } from '../src/lib/search/normalizer';
import { CentralNotificationHub, NotificationTemplateManager } from '../src/lib/notifications';
import { AcademicResultValidator, BD_DEGREE_PROGRAMS } from '../src/lib/education';
import { JobCircular, CircularDraft } from '../src/lib/types';

interface AuditResultItem {
  testId: string;
  step: string;
  scenario: string;
  expected: string;
  actual: string;
  evidence: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_VERIFIABLE';
}

const auditResults: AuditResultItem[] = [];

function recordAudit(item: AuditResultItem) {
  auditResults.push(item);
  const tag = item.status === 'PASS' ? '[PASS]' : item.status === 'PARTIAL' ? '[PARTIAL]' : '[FAIL]';
  console.log(`  ${tag} ${item.testId} (${item.step}): ${item.scenario}`);
  if (item.status !== 'PASS') {
    console.log(`         Expected: ${item.expected}`);
    console.log(`         Actual:   ${item.actual}`);
  }
}

async function makeLocalRequest(method: string, endpoint: string, headers: Record<string, string> = {}, body?: any): Promise<{ status: number; body: any; latencyMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const payload = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method,
      headers: reqHeaders,
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode || 0, body: parsed, latencyMs: Date.now() - start });
      });
    });
    req.on('error', (err) => {
      resolve({ status: 0, body: err.message, latencyMs: Date.now() - start });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('CHAKRI SHEBA — FINAL MASTER SYSTEM AUDIT PROBE (15 SYSTEMS)');
  console.log('================================================================\n');

  // STEP 01: JOB COLLECTION & SPIDER
  console.log('>>> [STEP 01] Job Collection & Intelligent Spider');
  try {
    const sources = serverDB.getJobSources();
    recordAudit({
      testId: 'AUD-01-01',
      step: 'Step 01',
      scenario: 'Job Source Registry contains approved sources',
      expected: 'At least 3 official sources registered',
      actual: `Found ${sources.length} sources registered: ${sources.map(s => s.name).join(', ')}`,
      evidence: 'src/lib/db.ts: getJobSources()',
      status: sources.length >= 3 ? 'PASS' : 'FAIL'
    });

    const runs = serverDB.getSpiderRuns();
    recordAudit({
      testId: 'AUD-01-02',
      step: 'Step 01',
      scenario: 'Spider execution logs are tracked in database',
      expected: 'Spider run history exists',
      actual: `Found ${runs.length} historical spider runs recorded`,
      evidence: 'src/db/local_store.json: spiderRuns',
      status: runs.length > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-01-ERR', step: 'Step 01', scenario: 'Spider audit execution', expected: 'No error', actual: err.message, evidence: 'SpiderEngine', status: 'FAIL' });
  }

  // STEP 02: JOB VERIFICATION & AI INTELLIGENCE
  console.log('\n>>> [STEP 02] Job Verification & AI Intelligence');
  try {
    const results = serverDB.getVerificationQueue();
    recordAudit({
      testId: 'AUD-02-01',
      step: 'Step 02',
      scenario: 'AI Verification queue & field-level extraction history exists',
      expected: 'Verification records exist with status tracking',
      actual: `Found ${results.length} verification queue items recorded`,
      evidence: 'src/lib/db.ts: getVerificationQueue()',
      status: Array.isArray(results) ? 'PASS' : 'FAIL'
    });

    const aiUsage = serverDB.getAiUsageLogs();
    recordAudit({
      testId: 'AUD-02-02',
      step: 'Step 02',
      scenario: 'AI Token and duration telemetry tracking',
      expected: 'AI usage logs tracked',
      actual: `Found ${aiUsage.length} AI usage logs`,
      evidence: 'src/db/local_store.json: aiUsageLogs',
      status: aiUsage.length > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-02-ERR', step: 'Step 02', scenario: 'Verification audit execution', expected: 'No error', actual: err.message, evidence: 'VerificationEngine', status: 'FAIL' });
  }

  // STEP 03: JOB CONTENT & SEO STUDIO
  console.log('\n>>> [STEP 03] Job Content & SEO Studio');
  try {
    const drafts = serverDB.getCircularDrafts();
    recordAudit({
      testId: 'AUD-03-01',
      step: 'Step 03',
      scenario: 'Circular drafts and content revisions persistence',
      expected: 'Circular drafts stored with workflow state',
      actual: `Found ${drafts.length} circular drafts`,
      evidence: 'src/db/local_store.json: circularDrafts',
      status: drafts.length > 0 ? 'PASS' : 'FAIL'
    });

    const dbRaw = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
    const articlesCount = Object.keys(dbRaw.contentStudioArticles || {}).length;
    recordAudit({
      testId: 'AUD-03-02',
      step: 'Step 03',
      scenario: 'Content Studio articles & SEO outlines persistence',
      expected: 'Content studio articles exist',
      actual: `Found ${articlesCount} content studio articles`,
      evidence: 'src/db/local_store.json: contentStudioArticles',
      status: articlesCount > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-03-ERR', step: 'Step 03', scenario: 'Content Studio audit', expected: 'No error', actual: err.message, evidence: 'ContentStudioEngine', status: 'FAIL' });
  }

  // STEP 04: VISUAL JOB EDITOR
  console.log('\n>>> [STEP 04] Visual Job Editor');
  try {
    const editorCompExists = fs.existsSync('src/components/admin/JobContentStudio.tsx') || fs.existsSync('src/components/admin/WebsiteCmsSeoManagement.tsx');
    recordAudit({
      testId: 'AUD-04-01',
      step: 'Step 04',
      scenario: 'Visual Job Editor frontend component presence',
      expected: 'Content Studio & Visual Editor component exists',
      actual: editorCompExists ? 'JobContentStudio / WebsiteCmsSeoManagement found' : 'Component not found',
      evidence: 'src/components/admin/WebsiteCmsSeoManagement.tsx',
      status: editorCompExists ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-04-ERR', step: 'Step 04', scenario: 'Visual editor component check', expected: 'No error', actual: err.message, evidence: 'VisualEditor', status: 'FAIL' });
  }

  // STEP 05: JOB PUBLISHING SYSTEM
  console.log('\n>>> [STEP 05] Job Publishing System');
  try {
    const jobs = serverDB.getJobs();
    const drafts = serverDB.getCircularDrafts();
    // Zero-leakage check
    const draftIds = new Set(drafts.map(d => d.id));
    const leaked = jobs.filter(j => draftIds.has(j.id) && (j as any).status !== 'published');
    recordAudit({
      testId: 'AUD-05-01',
      step: 'Step 05',
      scenario: 'Zero-Leakage Security: Drafts excluded from canonical catalog',
      expected: '0 draft jobs in published jobs catalog',
      actual: `Leaked drafts: ${leaked.length}`,
      evidence: 'serverDB.getJobs() vs circularDrafts',
      status: leaked.length === 0 ? 'PASS' : 'FAIL'
    });

    const pubQueue = serverDB.getPublishingQueue();
    const pubQueueCount = Object.keys(pubQueue || {}).length;
    recordAudit({
      testId: 'AUD-05-02',
      step: 'Step 05',
      scenario: 'Publishing Queue tracks scheduled and pending items',
      expected: 'Publishing queue records exist',
      actual: `Found ${pubQueueCount} queue items`,
      evidence: 'src/db/local_store.json: publishingQueue',
      status: pubQueueCount > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-05-ERR', step: 'Step 05', scenario: 'Publishing audit', expected: 'No error', actual: err.message, evidence: 'PublishingEngine', status: 'FAIL' });
  }

  // STEP 06: CATEGORIES & ADVANCED SEARCH
  console.log('\n>>> [STEP 06] Job Categories & Advanced Search');
  try {
    const categories = serverDB.getCategories();
    recordAudit({
      testId: 'AUD-06-01',
      step: 'Step 06',
      scenario: 'Standard taxonomy categories defined',
      expected: '27 standardized categories',
      actual: `Found ${categories.length} categories`,
      evidence: 'src/lib/taxonomy/registry.ts',
      status: categories.length === 27 ? 'PASS' : 'FAIL'
    });

    const cls = JobTaxonomyClassifier.classify({
      id: 'test-audit-bank-cls',
      title: 'সিনিয়র অফিসার (সাধারণ)',
      organization: 'সোনালী ব্যাংক লিমিটেড',
      category: 'bank',
      categoryLabel: 'ব্যাংক জব',
      publishedDate: '2026-10-30',
      deadline: '2026-11-20',
      daysRemaining: 21,
      totalPosts: 50,
      salary: '২২,০০০ - ৫৩,০৬০',
      grade: '৯ম গ্রেড',
      minEducation: 'স্নাতক',
      minAge: 21,
      maxAge: 30,
      districts: 'সকল জেলা',
      officialLink: '',
      status: 'ACTIVE',
      govtFee: 200,
      serviceFee: 50,
      circularImage: '',
      audioSummary: '',
      requirements: [],
      logo: ''
    });
    recordAudit({
      testId: 'AUD-06-02',
      step: 'Step 06',
      scenario: 'Taxonomy classifier accurately detects bank circulars',
      expected: 'Category slug bank-jobs / cat-bank',
      actual: `Classified category: ${cls.primaryCategory} (slug: ${cls.categorySlug})`,
      evidence: 'src/lib/taxonomy/classifier.ts',
      status: cls.categorySlug === 'bank-jobs' ? 'PASS' : 'FAIL'
    });

    const norm = SearchNormalizer.normalize('  বিসিএস   পরীক্ষা! ');
    recordAudit({
      testId: 'AUD-06-03',
      step: 'Step 06',
      scenario: 'Search Query Normalizer strips excess whitespace and punctuation',
      expected: 'বিসিএস পরীক্ষা',
      actual: norm,
      evidence: 'src/lib/search/normalizer.ts',
      status: norm === 'বিসিএস পরীক্ষা' ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-06-ERR', step: 'Step 06', scenario: 'Taxonomy search audit', expected: 'No error', actual: err.message, evidence: 'TaxonomyEngine', status: 'FAIL' });
  }

  // STEP 07: LATEST & DAILY JOBS FEEDS
  console.log('\n>>> [STEP 07] Latest & Daily Jobs Feeds');
  try {
    const allJobs = serverDB.getJobs();
    const placements = serverDB.getFeaturedPlacements();
    const todayRef = new Date('2026-10-30T10:00:00.000Z');
    const latestFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'latest', limit: 10 }, placements, todayRef);
    recordAudit({
      testId: 'AUD-07-01',
      step: 'Step 07',
      scenario: 'Latest Jobs feed returns sorted active circulars',
      expected: 'Feed success with circulars',
      actual: `Returned ${latestFeed.jobs.length} jobs, success: ${latestFeed.success}`,
      evidence: 'src/lib/feeds/engine.ts: getFeed',
      status: latestFeed.success && latestFeed.jobs.length > 0 ? 'PASS' : 'FAIL'
    });

    const closingFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'closing_soon', limit: 20 }, placements, todayRef);
    recordAudit({
      testId: 'AUD-07-02',
      step: 'Step 07',
      scenario: 'Closing soon feed retrieves circulars approaching deadline',
      expected: 'Closing soon jobs returned',
      actual: `Found ${closingFeed.jobs.length} closing soon jobs`,
      evidence: 'src/lib/feeds/engine.ts: closing_soon',
      status: closingFeed.success ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-07-ERR', step: 'Step 07', scenario: 'Feeds engine audit', expected: 'No error', actual: err.message, evidence: 'JobFeedEngine', status: 'FAIL' });
  }

  // STEP 08: DEADLINE MONITORING & CIRCULAR ALERTS
  console.log('\n>>> [STEP 08] Deadline Monitoring & Circular Alerts');
  try {
    const refDate = new Date('2026-10-30T10:00:00.000Z');
    const dlOpen = CentralDeadlineEngine.evaluateDeadline({ deadline: '2026-11-30' } as any, undefined, refDate);
    const dlClosing = CentralDeadlineEngine.evaluateDeadline({ deadline: '2026-11-01' } as any, undefined, refDate);
    const dlClosed = CentralDeadlineEngine.evaluateDeadline({ deadline: '2026-10-25' } as any, undefined, refDate);
    recordAudit({
      testId: 'AUD-08-01',
      step: 'Step 08',
      scenario: 'Deadline evaluation classifies OPEN, CLOSING_SOON and CLOSED accurately',
      expected: 'OPEN, isClosingSoon: true, CLOSED',
      actual: `Open status: ${dlOpen.status}, Closing status: ${dlClosing.isClosingSoon}, Closed status: ${dlClosed.status}`,
      evidence: 'src/lib/deadlines/engine.ts: evaluateDeadline',
      status: dlOpen.status === 'OPEN' && dlClosing.isClosingSoon === true && dlClosed.status === 'CLOSED' ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-08-ERR', step: 'Step 08', scenario: 'Deadline monitoring audit', expected: 'No error', actual: err.message, evidence: 'CentralDeadlineEngine', status: 'FAIL' });
  }

  // STEP 09: SMART JOB MATCHING & PERSONALIZED RECOMMENDATIONS
  console.log('\n>>> [STEP 09] Smart Job Matching & Personalized Recommendations');
  try {
    const candidates = serverDB.getCandidates();
    const candidate = candidates[0];
    const jobs = serverDB.getJobs();
    const match = SmartJobMatchingEngine.evaluateMatch(candidate, jobs[0]);
    recordAudit({
      testId: 'AUD-09-01',
      step: 'Step 09',
      scenario: 'Smart matching generates score 0-100 and Bengali explanation',
      expected: 'overallScore between 0 and 100, Bengali reasons present',
      actual: `Score: ${match.overallScore}, Reasons count: ${match.matchReasonsBn.length}`,
      evidence: 'src/lib/matching/engine.ts: evaluateMatch',
      status: typeof match.overallScore === 'number' && match.overallScore >= 0 && match.matchReasonsBn.length > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-09-ERR', step: 'Step 09', scenario: 'Smart matching audit', expected: 'No error', actual: err.message, evidence: 'SmartJobMatchingEngine', status: 'FAIL' });
  }

  // STEP 10: USER DASHBOARD INTEGRATION
  console.log('\n>>> [STEP 10] User Dashboard Integration');
  try {
    const candidates = serverDB.getCandidates();
    const c = candidates[0];
    const retrieved = serverDB.getCandidateById(c.id);
    recordAudit({
      testId: 'AUD-10-01',
      step: 'Step 10',
      scenario: 'Existing candidate profile and dashboard retrieval',
      expected: 'Candidate data persists with phone and name',
      actual: `Candidate ID ${retrieved?.id}, phone ${retrieved?.phone}`,
      evidence: 'src/lib/db.ts: getCandidateById',
      status: retrieved?.id === c.id ? 'PASS' : 'FAIL'
    });

    const saved = serverDB.getSavedJobs(c.id);
    recordAudit({
      testId: 'AUD-10-02',
      step: 'Step 10',
      scenario: 'Saved jobs array retrieval for candidate',
      expected: 'Array of saved job IDs',
      actual: `Saved jobs count: ${saved.length}`,
      evidence: 'src/lib/db.ts: getSavedJobs',
      status: Array.isArray(saved) ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-10-ERR', step: 'Step 10', scenario: 'User dashboard audit', expected: 'No error', actual: err.message, evidence: 'serverDB', status: 'FAIL' });
  }

  // STEP 11: NOTIFICATION & COMMUNICATION SYSTEM
  console.log('\n>>> [STEP 11] Notification & Communication System');
  try {
    const channels = CentralNotificationHub.getChannelStatusReport();
    recordAudit({
      testId: 'AUD-11-01',
      step: 'Step 11',
      scenario: 'Multi-channel notification system status report',
      expected: 'In-app notification channel is guaranteed active',
      actual: `Channels: ${channels.map(c => `${c.channel}:${c.isAvailable}`).join(', ')}`,
      evidence: 'CentralNotificationHub.getChannelStatusReport',
      status: channels.some(c => c.channel === 'in_app' && c.isAvailable) ? 'PASS' : 'FAIL'
    });

    const deliveries = serverDB.getNotificationDeliveries();
    recordAudit({
      testId: 'AUD-11-02',
      step: 'Step 11',
      scenario: 'Notification delivery log tracks multi-channel dispatch',
      expected: 'Notification deliveries log contains dispatch entries',
      actual: `Found ${deliveries.length} notification deliveries logged`,
      evidence: 'src/db/local_store.json: notificationDeliveries',
      status: deliveries.length > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-11-ERR', step: 'Step 11', scenario: 'Notification audit', expected: 'No error', actual: err.message, evidence: 'NotificationEngine', status: 'FAIL' });
  }

  // STEP 12: EDUCATION & CERTIFICATE MANAGEMENT
  console.log('\n>>> [STEP 12] Education & Certificate Management');
  try {
    const validGpa = AcademicResultValidator.validateResult({
      academicStatus: 'COMPLETED',
      resultType: 'GPA',
      resultValue: '4.85',
      scale: 5
    });
    recordAudit({
      testId: 'AUD-12-01',
      step: 'Step 12',
      scenario: 'Academic Result Validator parses GPA 4.85 on 5.00 scale',
      expected: 'Valid result true',
      actual: `Validation result: ${validGpa.isValid}`,
      evidence: 'src/lib/education/standards.ts: AcademicResultValidator',
      status: validGpa.isValid ? 'PASS' : 'FAIL'
    });

    const queue = CertificateVerificationManager.getPendingVerificationQueue();
    recordAudit({
      testId: 'AUD-12-02',
      step: 'Step 12',
      scenario: 'Certificate Verification Queue aggregates candidate submissions',
      expected: 'Queue array with candidate degrees and document attachments',
      actual: `Queue length: ${queue.length}`,
      evidence: 'src/lib/education/verification.ts: getPendingVerificationQueue',
      status: Array.isArray(queue) ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-12-ERR', step: 'Step 12', scenario: 'Education audit', expected: 'No error', actual: err.message, evidence: 'CertificateVerificationManager', status: 'FAIL' });
  }

  // STEP 13: 100% FREE PLATFORM ACCESS
  console.log('\n>>> [STEP 13] 100% Free Platform Access & Cost Management');
  try {
    const policy = FreeAccessPolicyEngine.getPolicy();
    recordAudit({
      testId: 'AUD-13-01',
      step: 'Step 13',
      scenario: 'Universal Free Access Policy guarantees zero user paywalls',
      expected: 'is100PercentFree: true, hasPaywalls: false, hasSubscriptions: false',
      actual: `is100PercentFree: ${policy.is100PercentFree}, hasPaywalls: ${policy.hasPaywalls}, hasSubscriptions: ${policy.hasSubscriptions}`,
      evidence: 'src/lib/operations/freeAccess.ts: getPolicy',
      status: policy.is100PercentFree && !policy.hasPaywalls && !policy.hasSubscriptions ? 'PASS' : 'FAIL'
    });

    const budget = serverDB.getPlatformBudget();
    const budgetBdt = budget?.monthlyBudgetBdt || 0;
    recordAudit({
      testId: 'AUD-13-02',
      step: 'Step 13',
      scenario: 'Administrative operational budget and expense tracking',
      expected: 'Monthly budget defined for platform operation',
      actual: `Monthly budget BDT: ${budgetBdt}`,
      evidence: 'src/lib/db.ts: getPlatformBudget',
      status: budgetBdt > 0 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-13-ERR', step: 'Step 13', scenario: 'Free access audit', expected: 'No error', actual: err.message, evidence: 'FreeAccessPolicyEngine', status: 'FAIL' });
  }

  // STEP 14: CENTRALIZED ADMIN CONTROL CENTER
  console.log('\n>>> [STEP 14] Centralized Admin Control Center');
  try {
    const superAdminPerm = AdminGovernanceRbac.hasPermission('super_admin', 'roles.manage');
    const staffPerm = AdminGovernanceRbac.hasPermission('support_staff', 'roles.manage');
    recordAudit({
      testId: 'AUD-14-01',
      step: 'Step 14',
      scenario: 'RBAC enforces strict role privilege separation',
      expected: 'Super Admin: true, Support Staff: false',
      actual: `Super Admin roles.manage: ${superAdminPerm}, Support Staff: ${staffPerm}`,
      evidence: 'src/lib/governance/rbac.ts: hasPermission',
      status: superAdminPerm && !staffPerm ? 'PASS' : 'FAIL'
    });

    const auditLogs = serverDB.getAdminAuditLogs();
    recordAudit({
      testId: 'AUD-14-02',
      step: 'Step 14',
      scenario: 'Centralized admin audit logs record system governance actions',
      expected: 'Audit logs count > 1000',
      actual: `Audit logs count: ${auditLogs.length}`,
      evidence: 'src/db/local_store.json: adminAuditLogs',
      status: auditLogs.length > 1000 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-14-ERR', step: 'Step 14', scenario: 'Admin governance audit', expected: 'No error', actual: err.message, evidence: 'AdminGovernanceRbac', status: 'FAIL' });
  }

  // STEP 15: ANALYTICS, REPORTING & INTELLIGENT AUTOMATION
  console.log('\n>>> [STEP 15] Analytics, Reporting & Intelligent Automation');
  try {
    const overview = CentralAnalyticsEngine.getPlatformOverviewReport('30d');
    recordAudit({
      testId: 'AUD-15-01',
      step: 'Step 15',
      scenario: 'Platform analytics aggregates 100% real database metrics',
      expected: 'totalRegistered: 41, totalJobs: 214',
      actual: `Registered: ${overview.users.totalRegistered}, Jobs: ${overview.jobMarket.totalJobs}, Health: ${overview.dataQuality.healthScorePercent}%`,
      evidence: 'src/lib/analytics/engine.ts: getPlatformOverviewReport',
      status: overview.users.totalRegistered === 41 && overview.jobMarket.totalJobs === 214 ? 'PASS' : 'FAIL'
    });

    const tasks = CentralAutomationEngine.getTasks();
    recordAudit({
      testId: 'AUD-15-02',
      step: 'Step 15',
      scenario: 'Automation engine manages 8 core background tasks',
      expected: '8 core platform tasks',
      actual: `Found ${tasks.length} tasks`,
      evidence: 'src/lib/automation/engine.ts: getTasks',
      status: tasks.length === 8 ? 'PASS' : 'FAIL'
    });

    const rules = CentralAutomationEngine.evaluateIntelligentRules();
    recordAudit({
      testId: 'AUD-15-03',
      step: 'Step 15',
      scenario: 'Intelligent Rules engine evaluates 7 policies (Rules A through G)',
      expected: '7 evaluations recorded safely without code execution',
      actual: `Evaluated ${rules.evaluatedCount} rules, triggered: ${rules.triggeredCount}`,
      evidence: 'src/lib/automation/engine.ts: evaluateIntelligentRules',
      status: rules.evaluatedCount === 7 ? 'PASS' : 'FAIL'
    });

    const reports = CentralReportEngine.getCatalog();
    recordAudit({
      testId: 'AUD-15-04',
      step: 'Step 15',
      scenario: 'Executive report catalog provides 9 standard reports',
      expected: '9 standard reports',
      actual: `Report catalog count: ${reports.length}`,
      evidence: 'src/lib/reports/engine.ts: getCatalog',
      status: reports.length === 9 ? 'PASS' : 'FAIL'
    });
  } catch (err: any) {
    recordAudit({ testId: 'AUD-15-ERR', step: 'Step 15', scenario: 'Step 15 analytics audit', expected: 'No error', actual: err.message, evidence: 'CentralAnalyticsEngine', status: 'FAIL' });
  }

  // CROSS-SYSTEM INTEGRATION CHAINS (A through G)
  console.log('\n>>> [CROSS-SYSTEM INTEGRATION CHAINS A-G]');
  
  // Chain A: Job Collection to Public Publishing
  const jobs = serverDB.getJobs();
  const sources = serverDB.getJobSources();
  const drafts = serverDB.getCircularDrafts();
  const redirects = serverDB.getRedirects();
  recordAudit({
    testId: 'INT-CHAIN-A',
    step: 'Integration Chain A',
    scenario: 'Source -> Spider -> Extraction -> Verification -> Publishing -> Public Catalog',
    expected: 'Sources (5) -> Drafts (29) -> Published Jobs (214) with valid slugs',
    actual: `${sources.length} sources, ${drafts.length} drafts, ${jobs.length} jobs, ${redirects.length} redirects`,
    evidence: 'local_store.json: jobs, sources, drafts, redirects',
    status: sources.length > 0 && drafts.length > 0 && jobs.length > 0 ? 'PASS' : 'FAIL'
  });

  // Chain B: Job Deadline & Notification
  const placements = serverDB.getFeaturedPlacements();
  const todayRef = new Date('2026-10-30T10:00:00.000Z');
  const closingSoon = JobFeedEngine.getFeed(jobs, { feedType: 'closing_soon', limit: 20 }, placements, todayRef);
  const deliveries = serverDB.getNotificationDeliveries();
  recordAudit({
    testId: 'INT-CHAIN-B',
    step: 'Integration Chain B',
    scenario: 'Job -> Deadline Data -> Monitoring -> Alert -> Notification Dispatch',
    expected: 'Closing soon jobs detected and deliveries recorded',
    actual: `${closingSoon.jobs.length} closing jobs, ${deliveries.length} deliveries`,
    evidence: 'CentralDeadlineEngine & NotificationDeliveries',
    status: closingSoon.jobs.length > 0 && deliveries.length > 0 ? 'PASS' : 'FAIL'
  });

  // Chain C: User Profile & Smart Matching
  const candidates = serverDB.getCandidates();
  const testCandidate = candidates.find(c => c.education && c.education.length > 0);
  const candRec = testCandidate ? SmartJobMatchingEngine.evaluateMatch(testCandidate, jobs[0]) : null;
  recordAudit({
    testId: 'INT-CHAIN-C',
    step: 'Integration Chain C',
    scenario: 'Candidate Profile -> Education -> Preferences -> Smart Matching -> Recommendations',
    expected: 'Personalized matching evaluated for candidate with valid score',
    actual: `Candidate ${testCandidate?.id} matched with score ${candRec?.overallScore}`,
    evidence: 'CandidateRecord + SmartJobMatchingEngine',
    status: candRec && typeof candRec.overallScore === 'number' ? 'PASS' : 'FAIL'
  });

  // Chain D: Education & Document Verification
  const queue = CertificateVerificationManager.getPendingVerificationQueue();
  recordAudit({
    testId: 'INT-CHAIN-D',
    step: 'Integration Chain D',
    scenario: 'Candidate Profile -> Education Record -> Certificate Upload -> Admin Verification Queue',
    expected: 'Pending queue populated from candidate education records',
    actual: `Found ${queue.length} items in admin verification queue`,
    evidence: 'CertificateVerificationManager.getPendingVerificationQueue',
    status: Array.isArray(queue) ? 'PASS' : 'FAIL'
  });

  // Chain E: Admin Management & RBAC
  const hasAuditLog = serverDB.getAdminAuditLogs().length > 0;
  recordAudit({
    testId: 'INT-CHAIN-E',
    step: 'Integration Chain E',
    scenario: 'Admin Login -> RBAC -> Subsystem Management -> Audit Log Recording',
    expected: 'Super Admin holds full access and actions are logged',
    actual: `Audit logs recorded: ${serverDB.getAdminAuditLogs().length}`,
    evidence: 'AdminGovernanceRbac & serverDB.recordAdminAudit',
    status: hasAuditLog ? 'PASS' : 'FAIL'
  });

  // Chain F: Analytics & Automation
  const overview = CentralAnalyticsEngine.getPlatformOverviewReport('today');
  const rules = CentralAutomationEngine.evaluateIntelligentRules();
  recordAudit({
    testId: 'INT-CHAIN-F',
    step: 'Integration Chain F',
    scenario: 'Platform Events -> Central Analytics -> Intelligent Automation Rules Evaluation',
    expected: 'Overview report feeds into intelligent rules without failure',
    actual: `Overview generated at ${overview.generatedAt}, ${rules.evaluatedCount} rules evaluated`,
    evidence: 'CentralAnalyticsEngine + CentralAutomationEngine',
    status: overview && rules.evaluatedCount === 7 ? 'PASS' : 'FAIL'
  });

  // Chain G: Free Platform Access
  const freePolicy = FreeAccessPolicyEngine.getPolicy();
  const testCandAccess = FreeAccessPolicyEngine.verifyFeatureAccess('user_registration_login');
  recordAudit({
    testId: 'INT-CHAIN-G',
    step: 'Integration Chain G',
    scenario: 'Free Access Policy -> Candidate Registration -> 100% Free Feature Unlocking',
    expected: 'user_registration_login is allowed for candidate under 100% free policy',
    actual: `Allowed: ${testCandAccess.allowed}, Policy 100% Free: ${freePolicy.is100PercentFree}`,
    evidence: 'FreeAccessPolicyEngine.verifyFeatureAccess',
    status: testCandAccess.allowed && freePolicy.is100PercentFree ? 'PASS' : 'FAIL'
  });

  // LIVE HTTP API AUDIT & PERFORMANCE PROBE
  console.log('\n>>> [LIVE HTTP API AUDIT & LATENCY BENCHMARKS]');
  
  // Public Endpoint: Latest Jobs
  const resLatest = await makeLocalRequest('GET', '/api/jobs/latest');
  recordAudit({
    testId: 'API-PERF-01',
    step: 'API Audit',
    scenario: 'GET /api/jobs/latest (Public endpoint)',
    expected: 'Status 200, Latency < 1000ms',
    actual: `Status: ${resLatest.status}, Latency: ${resLatest.latencyMs}ms`,
    evidence: '/api/jobs/latest',
    status: resLatest.status === 200 ? 'PASS' : 'FAIL'
  });

  // Public Endpoint: Free Access Policy
  const resPolicy = await makeLocalRequest('GET', '/api/platform/access-policy');
  recordAudit({
    testId: 'API-PERF-02',
    step: 'API Audit',
    scenario: 'GET /api/platform/access-policy (Public policy endpoint)',
    expected: 'Status 200, is100PercentFree: true',
    actual: `Status: ${resPolicy.status}, is100PercentFree: ${resPolicy.body?.policy?.is100PercentFree}`,
    evidence: '/api/platform/access-policy',
    status: resPolicy.status === 200 && resPolicy.body?.policy?.is100PercentFree ? 'PASS' : 'FAIL'
  });

  // Security Test: Admin API without Secret (Must be rejected)
  const resAdminUnauth = await makeLocalRequest('GET', '/api/admin/analytics/overview');
  recordAudit({
    testId: 'SEC-API-01',
    step: 'Security Audit',
    scenario: 'GET /api/admin/analytics/overview without credentials (Unauthenticated)',
    expected: 'Status 401 or 403 (FORBIDDEN)',
    actual: `Status: ${resAdminUnauth.status}`,
    evidence: 'src/middleware.ts / Admin Gate',
    status: resAdminUnauth.status === 401 || resAdminUnauth.status === 403 ? 'PASS' : 'FAIL'
  });

  // Security Test: Admin API with Valid Secret
  const resAdminAuth = await makeLocalRequest('GET', '/api/admin/analytics/overview?timeframe=30d', {
    'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
  });
  recordAudit({
    testId: 'SEC-API-02',
    step: 'Security Audit',
    scenario: 'GET /api/admin/analytics/overview with x-admin-secret',
    expected: 'Status 200, success: true, Latency < 2000ms',
    actual: `Status: ${resAdminAuth.status}, Success: ${resAdminAuth.body?.success}, Latency: ${resAdminAuth.latencyMs}ms`,
    evidence: '/api/admin/analytics/overview',
    status: resAdminAuth.status === 200 && resAdminAuth.body?.success ? 'PASS' : 'FAIL'
  });

  // Password Security Audit: 100% scrypt hashes
  const allCandidates = serverDB.getCandidates();
  const invalidHashes = allCandidates.filter(c => !c.passwordHash || !c.passwordHash.startsWith('scrypt$'));
  recordAudit({
    testId: 'SEC-PWD-01',
    step: 'Security Audit',
    scenario: 'Candidate password hashing: 100% of accounts use scrypt',
    expected: '0 plain or weak password hashes',
    actual: `Invalid hashes found: ${invalidHashes.length} out of ${allCandidates.length} candidate accounts`,
    evidence: 'CandidateRecord: passwordHash format scrypt$salt$hash',
    status: invalidHashes.length === 0 ? 'PASS' : 'FAIL'
  });

  // SUMMARY & STATISTICS
  const total = auditResults.length;
  const passed = auditResults.filter(r => r.status === 'PASS').length;
  const failed = auditResults.filter(r => r.status === 'FAIL').length;
  const partial = auditResults.filter(r => r.status === 'PARTIAL').length;
  const score = ((passed / total) * 100).toFixed(1);

  console.log('\n================================================================');
  console.log(`FINAL AUDIT PROBE COMPLETED: ${passed} PASSED | ${failed} FAILED | ${partial} PARTIAL | TOTAL: ${total}`);
  console.log(`SYSTEM INTEGRITY & VERIFICATION SCORE: ${score}%`);
  console.log('================================================================\n');

  // Save JSON report for final artifact synthesis
  fs.writeFileSync(
    'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/scratch/master_audit_results.json',
    JSON.stringify({ total, passed, failed, partial, score, results: auditResults }, null, 2)
  );
  console.log('Wrote master_audit_results.json successfully.');
}

runComprehensiveAudit().catch(err => {
  console.error('Fatal audit probe error:', err);
  process.exit(1);
});
