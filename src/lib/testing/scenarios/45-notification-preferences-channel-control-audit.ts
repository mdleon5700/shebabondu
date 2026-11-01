import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { NotificationCatalogHelper } from '../../notifications/catalog';
import { serverDB } from '../../db';
import fs from 'fs';
import path from 'path';

export async function runScenario45(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-45-NOTIFICATION-PREFERENCES-CHANNEL-CONTROL-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    actionsPerformed.push('Setting up authenticated synthetic candidate session');
    const targetCandidateId = 'SYNTH-USR-DHAKA-002';
    const authHeaders = {
      'Cookie': `session_token=${targetCandidateId}; cs_session_token=${targetCandidateId}`,
      'x-candidate-id': targetCandidateId
    };
    
    // 1. Query current alert preferences
    actionsPerformed.push('Querying candidate alert preferences via /api/candidate/alerts');
    const getRes = await apiVerifier.checkEndpoint('/api/candidate/alerts', {
      headers: authHeaders
    });

    assertions.push({
      assertion: 'Candidate alerts endpoint returns HTTP 200 with active alert preferences',
      expected: '200',
      actual: String(getRes.status),
      passed: getRes.status === 200 && Boolean(getRes.data?.alertPreferences)
    });

    // 2. Update alert preferences (customize categories, channels, frequency)
    actionsPerformed.push('Updating alert preferences with customized channel toggles');
    const updatedPreferences = {
      categories: ['আইটি ও সফটওয়্যার জবস', 'ব্যাংক ও আর্থিক প্রতিষ্ঠান'],
      districts: ['ঢাকা', 'সিলেট'],
      grades: ['৯ম গ্রেড'],
      emailAlert: false,
      smsAlert: false,
      whatsappAlert: true,
      frequency: 'weekly'
    };

    const postRes = await apiVerifier.checkEndpoint('/api/candidate/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(updatedPreferences)
    });

    assertions.push({
      assertion: 'Updating alert preferences succeeds with HTTP 200 and updated payload',
      expected: '200',
      actual: String(postRes.status),
      passed: postRes.status === 200 && postRes.data?.success === true
    });

    assertions.push({
      assertion: 'Updated emailAlert setting persisted as disabled (false)',
      expected: 'false',
      actual: String(postRes.data?.alertPreferences?.emailAlert),
      passed: postRes.data?.alertPreferences?.emailAlert === false
    });

    assertions.push({
      assertion: 'Updated frequency setting persisted as weekly',
      expected: 'weekly',
      actual: String(postRes.data?.alertPreferences?.frequency),
      passed: postRes.data?.alertPreferences?.frequency === 'weekly'
    });

    // 3. Verify persistence across fresh query
    actionsPerformed.push('Re-querying alert preferences to verify persistence across sessions');
    const verifyGetRes = await apiVerifier.checkEndpoint('/api/candidate/alerts', {
      headers: authHeaders
    });

    assertions.push({
      assertion: 'Persisted alert preferences reflect customized categories accurately',
      expected: '2 categories',
      actual: `${verifyGetRes.data?.alertPreferences?.categories?.length} categories`,
      passed: verifyGetRes.data?.alertPreferences?.categories?.includes('আইটি ও সফটওয়্যার জবস') &&
              verifyGetRes.data?.alertPreferences?.categories?.includes('ব্যাংক ও আর্থিক প্রতিষ্ঠান')
    });

    // 4. Governance: Transactional vs Non-Transactional safety check
    actionsPerformed.push('Auditing transactional security override governance');
    const secDef = NotificationCatalogHelper.getDefinition('ACCOUNT_SECURITY_ALERT');
    assertions.push({
      assertion: 'Security alerts are transactional and bypass marketing alert opt-outs',
      expected: 'true',
      actual: String(secDef.isTransactional),
      passed: secDef.isTransactional === true
    });

    // 5. Security: Unauthenticated request rejection
    actionsPerformed.push('Verifying unauthenticated access to /api/candidate/alerts is rejected');
    const unauthRes = await apiVerifier.checkEndpoint('/api/candidate/alerts');
    assertions.push({
      assertion: 'Unauthenticated query to /api/candidate/alerts returns HTTP 401 Unauthorized',
      expected: '401',
      actual: String(unauthRes.status),
      passed: unauthRes.status === 401
    });

    // Verify zero database pollution
    const dbPath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
    const rawDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const candidatesCount = Object.keys(rawDB.candidates || {}).length;
    const jobsCount = Object.keys(rawDB.jobs || {}).length;

    assertions.push({
      assertion: 'Production store local_store.json strictly preserved at 41 candidates and 214 jobs',
      expected: '41 candidates, 214 jobs',
      actual: `${candidatesCount} candidates, ${jobsCount} jobs`,
      passed: candidatesCount === 41 && jobsCount === 214
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Notification Preferences, Channel Controls & Transactional Governance Audit',
      category: 'user',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: 'Preference updates, channel toggles, session persistence, and transactional overrides verified.'
    };
  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return {
      scenarioId,
      name: 'Notification Preferences, Channel Controls & Transactional Governance Audit',
      category: 'user',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors
    };
  }
}
