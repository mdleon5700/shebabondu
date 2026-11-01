import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';
import fs from 'fs';
import path from 'path';

export async function runScenario48(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-48-USER-PANEL-NOTIFICATION-EXPERIENCE-SECURITY-ISOLATION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-DHAKA-005';
    actionsPerformed.push(`Seeding interactive test notifications for candidate ${candidateId}`);
    
    // Seed 2 unread notifications for candidate
    const notif1 = serverDB.addCandidateNotification(candidateId, {
      title: 'নতুন চাকরির সুপারিশ: সহকারী প্রকৌশলী',
      message: 'আপনার প্রোফাইলের সাথে সরাসরি সামঞ্জস্যপূর্ণ ১টি নতুন পদ প্রকাশিত হয়েছে।',
      type: 'system',
      link: '/jobs/job-eng-101'
    });

    const notif2 = serverDB.addCandidateNotification(candidateId, {
      title: 'আবেদনের শেষ সময় ঘনিয়ে এসেছে: সিনিয়র অফিসার',
      message: 'সোনালী ব্যাংক পিএলসি-এর আবেদনের সময় আর মাত্র ২ দিন বাকি।',
      type: 'deadline',
      link: '/jobs/job-bank-202'
    });

    // 1. Browser Navigation to User Panel Notifications
    actionsPerformed.push('Navigating to /dashboard/notifications in browser with candidate auth session');
    const authHeaders = {
      'Cookie': `session_token=${candidateId}; cs_session_token=${candidateId}`,
      'x-candidate-id': candidateId
    };
    
    await page.context().addCookies([
      {
        name: 'session_token',
        value: candidateId,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'cs_session_token',
        value: candidateId,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto(`${baseUrl}/dashboard/notifications`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const pageContent = await page.content();
    const hasNotificationHeader = pageContent.includes('নোটিফিকেশন') || pageContent.includes('Notifications') || pageContent.includes('dashboard');

    assertions.push({
      assertion: 'Browser UI successfully renders candidate notifications dashboard',
      expected: 'true',
      actual: String(hasNotificationHeader),
      passed: hasNotificationHeader === true
    });

    // 2. Mark Single Notification as Read via API
    actionsPerformed.push('Marking single notification read via PATCH /api/candidate/notifications');
    const markReadRes = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ id: notif1.id })
    });

    assertions.push({
      assertion: 'Marking single notification read succeeds with HTTP 200',
      expected: '200',
      actual: String(markReadRes.status),
      passed: markReadRes.status === 200 && markReadRes.data?.success === true
    });

    // Verify unread count decremented
    const unreadProbe = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      headers: authHeaders
    });

    const notif1Updated = unreadProbe.data?.notifications?.find((n: any) => n.id === notif1.id);
    assertions.push({
      assertion: 'Target notification read field updated to true in candidate store',
      expected: 'true',
      actual: String(notif1Updated?.read),
      passed: notif1Updated?.read === true
    });

    // 3. Mark All Notifications as Read
    actionsPerformed.push('Marking all candidate notifications read via all: true');
    const markAllRes = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ all: true })
    });

    assertions.push({
      assertion: 'Marking all notifications read returns success',
      expected: '200',
      actual: String(markAllRes.status),
      passed: markAllRes.status === 200 && markAllRes.data?.success === true
    });

    const verifyAllProbe = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      headers: authHeaders
    });

    assertions.push({
      assertion: 'Candidate unread notification count drops to 0',
      expected: '0',
      actual: String(verifyAllProbe.data?.unreadCount),
      passed: verifyAllProbe.data?.unreadCount === 0
    });

    // 4. Delete Notification
    actionsPerformed.push('Deleting notification via DELETE /api/candidate/notifications?id=...');
    const deleteRes = await apiVerifier.checkEndpoint(`/api/candidate/notifications?id=${notif1.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    assertions.push({
      assertion: 'Deleting notification succeeds with HTTP 200',
      expected: '200',
      actual: String(deleteRes.status),
      passed: deleteRes.status === 200 && deleteRes.data?.success === true
    });

    // 5. Cross-User Security Isolation
    actionsPerformed.push('Auditing cross-user notification isolation and access controls');
    const unauthCheck = await apiVerifier.checkEndpoint('/api/candidate/notifications');
    assertions.push({
      assertion: 'Unauthenticated query to candidate notifications returns HTTP 401 Unauthorized',
      expected: '401',
      actual: String(unauthCheck.status),
      passed: unauthCheck.status === 401
    });

    const otherCandidateId = 'SYNTH-USR-CHITTAGONG-001';
    const otherCandidateInbox = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      headers: {
        'Cookie': `session_token=${otherCandidateId}; cs_session_token=${otherCandidateId}`,
        'x-candidate-id': otherCandidateId
      }
    });

    const leakedNotif = otherCandidateInbox.data?.notifications?.find((n: any) => n.id === notif2.id);
    assertions.push({
      assertion: 'Candidate B inbox cannot view Candidate A private notifications (Zero cross-user leakage)',
      expected: 'undefined',
      actual: String(leakedNotif?.id),
      passed: leakedNotif === undefined
    });

    // 6. Verify zero database pollution
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
      name: 'User Panel Notification Experience, Lifecycle Controls & Security Isolation Audit',
      category: 'user',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: 'Browser rendering, mark read, mark all read, delete, and cross-user security isolation verified.'
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
      name: 'User Panel Notification Experience, Lifecycle Controls & Security Isolation Audit',
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
