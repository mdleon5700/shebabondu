import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario54(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-54-APPLICATION-STATUS-NOTIFICATION-SYNCHRONIZATION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-CHITTAGONG-004';
    actionsPerformed.push(`Setting up application lifecycle test for ${candidateId}`);

    const targetApp = {
      id: 'SYNTH-APP-NOTIF-CTG-' + Date.now(),
      jobId: 'JOB-CTG-CUSTOMS-01',
      jobTitle: 'সহকারী রাজস্ব কর্মকর্তা (কাস্টমস)',
      organization: 'জাতীয় রাজস্ব বোর্ড (NBR)',
      postName: 'সহকারী রাজস্ব কর্মকর্তা',
      candidateName: 'আনিসুর রহমান',
      candidatePhone: '01889600004',
      candidateDistrict: 'চট্টগ্রাম',
      candidateId,
      date: new Date().toLocaleDateString('bn-BD'),
      totalAmount: 250,
      paymentMethod: 'bKash' as const,
      status: 'processing' as const,
      statusHistory: [
        {
          status: 'processing' as const,
          date: new Date().toISOString(),
          notes: 'আবেদনটি টেলিটক যাচাই প্রক্রিয়ায় রয়েছে।'
        }
      ]
    };
    serverDB.addApplication(candidateId, targetApp);

    // 1. Admin triggers status update to 'completed'
    actionsPerformed.push('Admin updates application status to completed');
    const adminHeaders = {
      'Content-Type': 'application/json',
      'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
    };

    const updateRes = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        applicationId: targetApp.id,
        status: 'completed',
        notes: 'আবেদনটি চূড়ান্তভাবে গৃহীত হয়েছে।'
      })
    });

    assertions.push({
      assertion: 'Admin PATCH status update succeeds',
      expected: '200',
      actual: String(updateRes.status),
      passed: updateRes.status === 200
    });

    // 2. Candidate Notification Inbox Check
    actionsPerformed.push('Checking candidate notification inbox for application status alert');
    const candHeaders = {
      'Cookie': `session_token=${candidateId}`,
      'x-candidate-id': candidateId
    };

    const notifRes = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
      headers: candHeaders
    });
    const notifications = notifRes.data?.notifications || [];
    const appNotif = notifications.find((n: any) => n.type === 'application' || n.link === '/dashboard/applications');

    assertions.push({
      assertion: 'In-app notification automatically dispatched to candidate on application status update',
      expected: 'true',
      actual: String(Boolean(appNotif)),
      passed: Boolean(appNotif)
    });

    assertions.push({
      assertion: 'Notification points to /dashboard/applications link',
      expected: '/dashboard/applications',
      actual: appNotif?.link || '',
      passed: appNotif?.link === '/dashboard/applications'
    });

    // 3. Mark notification as read
    if (appNotif) {
      actionsPerformed.push('Candidate marks application notification as read');
      const markReadRes = await apiVerifier.checkEndpoint('/api/candidate/notifications', {
        method: 'PATCH',
        headers: {
          ...candHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: appNotif.id, notificationId: appNotif.id,
          action: 'mark_read'
        })
      });

      assertions.push({
        assertion: 'Candidate can mark application notification as read',
        expected: '200',
        actual: String(markReadRes.status),
        passed: markReadRes.status === 200
      });
    }

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Application Status Notification Synchronization Audit',
      category: 'api',
      status: assertions.every(a => a.passed) ? 'PASS' : 'FAIL',
      durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
      actionsPerformed,
      assertions,
      errors
    };
  } catch (err: any) {
    errors.push({ type: 'interaction_failure', message: err.message, stack: err.stack, timestamp: new Date().toISOString() });
    return {
      scenarioId,
      startTime,
      name: 'Application Status Notification Synchronization Audit',
      category: 'api',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
